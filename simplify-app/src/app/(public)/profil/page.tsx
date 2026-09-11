'use client';

import { useEffect, useState } from 'react';
import { usePublicAuth } from '@/contexts/PublicAuthContext';
import { useRouter } from 'next/navigation';
import { getBookmarkedBooks } from '@/actions/bookmarks';
import { BookOpen, Loader2, Bookmark as BookmarkIcon } from 'lucide-react';
import BookCard from '@/components/public/BookCard';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function ProfilPage() {
  const { user, loading: authLoading, logout } = usePublicAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const { bookmarkedIds } = useBookmarks();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/masuk');
      return;
    }

    getBookmarkedBooks(user.$id)
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayedBooks = books.filter(book => bookmarkedIds.includes(String(book.$id)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Profil Saya</h1>
          <p className="text-gray-500 mt-1">Selamat datang, {user.name}!</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push('/');
          }}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Keluar
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <BookmarkIcon className="w-5 h-5 text-primary-500" />
          Buku Tersimpan ({displayedBooks.length})
        </h2>

        {displayedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedBooks.map((book) => (
              <BookCard key={String(book.$id)} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 card">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Belum ada buku tersimpan</h3>
            <p className="text-gray-500 mt-1 mb-6 text-sm">
              Jelajahi katalog kami dan temukan ringkasan buku hukum yang menarik.
            </p>
            <button
              onClick={() => router.push('/katalog')}
              className="btn-primary inline-flex justify-center"
            >
              Mulai Eksplorasi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
