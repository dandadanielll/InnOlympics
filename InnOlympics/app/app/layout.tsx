import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });

export const metadata: Metadata = {
  title: 'Gabay — Your Filipino Healthcare Companion',
  description:
    'Hindi Ka Nag-iisa. Gabay guides you before, during, and after every healthcare encounter in the Philippines.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Gabay' },
};

export const viewport = {
  themeColor: '#7e2625',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tl" className={`${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-[#f2ecdc] font-sans antialiased">
        {/* Emergency banner — always visible */}
        <div className="bg-[#7e2625] text-white text-center text-sm py-2 px-4">
          🚨 Emergency? Call <a href="tel:911" className="font-bold underline">911</a> immediately.
        </div>
        {children}
      </body>
    </html>
  );
}
