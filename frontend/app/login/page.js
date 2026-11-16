'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { saveSession } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      saveSession(data);
      toast.success(`Selamat datang, ${data.user.full_name}`);

      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'kasir') router.push('/kasir');
      else router.push('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal masuk');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <section className="login-art-panel" aria-label="Selamat datang di Pajil Mart">
          <Link href="/" className="store-logo login-logo">
            <span className="store-logo-mark">P</span>
            <span>Pajil<span>Mart</span></span>
          </Link>
          <div className="login-art-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> SELAMAT DATANG KEMBALI</span>
            <h1>Belanja nyaman dimulai dari sini.</h1>
            <p>Masuk ke akunmu dan lanjutkan menemukan pilihan yang kamu suka.</p>
          </div>
          <div className="login-art-illustration" aria-hidden="true">
            <div className="login-art-ring" />
            <span className="login-art-sparkle sparkle-a">✦</span>
            <span className="login-art-sparkle sparkle-b">✳</span>
            <div className="login-art-bag">
              <span className="bag-handle" />
              <span className="bag-mark">P</span>
              <span className="bag-leaf leaf-a" />
              <span className="bag-leaf leaf-b" />
              <span className="bag-leaf leaf-c" />
            </div>
            <div className="login-art-caption">
              <span>Ruang untuk</span>
              <strong>pilihan favoritmu</strong>
            </div>
          </div>
          <p className="login-art-footer">Pilihan praktis, belanja nyaman.</p>
        </section>

        <section className="login-form-panel">
          <Link href="/" className="login-back-link">
            <span aria-hidden="true">←</span> Kembali ke toko
          </Link>
          <div className="login-form-content">
            <div className="login-mobile-brand store-logo">
              <span className="store-logo-mark">P</span>
              <span>Pajil<span>Mart</span></span>
            </div>
            <div className="login-heading">
              <span className="eyebrow login-eyebrow">AKUN PAJIL MART</span>
              <h2>Masuk ke akunmu</h2>
              <p>Senang melihatmu kembali. Masukkan detail akunmu untuk lanjut.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                required
              />

              <button type="submit" disabled={loading} className="login-submit">
                {loading ? 'Memproses...' : 'Masuk'}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>
            </form>

            <p className="login-register-prompt">
              Belum punya akun?{' '}
              <Link href="/register">Daftar di sini</Link>
            </p>
            <p className="login-cashier-note">Akun kasir dibuatkan oleh admin toko.</p>
          </div>
          <p className="login-legal">Dengan masuk, kamu siap belanja lebih nyaman bersama kami.</p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <label className="block">
      <span className="login-field-label">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="login-field-input"
        autoComplete={type === 'email' ? 'email' : 'current-password'}
      />
    </label>
  );
}
