'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import NavigationDrawer from '../components/NavigationDrawer';
import { getCurrentUser } from '../lib/auth';
import { useCart } from '../components/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const user = typeof window !== 'undefined' ? getCurrentUser() : null;
  const { totalItems } = useCart();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (activeCategory) params.category_id = activeCategory;
    api
      .get('/products', { params })
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }, [search, activeCategory]);

  const featuredProduct = products[0];

  return (
    <main className="storefront min-h-screen pb-24 md:pb-12">
      <header className="store-header">
        <div className="store-header-inner">
          <Link href="/" className="store-logo" aria-label="Pajil Mart, beranda">
            <span className="store-logo-mark">P</span>
            <span>Pajil<span>Mart</span></span>
          </Link>

          <NavigationDrawer />

          <div className="header-actions">
            {user ? (
              <Link href="/profile" className="account-link">
                <span className="account-avatar">{user.full_name?.[0] || 'A'}</span>
                <span className="account-name">{user.full_name?.split(' ')[0] || 'Akun'}</span>
              </Link>
            ) : (
              <Link href="/login" className="sign-in-link">Masuk</Link>
            )}
            <Link href="/cart" className="header-cart" aria-label={`Keranjang, ${totalItems} barang`}>
              <CartIcon />
              <span className="cart-label">Keranjang</span>
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      <div className="store-content">
        <section className="welcome-line">
          <p>Halo{user ? `, ${user.full_name?.split(' ')[0] || ''}` : ''} <span aria-hidden="true">✦</span></p>
        </section>

        <section className="hero-panel" aria-label="Tentang Pajil Mart">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> BELANJA JADI LEBIH MUDAH</span>
            <h1>Temukan yang kamu suka, <em>setiap hari.</em></h1>
            <p>Pilihan produk istimewa untuk menemani hari-harimu. Temukan favoritmu di Pajil Mart.</p>
            <a href="#produk" className="hero-button">
              Jelajahi produk <span aria-hidden="true">↗</span>
            </a>
            <div className="hero-note">
              <span className="hero-note-icon">✓</span>
              Pilihan praktis, belanja nyaman
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-sparkle sparkle-one">✳</div>
            <div className="hero-sparkle sparkle-two">✦</div>
            {featuredProduct?.image_url ? (
              <div className="hero-product-image">
                <Image
                  src={featuredProduct.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 40vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="hero-product-placeholder"><span>✿</span></div>
            )}
            <div className="hero-product-tag">
              <span>Temukan pilihanmu</span>
              <strong>Untuk hari yang lebih baik</strong>
            </div>
            <span className="hero-floating-dot" />
          </div>
        </section>

        <section className="store-benefits" aria-label="Keunggulan Pajil Mart">
          <Benefit icon="✧" title="Pilihan beragam" subtitle="Banyak yang bisa ditemukan" />
          <Benefit icon="♡" title="Belanja nyaman" subtitle="Mudah dari mana saja" />
          <Benefit icon="↗" title="Praktis & cepat" subtitle="Favoritmu tinggal klik" />
        </section>

        <section className="catalog-section" id="produk">
          <div className="catalog-heading">
            <div>
              <span className="eyebrow catalog-eyebrow">DIPILIH UNTUKMU</span>
              <h2>Jelajahi produk</h2>
              <p>Temukan sesuatu yang pas untukmu.</p>
            </div>
            <div className="search-box">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                aria-label="Cari produk"
              />
              {search && (
                <button onClick={() => setSearch('')} className="clear-search" aria-label="Hapus pencarian">
                  ×
                </button>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="category-row" id="kategori" aria-label="Filter kategori">
              <button
                onClick={() => setActiveCategory(null)}
                className={`category-chip ${!activeCategory ? 'selected' : ''}`}
                aria-pressed={!activeCategory}
              >
                Semua produk
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`category-chip ${activeCategory === category.id ? 'selected' : ''}`}
                  aria-pressed={activeCategory === category.id}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="product-skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <span>⌕</span>
              <p>{search ? 'Produk tidak ditemukan.' : 'Belum ada produk untuk ditampilkan.'}</p>
              {search && <button onClick={() => setSearch('')}>Hapus pencarian</button>}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </section>

        <footer className="store-footer">
          <Link href="/" className="store-logo">
            <span className="store-logo-mark">P</span>
            <span>Pajil<span>Mart</span></span>
          </Link>
          <p>Temukan yang kamu suka, setiap hari.</p>
        </footer>
      </div>

      <BottomNav />
    </main>
  );
}

function Benefit({ icon, title, subtitle }) {
  return (
    <div className="benefit-item">
      <span className="benefit-icon" aria-hidden="true">{icon}</span>
      <div><strong>{title}</strong><span>{subtitle}</span></div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}
