'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Search, Menu, X, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';
import { usePublicAuth } from '@/contexts/PublicAuthContext';

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = usePublicAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Katalog Buku', href: '/katalog' },
    { label: 'Kategori', href: '/kategori' },
    { label: 'Tentang', href: '/tentang-kami' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm leading-tight block">Simplify Library</span>
              <span className="text-[10px] text-gray-400 leading-tight block hidden sm:block">
                Simpel dibaca, Simpel dicerna
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Free Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              100% Terbuka &amp; Gratis
            </div>

            {/* Auth Link */}
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/profil"
                    className="hidden md:inline-flex items-center gap-1.5 btn-primary text-xs px-4 py-2 bg-white text-primary-600 border border-primary-200 hover:bg-primary-50"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Profil Saya
                  </Link>
                ) : (
                  <Link
                    href="/masuk"
                    className="hidden md:inline-flex btn-primary text-xs px-4 py-2"
                  >
                    Masuk
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                <Link
                  href="/profil"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 mt-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium text-center"
                >
                  Profil Saya
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                    router.push('/');
                  }}
                  className="w-full block px-4 py-2.5 mt-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/masuk"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 mt-2 bg-primary-600 text-white rounded-lg text-sm font-medium text-center"
              >
                Masuk / Daftar
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
