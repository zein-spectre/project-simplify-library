'use client';

import { useState } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { useBookmarks } from '@/contexts/BookmarkContext';

export default function BookCardBookmarkButton({ bookId }: { bookId: string }) {
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
      // Error is already handled in context
    } finally {
      setIsToggling(false);
    }
  };

  if (loadingBookmarks) {
    return (
      <button className="flex-shrink-0 flex items-center justify-center p-2 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed border border-transparent h-[34px] w-[34px]">
        <Loader2 className="w-4 h-4 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`flex-shrink-0 flex items-center justify-center p-2 rounded-md border transition-all h-[34px] w-[34px] ${
        isBookmarked
          ? 'bg-primary-50 border-primary-200 text-primary-600 hover:bg-primary-100'
          : 'bg-white border-gray-200 text-gray-400 hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50/50'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      title={isBookmarked ? 'Hapus dari Tersimpan' : 'Simpan Buku'}
      aria-label={isBookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
    >
      {isToggling ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
      )}
    </button>
  );
}
