'use client';

import { useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function BookmarkButton({ bookId }: { bookId: string }) {
  const { bookmarkedIds, loadingBookmarks, toggleBookmark } = useBookmarks();
  const [isToggling, setIsToggling] = useState(false);

  const isBookmarked = bookmarkedIds.includes(bookId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isToggling) return;

    setIsToggling(true);
    try {
      await toggleBookmark(bookId);
    } catch (error) {
      // Error is handled in context
    } finally {
      setIsToggling(false);
    }
  };

  if (loadingBookmarks) {
    return (
      <button className="p-2 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed">
        <Loader2 className="w-5 h-5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`p-2 rounded-xl border transition-all ${
        isBookmarked
          ? 'bg-primary-50 border-primary-200 text-primary-600 hover:bg-primary-100'
          : 'bg-white border-gray-200 text-gray-400 hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50/50'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      title={isBookmarked ? 'Hapus dari Tersimpan' : 'Simpan Buku'}
      aria-label={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
    >
      {isToggling ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
      )}
    </button>
  );
}
