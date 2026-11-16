import { Inter, Sora } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '../components/CartContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', weight: ['600', '700'] });

export const metadata = {
  title: 'Pajil Mart',
  description: 'Platform belanja online dengan kasir toko terintegrasi',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans bg-canvas text-ink min-h-screen">
        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js'}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
        <CartProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
        </CartProvider>
      </body>
    </html>
  );
}
