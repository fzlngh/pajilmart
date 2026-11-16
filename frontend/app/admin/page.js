'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatRupiah } from '../../lib/format';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => ['paid', 'processing', 'completed'].includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const posOrders = orders.filter((o) => o.source === 'pos').length;

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-5">Ringkasan Toko</h1>

      {loading ? (
        <p className="text-sm text-ink/40">Memuat data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total Pendapatan" value={formatRupiah(totalRevenue)} accent />
          <StatCard label="Total Pesanan" value={totalOrders} />
          <StatCard label="Menunggu Pembayaran" value={pendingOrders} />
          <StatCard label="Transaksi Kasir (POS)" value={posOrders} />
        </div>
      )}

      <div className="mt-8">
        <h2 className="font-semibold text-sm mb-3">Pesanan Terbaru</h2>
        <div className="space-y-2">
          {orders.slice(0, 5).map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-black/5 p-3 flex justify-between text-sm">
              <div>
                <p className="font-medium">{o.order_code}</p>
                <p className="text-ink/40 text-xs">{o.source === 'pos' ? 'Kasir' : 'Online'} · {o.status}</p>
              </div>
              <p className="font-semibold text-brand-700">{formatRupiah(o.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`rounded-2xl p-4 ${accent ? 'bg-brand-500 text-white' : 'bg-white border border-black/5'}`}>
      <p className={`text-xs ${accent ? 'text-white/80' : 'text-ink/50'}`}>{label}</p>
      <p className="font-display font-bold text-lg mt-1">{value}</p>
    </div>
  );
}
