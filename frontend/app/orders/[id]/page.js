'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TopBar from '../../../components/TopBar';
import api from '../../../lib/api';
import { formatRupiah } from '../../../lib/format';
import { STATUS_LABEL, STATUS_COLOR } from '../../../lib/statusLabels';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  async function load() {
    const { data } = await api.get(`/orders/${id}`);
    setOrder(data.order);
  }

  useEffect(() => {
    load();
    // Poll status tiap 5 detik selama masih pending (menunggu webhook Midtrans)
    const interval = setInterval(() => {
      load();
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!order) {
    return (
      <main className="max-w-app mx-auto min-h-screen">
        <TopBar title="Detail Pesanan" back="/orders" />
      </main>
    );
  }

  return (
    <main className="max-w-app mx-auto min-h-screen pb-10">
      <TopBar title={order.order_code} back="/orders" />

      <div className="px-4 pt-4 space-y-4">
        <section className="bg-white rounded-2xl border border-black/5 p-4 text-center">
          <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <p className="font-display font-bold text-2xl mt-2 text-brand-700">{formatRupiah(order.total)}</p>
          {order.status === 'pending' && (
            <p className="text-[11px] text-ink/40 mt-1">Status akan diperbarui otomatis setelah pembayaran diterima.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-black/5 p-4">
          <h2 className="text-sm font-semibold mb-2">Produk</h2>
          <ul className="space-y-1.5">
            {order.order_items.map((it) => (
              <li key={it.id} className="flex justify-between text-sm text-ink/60">
                <span>{it.qty}x {it.product_name}</span>
                <span>{formatRupiah(it.subtotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {order.shipping_address && (
          <section className="bg-white rounded-2xl border border-black/5 p-4">
            <h2 className="text-sm font-semibold mb-1">Alamat Pengiriman</h2>
            <p className="text-sm text-ink/60">{order.shipping_address}</p>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-black/5 p-4 text-sm text-ink/50">
          <p>Kode pesanan: {order.order_code}</p>
          <p>Metode pembayaran: {order.payment_method || '-'}</p>
          <p>Dibuat: {new Date(order.created_at).toLocaleString('id-ID')}</p>
        </section>
      </div>
    </main>
  );
}
