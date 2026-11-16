require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Client dengan SERVICE ROLE KEY -> dipakai di backend untuk operasi
// admin (create user tanpa email verifikasi, bypass RLS, dsb).
// JANGAN PERNAH expose service role key ke frontend.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = { supabaseAdmin };
