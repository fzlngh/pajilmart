'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffNavigationDrawer from '../../components/StaffNavigationDrawer';
import { isLoggedIn, getCurrentUser } from '../../lib/auth';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn() || getCurrentUser()?.role !== 'admin') {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="staff-layout min-h-screen">
      <header className="staff-header">
        <div className="staff-header-inner">
          <Link href="/admin" className="store-logo">
            <span className="store-logo-mark">P</span>
            <span>Pajil<span>Mart</span></span>
          </Link>
          <div className="staff-header-title">
            <span className="staff-role-mark">A</span>
            <span>Admin Toko</span>
          </div>
          <StaffNavigationDrawer role="admin" />
        </div>
      </header>

      <main className="staff-main">
        <div className="staff-main-inner">{children}</div>
      </main>
    </div>
  );
}
