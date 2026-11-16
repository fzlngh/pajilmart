'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { useCart } from '../../components/CartContext';
import { formatRupiah } from '../../lib/format';
import { isLoggedIn } from '../../lib/auth';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQty, removeItem, totalPrice } = useCart();
  const router = useRouter();

  function handleCheckout() {
    if (!isLoggedIn()) {
      toast.error('Masuk terlebih dahulu untuk checkout');
      router.push('/login');
      return;
    }
    router.push('/checkout');
  }

  return (
    <main className="max-w-app mx-auto min-h-screen pb-32">
      <TopBar title="Keranjang" />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-6 py-24">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-ink/60 text-sm">Keranjang belanjamu masih kosong</p>
          <Link href="/" className="mt-4 text-brand-600 text-sm font-medium border border-brand-500 rounded-full px-4 py-2">
            Mulai belanja
          </Link>
        </div>
      ) : (
        <div className="px-4 pt-3 space-y-3">
          {items.map((item) => (
            <div key={item.product_id} className="bg-white rounded-2xl border border-black/5 p-3 flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-canvas shrink-0">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                <p className="text-brand-700 font-semibold text-sm mt-0.5">{formatRupiah(item.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-black/10 rounded-full">
                    <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-7 h-7 text-sm">
                      −
                    </button>
                    <span className="w-6 text-center text-xs">{item.qty}</span>
                    <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-7 h-7 text-sm">
                      +
                    </button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="text-[11px] text-red-500">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 max-w-app mx-auto bg-white border-t border-black/5 p-4"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          <div className="flex justify-between text-sm mb-3">
            <span className="text-ink/50">Total belanja</span>
            <span className="font-display font-bold text-brand-700">{formatRupiah(totalPrice)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-brand-500 text-white rounded-full py-3 text-sm font-medium"
          >
            Checkout
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
