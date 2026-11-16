'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { formatRupiah } from '../../../lib/format';
import { STATUS_LABEL, STATUS_COLOR } from '../../../lib/statusLabels';

const statusOptions = ['pending', 'paid', 'processing', 'completed', 'cancelled', 'expired'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');

  async function loadOrders() {
    const params = {};
    if (filter) params.status = filter;
    const { data } = await api.get('/orders', { params });
    setOrders(data.orders);
  }

  useEffect(() => {
    loadOrders();
  }, [filter]);

  async function handleStatusChange(id, status) {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success('Status diperbarui');
      loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal memperbarui status');
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-4">Semua Pesanan</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
        <button
          onClick={() => setFilter('')}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${!filter ? 'bg-brand-500 text-white' : 'bg-white border border-black/10 text-ink/60'}`}
        >
          Semua
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filter === s ? 'bg-brand-500 text-white' : 'bg-white border border-black/10 text-ink/60'}`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold">{o.order_code}</p>
                <p className="text-[11px] text-ink/40 mt-0.5">
                  {o.source === 'pos' ? 'Kasir (POS)' : 'Online'} · {o.profiles?.full_name || 'Pembeli'} ·{' '}
                  {new Date(o.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
            </div>
            <p className="text-sm text-ink/50 mt-2">{o.order_items?.length || 0} produk</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-brand-700 font-display font-semibold">{formatRupiah(o.total)}</p>
              <select
                value={o.status}
                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                className="text-xs border border-black/10 rounded-full px-2.5 py-1 bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-ink/40 text-center py-10">Tidak ada pesanan.</p>}
      </div>
    </div>
  );
}
