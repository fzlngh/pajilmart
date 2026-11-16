'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TopBar from '../../components/TopBar';
import { useCart } from '../../components/CartContext';
import { formatRupiah } from '../../lib/format';
import api from '../../lib/api';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    if (!address.trim()) {
      toast.error('Alamat pengiriman wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        shipping_address: address,
        notes,
      };
      const { data } = await api.post('/orders/checkout', payload);

      if (typeof window.snap === 'undefined') {
        toast.error('Midtrans Snap belum siap, muat ulang halaman');
        setLoading(false);
        return;
      }

      // window.snap.pay menampilkan popup Midtrans dengan SEMUA metode
      // pembayaran yang aktif (QRIS, VA semua bank, GoPay, ShopeePay,
      // kartu kredit/debit, Indomaret/Alfamart, dsb) — pembeli tinggal pilih.
      window.snap.pay(data.snap_token, {
        onSuccess: () => {
          clearCart();
          toast.success('Pembayaran berhasil!');
          router.push(`/orders/${data.order.id}`);
        },
        onPending: () => {
          clearCart();
          toast('Menunggu pembayaran...', { icon: '⏳' });
          router.push(`/orders/${data.order.id}`);
        },
        onError: () => {
          toast.error('Pembayaran gagal, silakan coba lagi');
        },
        onClose: () => {
          toast('Kamu belum menyelesaikan pembayaran', { icon: 'ℹ️' });
          router.push(`/orders/${data.order.id}`);
        },
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-app mx-auto min-h-screen pb-32">
      <TopBar title="Checkout" back="/cart" />

      <div className="px-4 pt-4 space-y-4">
        <section className="bg-white rounded-2xl border border-black/5 p-4">
          <h2 className="text-sm font-semibold mb-2">Ringkasan Pesanan</h2>
          <ul className="space-y-1.5">
            {items.map((i) => (
              <li key={i.product_id} className="flex justify-between text-sm text-ink/60">
                <span className="line-clamp-1">{i.qty}x {i.name}</span>
                <span className="shrink-0 ml-2">{formatRupiah(i.qty * i.price)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-black/5 mt-3 pt-3 flex justify-between font-semibold text-sm">
            <span>Total</span>
            <span className="text-brand-700">{formatRupiah(totalPrice)}</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-black/5 p-4 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Alamat pengiriman</span>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Nama jalan, nomor rumah, kota, kode pos"
              className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Catatan (opsional)</span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: titip di satpam"
              className="mt-1 w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
            />
          </label>
        </section>

        <p className="text-[11px] text-ink/40 text-center px-2">
          Semua metode pembayaran tersedia: QRIS, transfer bank/VA, GoPay, ShopeePay,
          kartu kredit/debit, hingga Indomaret/Alfamart.
        </p>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-app mx-auto bg-white border-t border-black/5 p-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
      >
        <button
          onClick={handlePay}
          disabled={loading || items.length === 0}
          className="w-full bg-brand-500 disabled:opacity-60 text-white rounded-full py-3 text-sm font-medium"
        >
          {loading ? 'Memproses...' : `Bayar ${formatRupiah(totalPrice)}`}
        </button>
      </div>
    </main>
  );
}
