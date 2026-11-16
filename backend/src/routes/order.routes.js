const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabaseClient');
const { snap } = require('../config/midtransClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function generateOrderCode(prefix = 'ORD') {
  const stamp = Date.now().toString().slice(-8);
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

/**
 * Helper bersama: validasi item, hitung total, kurangi stok, simpan order.
 * items = [{ product_id, qty }]
 */
async function buildOrderFromItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw { status: 400, message: 'Keranjang tidak boleh kosong' };
  }

  const productIds = items.map((i) => i.product_id);
  const { data: products, error } = await supabaseAdmin
    .from('products')
    .select('id, name, price, stock')
    .in('id', productIds);

  if (error) throw { status: 500, message: error.message };

  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id);
    if (!product) throw { status: 400, message: `Produk tidak ditemukan: ${item.product_id}` };
    if (product.stock < item.qty) {
      throw { status: 400, message: `Stok ${product.name} tidak mencukupi (sisa ${product.stock})` };
    }
    const itemSubtotal = Number(product.price) * Number(item.qty);
    subtotal += itemSubtotal;
    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      qty: item.qty,
      subtotal: itemSubtotal,
    });
  }

  return { orderItems, subtotal, products };
}

async function decrementStock(orderItems) {
  for (const item of orderItems) {
    const { data: current } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single();
    if (current) {
      await supabaseAdmin
        .from('products')
        .update({ stock: Math.max(0, current.stock - item.qty) })
        .eq('id', item.product_id);
    }
  }
}

/**
 * POST /api/orders/checkout  (CUSTOMER)
 * Body: { items: [{product_id, qty}], shipping_address, notes }
 * -> membuat order 'pending' + snap_token Midtrans (semua metode pembayaran)
 */
router.post('/checkout', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { items, shipping_address, notes } = req.body;
    const { orderItems, subtotal } = await buildOrderFromItems(items);
    const total = subtotal; // tambahkan ongkir/diskon di sini jika perlu
    const order_code = generateOrderCode('ONL');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code,
        customer_id: req.profile.id,
        source: 'online',
        status: 'pending',
        subtotal,
        total,
        shipping_address: shipping_address || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) return res.status(500).json({ message: orderError.message });

    const itemsWithOrderId = orderItems.map((it) => ({ ...it, order_id: order.id }));
    const { error: itemsError } = await supabaseAdmin.from('order_items').insert(itemsWithOrderId);
    if (itemsError) return res.status(500).json({ message: itemsError.message });

    // Buat transaksi Midtrans Snap -> tanpa enabled_payments artinya
    // SEMUA metode pembayaran yang aktif di akun Midtrans akan muncul
    // (QRIS, VA semua bank, GoPay, ShopeePay, kartu kredit, retail, dll)
    const snapTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: order.id, // dipakai sebagai referensi unik ke Midtrans
        gross_amount: Math.round(total),
      },
      customer_details: {
        first_name: req.profile.full_name,
        email: req.user.email,
        phone: req.profile.phone || undefined,
      },
      item_details: orderItems.map((it) => ({
        id: it.product_id,
        name: it.product_name.slice(0, 50),
        price: Math.round(Number(it.price)),
        quantity: it.qty,
      })),
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/${order.id}`,
      },
    });

    await supabaseAdmin
      .from('orders')
      .update({ snap_token: snapTransaction.token })
      .eq('id', order.id);

    return res.status(201).json({
      order: { ...order, snap_token: snapTransaction.token },
      snap_token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
    });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Checkout gagal' });
  }
});

/**
 * POST /api/orders/pos  (KASIR)
 * Transaksi kasir di toko. payment_method: 'cash' (langsung lunas)
 * atau 'midtrans' (pembeli bayar via QRIS/EDC/dll lewat Snap).
 */
router.post('/pos', requireAuth, requireRole('kasir', 'admin'), async (req, res) => {
  try {
    const { items, payment_method, customer_name, customer_phone } = req.body;
    const { orderItems, subtotal } = await buildOrderFromItems(items);
    const total = subtotal;
    const order_code = generateOrderCode('POS');

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_code,
        cashier_id: req.profile.id,
        source: 'pos',
        status: payment_method === 'cash' ? 'paid' : 'pending',
        payment_method: payment_method === 'cash' ? 'cash' : null,
        subtotal,
        total,
        paid_at: payment_method === 'cash' ? new Date().toISOString() : null,
        notes: customer_name ? `Pembeli: ${customer_name}` : null,
      })
      .select()
      .single();

    if (orderError) return res.status(500).json({ message: orderError.message });

    const itemsWithOrderId = orderItems.map((it) => ({ ...it, order_id: order.id }));
    await supabaseAdmin.from('order_items').insert(itemsWithOrderId);

    if (payment_method === 'cash') {
      // tunai langsung lunas -> kurangi stok sekarang
      await decrementStock(orderItems);
      return res.status(201).json({ order, message: 'Transaksi tunai berhasil dicatat' });
    }

    // Non-tunai lewat kasir (mis. pembeli scan QRIS di kasir) -> tetap via Midtrans Snap
    const snapTransaction = await snap.createTransaction({
      transaction_details: { order_id: order.id, gross_amount: Math.round(total) },
      customer_details: { first_name: customer_name || 'Pembeli', phone: customer_phone || undefined },
      item_details: orderItems.map((it) => ({
        id: it.product_id,
        name: it.product_name.slice(0, 50),
        price: Math.round(Number(it.price)),
        quantity: it.qty,
      })),
    });

    await supabaseAdmin.from('orders').update({ snap_token: snapTransaction.token }).eq('id', order.id);

    return res.status(201).json({
      order: { ...order, snap_token: snapTransaction.token },
      snap_token: snapTransaction.token,
    });
  } catch (err) {
    console.error('pos order error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Transaksi gagal' });
  }
});

/** GET /api/orders/me -> riwayat pesanan customer yang login */
router.get('/me', requireAuth, requireRole('customer'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', req.profile.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ orders: data });
});

/** GET /api/orders/:id -> detail satu order (pemilik, kasir terkait, atau admin) */
router.get('/:id', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', req.params.id)
    .single();
  if (error || !data) return res.status(404).json({ message: 'Order tidak ditemukan' });

  const isOwner = data.customer_id === req.profile.id;
  const isStaff = ['admin', 'kasir'].includes(req.profile.role);
  if (!isOwner && !isStaff) return res.status(403).json({ message: 'Tidak memiliki akses' });

  return res.json({ order: data });
});

/** GET /api/orders -> semua order (ADMIN & KASIR, untuk dashboard/riwayat) */
router.get('/', requireAuth, requireRole('admin', 'kasir'), async (req, res) => {
  const { status, source } = req.query;
  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*), profiles:customer_id(full_name)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (source) query = query.eq('source', source);

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ orders: data });
});

/** PATCH /api/orders/:id/status -> admin/kasir update status manual (mis. processing -> completed) */
router.patch('/:id/status', requireAuth, requireRole('admin', 'kasir'), async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'paid', 'processing', 'completed', 'cancelled', 'expired'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Status tidak valid' });

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ order: data });
});

module.exports = router;
