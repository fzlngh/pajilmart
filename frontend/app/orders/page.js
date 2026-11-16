'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import api from '../../lib/api';
import { formatRupiah } from '../../lib/format';
import { isLoggedIn } from '../../lib/auth';
import { STATUS_LABEL, STATUS_COLOR } from '../../lib/statusLabels';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    api
      .get('/orders/me')
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="max-w-app mx-auto min-h-screen pb-24">
      <TopBar title="Pesanan Saya" />

      <div className="px-4 pt-3 space-y-3">
        {loading ? (
          <p className="text-center text-ink/40 text-sm py-16">Memuat...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-ink/40 text-sm py-16">Belum ada pesanan.</p>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="block bg-white rounded-2xl border border-black/5 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">{o.order_code}</p>
                  <p className="text-[11px] text-ink/40 mt-0.5">
                    {new Date(o.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status]}`}>
                  {STATUS_LABEL[o.status]}
                </span>
              </div>
              <p className="text-sm text-ink/50 mt-2">{o.order_items?.length || 0} produk</p>
              <p className="text-brand-700 font-display font-semibold mt-1">{formatRupiah(o.total)}</p>
            </Link>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}
