'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../lib/auth';

const adminLinks = [
  { href: '/admin', label: 'Ringkasan', icon: DashboardIcon },
  { href: '/admin/products', label: 'Produk', icon: ProductsIcon },
  { href: '/admin/kasir', label: 'Kelola kasir', icon: StaffIcon },
  { href: '/admin/orders', label: 'Pesanan', icon: OrdersIcon },
  { href: '/kasir', label: 'Kasir POS', icon: StoreIcon },
];

const cashierLinks = [
  { href: '/kasir', label: 'Kasir POS', icon: DashboardIcon },
  { href: '/', label: 'Toko online', icon: StoreIcon },
];

export default function StaffNavigationDrawer({ role = 'kasir' }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const drawerRef = useRef(null);
  const isAdmin = role === 'admin';
  const links = isAdmin ? adminLinks : cashierLinks;
  const title = isAdmin ? 'Navigasi admin' : 'Navigasi kasir';

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
        className="drawer-trigger staff-drawer-trigger"
        aria-label={`Buka ${title.toLowerCase()}`}
        aria-expanded={open}
        aria-controls="staff-navigation-drawer"
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
            id="staff-navigation-drawer"
            className="navigation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-drawer-title"
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
              <span className="eyebrow">{isAdmin ? 'ADMIN TOKO' : 'KASIR TOKO'}</span>
              <h2 id="staff-drawer-title">{isAdmin ? 'Kelola tokomu.' : 'Siap melayani.'}</h2>
            </div>

            <nav className="drawer-links" aria-label={title}>
              {links.map((link) => {
                const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
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
                    <span className="drawer-arrow" aria-hidden="true">›</span>
                  </Link>
                );
              })}
            </nav>

            <div className="drawer-bottom staff-drawer-bottom">
              <button type="button" className="staff-logout" onClick={logout}>
                <LogoutIcon />
                <span>Keluar dari akun</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>;
}

function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>;
}

function DashboardIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></svg>;
}

function ProductsIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m3 7 9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10" strokeLinejoin="round" /></svg>;
}

function StaffIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20c.7-3.1 2.7-4.7 6-4.7s5.3 1.6 6 4.7M16 5.3a3 3 0 0 1 0 5.7M17 15.5c2.1.5 3.4 2 4 4.5" strokeLinecap="round" /></svg>;
}

function OrdersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" /></svg>;
}

function StoreIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 10v10h16V10M3 4h18l1 5a3 3 0 0 1-5 2 3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-5-2zM9 20v-6h6v6" strokeLinejoin="round" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
