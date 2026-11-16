const express = require('express');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabaseClient');

const router = express.Router();

/**
 * POST /api/payment/notification
 * Webhook resmi Midtrans (daftarkan URL ini di Dashboard Midtrans >
 * Settings > Configuration > Payment Notification URL).
 * Menangani SEMUA metode pembayaran (VA, QRIS, GoPay, ShopeePay,
 * kartu kredit, retail/cstore, dsb) karena semua mengirim payload yang
 * sama lewat endpoint notifikasi ini.
 */
router.post('/notification', async (req, res) => {
  try {
    const body = req.body;
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status, payment_type } = body;

    // Verifikasi signature agar notifikasi benar-benar dari Midtrans
    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + process.env.MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (expectedSignature !== signature_key) {
      return res.status(403).json({ message: 'Signature tidak valid' });
    }

    let newStatus = null;
    if (transaction_status === 'capture') {
      newStatus = fraud_status === 'accept' ? 'paid' : 'pending';
    } else if (transaction_status === 'settlement') {
      newStatus = 'paid';
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    } else if (transaction_status === 'deny' || transaction_status === 'cancel') {
      newStatus = 'cancelled';
    } else if (transaction_status === 'expire') {
      newStatus = 'expired';
    }

    if (!newStatus) return res.status(200).json({ message: 'Status diabaikan' });

    const updates = {
      status: newStatus,
      payment_method: payment_type,
      midtrans_transaction_id: body.transaction_id,
    };
    if (newStatus === 'paid') updates.paid_at = new Date().toISOString();

    const { data: order } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', order_id)
      .select('*, order_items(*)')
      .single();

    // Saat pertama kali lunas, kurangi stok produk
    if (order && newStatus === 'paid') {
      for (const item of order.order_items) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();
        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ stock: Math.max(0, product.stock - item.qty) })
            .eq('id', item.product_id);
        }
      }
    }

    return res.status(200).json({ message: 'Notifikasi diproses' });
  } catch (err) {
    console.error('midtrans notification error:', err);
    return res.status(500).json({ message: 'Gagal memproses notifikasi' });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Dipakai frontend untuk polling status pembayaran terbaru dari order.
 */
router.get('/status/:orderId', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, status, payment_method, paid_at')
    .eq('id', req.params.orderId)
    .single();
  if (error) return res.status(404).json({ message: 'Order tidak ditemukan' });
  return res.json({ order: data });
});

module.exports = router;
