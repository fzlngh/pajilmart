'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import TopBar from '../../../components/TopBar';
import { formatRupiah } from '../../../lib/format';
import { useCart } from '../../../components/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data.product));
  }, [id]);

  if (!product) {
    return (
      <main className="max-w-app mx-auto min-h-screen">
        <TopBar title="Memuat..." back="/" />
      </main>
    );
  }

  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    addItem(product, qty);
    toast.success('Ditambahkan ke keranjang');
  }

  function handleBuyNow() {
    addItem(product, qty);
    router.push('/cart');
  }

  return (
    <main className="max-w-app mx-auto min-h-screen pb-28">
      <TopBar title={product.name} back="/" />

      <div className="relative aspect-square bg-white">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink/30 text-sm">Tanpa foto</div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="font-display text-2xl font-bold text-brand-700">{formatRupiah(product.price)}</p>
          <h1 className="text-base font-semibold mt-1">{product.name}</h1>
          {product.categories?.name && (
            <span className="inline-block mt-1 text-[11px] text-ink/50 bg-black/5 px-2 py-0.5 rounded-full">
              {product.categories.name}
            </span>
          )}
        </div>

        <p className="text-sm text-ink/40">
          Stok tersedia: <span className={outOfStock ? 'text-red-500' : 'text-ink/60'}>{product.stock}</span>
        </p>

        {product.description && (
          <div>
            <h2 className="text-sm font-semibold mb-1">Deskripsi</h2>
            <p className="text-sm text-ink/60 leading-relaxed">{product.description}</p>
          </div>
        )}

        {!outOfStock && (
          <div className="flex items-center gap-3 pt-1">
            <span className="text-sm text-ink/60">Jumlah</span>
            <div className="flex items-center border border-black/10 rounded-full">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 text-lg">
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="w-9 h-9 text-lg"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-app mx-auto bg-white border-t border-black/5 p-3
                   flex gap-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 border border-brand-500 text-brand-600 disabled:opacity-40 rounded-full
                     py-3 text-sm font-medium"
        >
          + Keranjang
        </button>
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex-1 bg-brand-500 disabled:bg-ink/15 text-white rounded-full py-3 text-sm font-medium"
        >
          Beli Sekarang
        </button>
      </div>
    </main>
  );
}
