'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registrasi berhasil, silakan masuk');
      router.push('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell register-shell">
        <section className="login-art-panel" aria-label="Bergabung dengan Pajil Mart">
          <Link href="/" className="store-logo login-logo">
            <span className="store-logo-mark">P</span>
            <span>Pajil<span>Mart</span></span>
          </Link>
          <div className="login-art-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> MULAI PERJALANANMU</span>
            <h1>Temukan favoritmu, dengan cara yang lebih mudah.</h1>
            <p>Buat akun Pajil Mart untuk menikmati pengalaman belanja yang nyaman dan praktis.</p>
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
              <span>Mulai dari sini</span>
              <strong>Belanja lebih nyaman</strong>
            </div>
          </div>
          <p className="login-art-footer">Pilihan praktis, belanja nyaman.</p>
        </section>

        <section className="login-form-panel register-form-panel">
          <Link href="/" className="login-back-link">
            <span aria-hidden="true">←</span> Kembali ke toko
          </Link>
          <div className="login-form-content register-form-content">
            <Link href="/" className="login-mobile-brand store-logo">
              <span className="store-logo-mark">P</span>
              <span>Pajil<span>Mart</span></span>
            </Link>
            <div className="login-heading">
              <span className="eyebrow login-eyebrow">AKUN PAJIL MART</span>
              <h2>Buat akun baru</h2>
              <p>Daftar sebagai pelanggan, gratis dan cepat.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form register-form">
              <Field
                label="Nama lengkap"
                value={form.full_name}
                onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
                required
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                required
                autoComplete="email"
              />
              <Field
                label="No. HP"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                autoComplete="tel"
              />
              <Field
                label="Password"
                type="password"
                value={form.password}
                onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                required
                autoComplete="new-password"
                hint="Minimal 6 karakter"
              />

              <button type="submit" disabled={loading} className="login-submit">
                {loading ? 'Memproses...' : 'Buat akun'}
                {!loading && <span aria-hidden="true">↗</span>}
              </button>
            </form>

            <p className="login-register-prompt">
              Sudah punya akun?{' '}
              <Link href="/login">Masuk</Link>
            </p>
          </div>
          <p className="login-legal">Akun pelangganmu siap untuk menemani belanja.</p>
        </section>
      </div>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, required, autoComplete, hint }) {
  return (
    <label className="block">
      <span className="login-field-label">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="login-field-input"
      />
      {hint && <span className="login-field-hint">{hint}</span>}
    </label>
  );
}
