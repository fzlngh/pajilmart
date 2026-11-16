'use client';
import Link from 'next/link';
import NavigationDrawer from './NavigationDrawer';

export default function TopBar({ title, back, right }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-black/5 max-w-app mx-auto"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center gap-3 px-4 h-14">
        {back && (
          <Link href={back} className="-ml-1 p-1.5 text-ink/70" aria-label="Kembali">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        <h1 className="font-display font-semibold text-[17px] flex-1 truncate">{title}</h1>
        <NavigationDrawer />
        {right}
      </div>
    </header>
  );
}
