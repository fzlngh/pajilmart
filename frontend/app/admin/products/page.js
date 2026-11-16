'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatRupiah } from '../../../lib/format';

const emptyForm = { id: null, name: '', description: '', price: '', stock: '', category_id: '', image: null };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    const { data } = await api.get('/products', { params: { limit: 100 } });
    setProducts(data.products);
  }

  useEffect(() => {
    loadProducts();
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setPreview(null);
    setShowForm(true);
  }

  function openEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category_id: p.category_id || '',
      image: null,
    });
    setPreview(p.image_url);
    setShowForm(true);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      if (form.category_id) fd.append('category_id', form.category_id);
      if (form.image) fd.append('image', form.image);

      if (form.id) {
        await api.put(`/products/${form.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk diperbarui');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Produk ditambahkan');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Produk dihapus');
    loadProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-bold text-xl">Kelola Produk</h1>
        <button onClick={openCreate} className="bg-brand-500 text-white text-sm font-medium rounded-full px-4 py-2">
          + Tambah
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
            <div className="relative aspect-square bg-canvas">
              {p.image_url ? (
                <Image src={p.image_url} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink/30 text-xs">Tanpa foto</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-1">{p.name}</p>
              <p className="text-brand-700 text-sm font-semibold mt-0.5">{formatRupiah(p.price)}</p>
              <p className="text-[11px] text-ink/40">Stok: {p.stock}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(p)} className="flex-1 text-xs font-medium border border-black/10 rounded-full py-1.5">
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 text-xs font-medium text-red-500 border border-red-200 rounded-full py-1.5">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3"
          >
            <h2 className="font-display font-semibold text-lg">{form.id ? 'Edit Produk' : 'Tambah Produk'}</h2>

            <label className="block">
              <span className="text-xs font-medium text-ink/60">Foto produk</span>
              <div className="mt-1 flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl bg-canvas overflow-hidden border border-black/10 shrink-0">
                  {preview && <Image src={preview} alt="preview" fill className="object-cover" />}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs" />
              </div>
            </label>

            <Field label="Nama produk" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Deskripsi</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Harga (Rp)" type="number" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
              <Field label="Stok" type="number" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} required />
            </div>
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Kategori</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-black/10 rounded-full py-2.5 text-sm font-medium">
                Batal
              </button>
              <button type="submit" disabled={saving} className="flex-1 bg-brand-500 text-white rounded-full py-2.5 text-sm font-medium disabled:opacity-60">
                {saving ? 'Menyimpan...' : 'Simpan'}
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
