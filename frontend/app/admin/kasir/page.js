'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

const emptyForm = { full_name: '', email: '', phone: '', password: '' };

export default function AdminKasirPage() {
  const [kasirList, setKasirList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadKasir() {
    const { data } = await api.get('/auth/kasir');
    setKasirList(data.kasir);
  }

  useEffect(() => {
    loadKasir();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/auth/kasir', form);
      toast.success('Akun kasir berhasil dibuat');
      setForm(emptyForm);
      setShowForm(false);
      loadKasir();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal membuat akun kasir');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus akun kasir ini? Kasir tidak bisa login lagi.')) return;
    await api.delete(`/auth/kasir/${id}`);
    toast.success('Akun kasir dihapus');
    loadKasir();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl">Kelola Kasir</h1>
          <p className="text-xs text-ink/40 mt-0.5">Hanya admin yang bisa menambahkan akun kasir.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-brand-500 text-white text-sm font-medium rounded-full px-4 py-2">
          + Tambah
        </button>
      </div>

      <div className="space-y-2">
        {kasirList.length === 0 && <p className="text-sm text-ink/40">Belum ada akun kasir.</p>}
        {kasirList.map((k) => (
          <div key={k.id} className="bg-white rounded-2xl border border-black/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{k.full_name}</p>
              <p className="text-xs text-ink/40">{k.phone || '-'}</p>
            </div>
            <button onClick={() => handleDelete(k.id)} className="text-xs text-red-500 font-medium">
              Hapus
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 space-y-3"
          >
            <h2 className="font-display font-semibold text-lg">Tambah Akun Kasir</h2>
            <Field label="Nama lengkap" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required />
            <Field label="No. HP" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field label="Password sementara" type="password" value={form.password} onChange={(v) => setForm((f) => ({ ...f, password: v }))} required />

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-black/10 rounded-full py-2.5 text-sm font-medium">
                Batal
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-brand-500 text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Buat Akun'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, required }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/60">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </label>
  );
}
