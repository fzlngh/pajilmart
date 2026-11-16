'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

const links = [
  { href: '/', label: 'Beranda', icon: HomeIcon },
  { href: '/#produk', label: 'Jelajahi produk', icon: SearchIcon },
  { href: '/cart', label: 'Keranjang', icon: CartIcon },
  { href: '/orders', label: 'Pesanan saya', icon: OrderIcon },
  { href: '/profile', label: 'Akun saya', icon: UserIcon },
];

export default function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems } = useCart();
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll('a[href], button:not([disabled])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="drawer-trigger"
        aria-label="Buka navigasi"
        aria-expanded={open}
        aria-controls="store-navigation-drawer"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
        <span>Menu</span>
      </button>

      {open && (
        <div className="drawer-layer">
          <button
            type="button"
            className="drawer-backdrop"
            aria-label="Tutup navigasi"
            onClick={() => setOpen(false)}
          />
          <aside
            ref={drawerRef}
            id="store-navigation-drawer"
            className="navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="drawer-topline">
              <Link href="/" className="store-logo" onClick={() => setOpen(false)}>
                <span className="store-logo-mark">P</span>
                <span>Pajil<span>Mart</span></span>
              </Link>
              <button
                ref={closeRef}
                type="button"
                className="drawer-close"
                aria-label="Tutup navigasi"
                onClick={() => setOpen(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="drawer-intro">
              <span className="eyebrow">PAJIL MART</span>
              <h2 id="drawer-title">Mau ke mana hari ini?</h2>
            </div>

            <nav className="drawer-links" aria-label="Navigasi toko">
              {links.map((link) => {
                const active = link.href === '/'
                  ? pathname === '/'
                  : link.href === '/#produk'
                    ? false
                    : pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`drawer-link ${active ? 'active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <Icon />
                    <span>{link.label}</span>
                    {link.href === '/cart' && totalItems > 0 && (
                      <span className="drawer-count">{totalItems}</span>
                    )}
                    <span className="drawer-arrow" aria-hidden="true">›</span>
                  </Link>
                );
              })}
            </nav>

            <div className="drawer-bottom">
              <span className="drawer-bottom-mark" aria-hidden="true">✦</span>
              <p>Temukan yang kamu suka, setiap hari.</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" /></svg>;
}

function SearchIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" strokeLinecap="round" /></svg>;
}

function CartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>;
}

function OrderIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" /></svg>;
}

function UserIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="8" r="3.3" /><path d="M5 20c1.3-3.5 4-5.2 7-5.2s5.7 1.7 7 5.2" strokeLinecap="round" /></svg>;
}
