const express = require('express');
const { supabaseAdmin } = require('../config/supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrasi PELANGGAN (customer) secara mandiri.
 * Tidak memakai flow email-confirmation Supabase: user dibuat lewat
 * Admin API dengan email_confirm:true sehingga langsung bisa login.
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // langsung aktif, tanpa email verifikasi
      user_metadata: { full_name },
    });

    if (createError) {
      const msg = createError.message?.includes('already registered')
        ? 'Email sudah terdaftar'
        : createError.message;
      return res.status(400).json({ message: msg });
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: created.user.id,
      full_name,
      phone: phone || null,
      role: 'customer',
    });

    if (profileError) {
      // rollback user auth jika insert profile gagal
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ message: 'Gagal membuat profil: ' + profileError.message });
    }

    return res.status(201).json({ message: 'Registrasi berhasil, silakan login' });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * POST /api/auth/login
 * Dipakai oleh customer, kasir, maupun admin.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error || !data?.session) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(500).json({ message: 'Profil pengguna tidak ditemukan' });
    }

    return res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: profile,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', requireAuth, async (req, res) => {
  return res.json({ message: 'Berhasil logout' });
});

/**
 * GET /api/auth/me
 * Mengambil profil user yang sedang login (dipakai frontend saat refresh halaman)
 */
router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.profile });
});

/**
 * POST /api/auth/kasir
 * HANYA ADMIN yang boleh membuat akun kasir baru.
 * Kasir tidak bisa mendaftar sendiri lewat /register.
 */
router.post('/kasir', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      const msg = createError.message?.includes('already registered')
        ? 'Email sudah terdaftar'
        : createError.message;
      return res.status(400).json({ message: msg });
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: created.user.id,
      full_name,
      phone: phone || null,
      role: 'kasir',
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return res.status(500).json({ message: 'Gagal membuat akun kasir: ' + profileError.message });
    }

    return res.status(201).json({ message: 'Akun kasir berhasil dibuat' });
  } catch (err) {
    console.error('create kasir error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

/**
 * GET /api/auth/kasir  -> daftar semua kasir (untuk admin)
 */
router.get('/kasir', requireAuth, requireRole('admin'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, phone, created_at')
    .eq('role', 'kasir')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ message: error.message });
  return res.json({ kasir: data });
});

/**
 * DELETE /api/auth/kasir/:id -> nonaktifkan / hapus akun kasir (admin only)
 */
router.delete('/kasir/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return res.status(500).json({ message: error.message });
  await supabaseAdmin.from('profiles').delete().eq('id', id);
  return res.json({ message: 'Akun kasir dihapus' });
});

module.exports = router;
