'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import { getCurrentUser, logout, isLoggedIn } from '../../lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    setUser(getCurrentUser());
  }, [router]);

  if (!user) return null;

  return (
    <main className="max-w-app mx-auto min-h-screen pb-24">
      <TopBar title="Akun Saya" />

      <div className="px-4 pt-4 space-y-4">
        <section className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-display font-bold text-lg">
            {user.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{user.full_name}</p>
            <p className="text-[11px] text-ink/40">{user.phone || 'Belum ada no. HP'}</p>
          </div>
        </section>

        <button
          onClick={logout}
          className="w-full bg-white border border-red-200 text-red-500 rounded-2xl py-3 text-sm font-medium"
        >
          Keluar
        </button>
      </div>

      <BottomNav />
    </main>
  );
}
