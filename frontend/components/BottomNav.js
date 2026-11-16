'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './CartContext';

const tabs = [
  { href: '/', label: 'Beranda', icon: HomeIcon },
  { href: '/cart', label: 'Keranjang', icon: CartIcon },
  { href: '/orders', label: 'Pesanan', icon: OrderIcon },
  { href: '/profile', label: 'Akun', icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav className="mobile-bottom-nav" aria-label="Navigasi bawah">
      <ul className="mobile-bottom-nav-list">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(`${tab.href}/`));
          const Icon = tab.icon;
          return (
            <li key={tab.href} className="mobile-bottom-nav-item">
              <Link
                href={tab.href}
                className={`mobile-bottom-nav-link ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="mobile-bottom-nav-icon"><Icon active={active} /></span>
                <span className="mobile-bottom-nav-label">{tab.label}</span>
                {tab.href === '/cart' && totalItems > 0 && (
                  <span className="mobile-cart-count">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <span className="mobile-home-indicator" aria-hidden="true" />
    </nav>
  );
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function CartIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function OrderIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </svg>
  );
}
function UserIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5 20c1.3-3.5 4-5.2 7-5.2s5.7 1.7 7 5.2" strokeLinecap="round" />
    </svg>
  );
}
