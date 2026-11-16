const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * requireAuth: memverifikasi Bearer token (access_token dari Supabase Auth)
 * yang dikirim client, lalu melampirkan req.user & req.profile (berisi role).
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(401).json({ message: 'Profil pengguna tidak ditemukan' });
    }

    req.user = data.user;
    req.profile = profile; // { id, full_name, role, phone, ... }
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan autentikasi' });
  }
}

/**
 * requireRole: whitelist role yang boleh mengakses route.
 * Contoh: requireRole('admin') atau requireRole('admin', 'kasir')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke fitur ini' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
