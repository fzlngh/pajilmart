const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'product-images';

async function uploadImage(file) {
  if (!file) return null;
  const ext = file.originalname.split('.').pop();
  const fileName = `${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });

  if (error) throw new Error('Gagal upload gambar: ' + error.message);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * GET /api/products  -> publik (katalog pembeli & kasir)
 * query: ?search=&category_id=&page=&limit=
 */
router.get('/', async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 20 } = req.query;
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*, categories(id, name)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('name', `%${search}%`);
    if (category_id) query = query.eq('category_id', category_id);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ message: error.message });

    return res.json({ products: data, total: count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/** GET /api/products/:id */
router.get('/:id', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*, categories(id, name)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ message: 'Produk tidak ditemukan' });
  return res.json({ product: data });
});

/**
 * POST /api/products -> ADMIN ONLY, dengan upload foto (field: "image")
 */
router.post('/', requireAuth, requireRole('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Nama dan harga produk wajib diisi' });
    }

    const image_url = await uploadImage(req.file);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description: description || null,
        price: Number(price),
        stock: Number(stock) || 0,
        category_id: category_id || null,
        image_url,
        created_by: req.profile.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    return res.status(201).json({ product: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/**
 * PUT /api/products/:id -> ADMIN ONLY, bisa update foto juga
 */
router.put('/:id', requireAuth, requireRole('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category_id, is_active } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (stock !== undefined) updates.stock = Number(stock);
    if (category_id !== undefined) updates.category_id = category_id || null;
    if (is_active !== undefined) updates.is_active = is_active === 'true' || is_active === true;

    if (req.file) {
      updates.image_url = await uploadImage(req.file);
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });
    return res.json({ product: data });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/** DELETE /api/products/:id -> ADMIN ONLY (soft delete) */
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: false })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ message: 'Produk dihapus' });
});

module.exports = router;
