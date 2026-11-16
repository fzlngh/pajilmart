const express = require('express');
const { supabaseAdmin } = require('../config/supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin.from('categories').select('*').order('name');
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ categories: data });
});

router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  const { data, error } = await supabaseAdmin.from('categories').insert({ name }).select().single();
  if (error) return res.status(500).json({ message: error.message });
  return res.status(201).json({ category: data });
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ message: error.message });
  return res.json({ message: 'Kategori dihapus' });
});

module.exports = router;
