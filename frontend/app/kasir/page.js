'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { formatRupiah } from '../../lib/format';
import { getCurrentUser, isLoggedIn } from '../../lib/auth';
import StaffNavigationDrawer from '../../components/StaffNavigationDrawer';

export default function KasirPOSPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]); // [{product_id, name, price, qty, stock}]
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) return router.replace('/login');
    const user = getCurrentUser();
    if (!['kasir', 'admin'].includes(user?.role)) return router.replace('/login');
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    api.get('/products', { params: { search, limit: 50 } }).then((res) => setProducts(res.data.products));
  }, [ready, search]);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.error('Stok tidak mencukupi');
          return prev;
        }
        return prev.map((i) => (i.product_id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      if (product.stock <= 0) {
        toast.error('Stok habis');
        return prev;
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, qty: 1, stock: product.stock }];
    });
  }

  function updateQty(product_id, qty) {
    setCart((prev) =>
      prev.map((i) => (i.product_id === product_id ? { ...i, qty: Math.max(0, Math.min(qty, i.stock)) } : i)).filter((i) => i.qty > 0)
    );
  }

  const total = useMemo(() => cart.reduce((sum, i) => sum + i.qty * Number(i.price), 0), [cart]);

  async function handlePay(method) {
    if (cart.length === 0) return;
    setPaying(true);
    try {
      const payload = {
        items: cart.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        payment_method: method,
        customer_name: customerName || 'Pembeli Langsung',
      };
      const { data } = await api.post('/orders/pos', payload);

      if (method === 'cash') {
        toast.success(`Transaksi tunai berhasil — ${formatRupiah(total)}`);
        setCart([]);
        setCustomerName('');
        setShowPayment(false);
        api.get('/products', { params: { search, limit: 50 } }).then((res) => setProducts(res.data.products));
        return;
      }

      // Pembayaran non-tunai lewat Midtrans Snap (QRIS/EDC virtual, dsb)
      if (typeof window.snap === 'undefined') {
        toast.error('Midtrans Snap belum siap, muat ulang halaman');
        return;
      }
      window.snap.pay(data.snap_token, {
        onSuccess: () => {
          toast.success('Pembayaran berhasil');
          setCart([]);
          setCustomerName('');
          setShowPayment(false);
        },
        onPending: () => {
          toast('Menunggu pembayaran pembeli...', { icon: '⏳' });
          setShowPayment(false);
        },
        onError: () => toast.error('Pembayaran gagal'),
        onClose: () => toast('Pembayaran dibatalkan pembeli', { icon: 'ℹ️' }),
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Transaksi gagal');
    } finally {
      setPaying(false);
    }
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen md:flex">
      {/* Panel produk */}
      <div className="flex-1 min-w-0 pb-56 md:pb-6">
        <header className="kasir-header sticky top-0 z-20 bg-white border-b border-black/5 px-4 py-3"
                 style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="store-logo-mark kasir-logo-mark">P</span>
              <div>
                <h1 className="font-display font-bold text-base">Kasir — POS</h1>
                <p className="kasir-header-subtitle">Pajil Mart</p>
              </div>
            </div>
            <StaffNavigationDrawer role={getCurrentUser()?.role} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full bg-canvas border border-black/10 rounded-full py-2 px-4 text-sm outline-none"
          />
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className="bg-white rounded-2xl border border-black/5 overflow-hidden text-left disabled:opacity-40"
            >
              <div className="relative aspect-square bg-canvas">
                {p.image_url && <Image src={p.image_url} alt={p.name} fill className="object-cover" />}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                <p className="text-brand-700 text-sm font-semibold">{formatRupiah(p.price)}</p>
                <p className="text-[10px] text-ink/40">Stok {p.stock}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Panel keranjang (bottom sheet di mobile, sidebar di desktop) */}
      <aside
        className="fixed bottom-0 left-0 right-0 md:static md:w-80 bg-white border-t md:border-t-0 md:border-l
                   border-black/5 rounded-t-3xl md:rounded-none max-h-[55vh] md:max-h-screen md:h-screen
                   flex flex-col z-20"
      >
        <div className="p-4 border-b border-black/5">
          <h2 className="font-semibold text-sm">Keranjang Transaksi</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <p className="text-xs text-ink/40 text-center py-6">Pilih produk untuk mulai transaksi</p>
          ) : (
            cart.map((i) => (
              <div key={i.product_id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium line-clamp-1">{i.name}</p>
                  <p className="text-[11px] text-ink/40">{formatRupiah(i.price)}</p>
                </div>
                <div className="flex items-center border border-black/10 rounded-full shrink-0">
                  <button onClick={() => updateQty(i.product_id, i.qty - 1)} className="w-6 h-6 text-xs">−</button>
                  <span className="w-5 text-center text-[11px]">{i.qty}</span>
                  <button onClick={() => updateQty(i.product_id, i.qty + 1)} className="w-6 h-6 text-xs">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-black/5 space-y-2"
             style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="text-brand-700 font-display">{formatRupiah(total)}</span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-brand-500 disabled:opacity-50 text-white rounded-full py-2.5 text-sm font-medium"
          >
            Bayar
          </button>
        </div>
      </aside>

      {showPayment && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPayment(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-3">
            <h3 className="font-display font-semibold text-lg">Pilih Pembayaran</h3>
            <p className="text-brand-700 font-bold text-xl">{formatRupiah(total)}</p>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nama pembeli (opsional)"
              className="w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand-500"
            />

            <button
              onClick={() => handlePay('cash')}
              disabled={paying}
              className="w-full border border-brand-500 text-brand-600 rounded-full py-3 text-sm font-medium disabled:opacity-50"
            >
              💵 Tunai
            </button>
            <button
              onClick={() => handlePay('midtrans')}
              disabled={paying}
              className="w-full bg-brand-500 text-white rounded-full py-3 text-sm font-medium disabled:opacity-50"
            >
              💳 Non-Tunai (QRIS / Kartu / E-Wallet)
            </button>
            <button onClick={() => setShowPayment(false)} className="w-full text-xs text-ink/40 py-1">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
