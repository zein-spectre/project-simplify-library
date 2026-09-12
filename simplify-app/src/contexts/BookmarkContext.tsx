'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePublicAuth } from '@/contexts/PublicAuthContext';
import { getUserBookmarkBookIds, toggleBookmark as toggleBookmarkAction } from '@/actions/bookmarks';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, LogIn, X } from 'lucide-react';

interface BookmarkContextType {
  bookmarkedIds: string[];
  loadingBookmarks: boolean;
  toggleBookmark: (bookId: string) => Promise<boolean>;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = usePublicAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  // States for Custom Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;

    // Jangan fetch bookmark jika sedang berada di area admin
    if (pathname?.startsWith('/admin')) {
      setLoadingBookmarks(false);
      return;
    }

    if (!user) {
      setBookmarkedIds([]);
      setLoadingBookmarks(false);
      return;
    }

    setLoadingBookmarks(true);
    getUserBookmarkBookIds(user.$id)
      .then(setBookmarkedIds)
      .catch((err) => {
        console.error('Error fetching bookmarks:', err);
        setBookmarkedIds([]);
      })
      .finally(() => setLoadingBookmarks(false));
  }, [user, authLoading, pathname]);

  const toggleBookmark = async (bookId: string): Promise<boolean> => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }

    try {
      const res = await toggleBookmarkAction(user.$id, bookId);
      
      if (res.error) {
        console.error('Server Action Error:', res.error);
        setErrorMessage(`Gagal: ${res.error}`);
        return false;
      }

      if (res.bookmarked) {
        setBookmarkedIds((prev) => [...prev, bookId]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== bookId));
      }
      return !!res.bookmarked;
    } catch (error: any) {
      console.error('Error toggling bookmark:', error);
      setErrorMessage('Terjadi kesalahan saat menyimpan buku. Coba lagi nanti.');
      return false;
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, loadingBookmarks, toggleBookmark }}>
      {children}

      {/* Custom Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <LogIn className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Harus Masuk</h3>
              <p className="text-sm text-gray-500 mb-6">
                Anda harus memiliki akun dan masuk terlebih dahulu untuk dapat menyimpan buku ke daftar favorit.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <Link
                  href="/masuk"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl text-center transition-colors shadow-sm shadow-primary-200"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pemberitahuan</h3>
              <p className="text-sm text-gray-500 mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => setErrorMessage('')}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-black rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks harus digunakan di dalam BookmarkProvider');
  return ctx;
}
