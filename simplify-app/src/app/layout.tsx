import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { PublicAuthProvider } from '@/contexts/PublicAuthContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Simplify Library',
    default: 'Simplify Library — Sederhanakan Narasi, Percepat Pemahaman',
  },
  description:
    'Platform baca digital yang mengubah buku-buku hukum menjadi ringkasan terstruktur yang mudah dan cepat dipahami. Gratis untuk semua.',
  keywords: ['buku hukum', 'ringkasan hukum', 'simplify library', 'mahasiswa hukum', 'baca hukum'],
  openGraph: {
    title: 'Simplify Library',
    description: 'Sederhanakan narasi, percepat pemahaman hukum.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900" suppressHydrationWarning>
        <AuthProvider>
          <PublicAuthProvider>
            <BookmarkProvider>{children}</BookmarkProvider>
          </PublicAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
