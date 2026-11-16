'use client';
import Image from 'next/image';
import Link from 'next/link';
import { formatRupiah } from '../lib/format';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const outOfStock = product.stock <= 0;

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan`);
  }

  return (
    <article className="product-card">
      <Link href={`/product/${product.id}`} className="product-image-link" aria-label={`Lihat ${product.name}`}>
      <div className="product-image">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw" className="object-cover" />
        ) : (
          <div className="product-no-image">Tanpa foto</div>
        )}
        {outOfStock && (
          <span className="stock-badge">
            Stok habis
          </span>
        )}
      </div>
      </Link>
      <div className="product-info">
        <Link href={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <p className="product-price">
          {formatRupiah(product.price)}
        </p>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="product-add-button"
        >
          {outOfStock ? 'Stok habis' : <><span aria-hidden="true">+</span> Tambah ke keranjang</>}
        </button>
      </div>
    </article>
  );
}
