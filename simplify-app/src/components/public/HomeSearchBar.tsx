'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { searchBooksSuggestion, BookSuggestion } from '@/actions/search';
import Link from 'next/link';

export default function HomeSearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchBooksSuggestion(query);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      router.push(`/katalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 bg-white border-2 border-primary-100 rounded-xl px-2 py-2 sm:px-5 sm:py-3.5 shadow-md hover:border-primary-300 hover:shadow-lg transition-all focus-within:border-primary-500 focus-within:shadow-lg">
        <div className="flex-1 flex items-center gap-3 w-full pl-2 sm:pl-0">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
            placeholder="Cari judul buku, penulis..."
            className="flex-1 outline-none text-gray-700 bg-transparent text-sm w-full min-w-[200px]"
            autoComplete="off"
          />
          {isLoading && <Loader2 className="w-4 h-4 text-primary-500 animate-spin mr-2" />}
        </div>
        <button 
          type="submit"
          className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold whitespace-nowrap"
        >
          Telusuri
        </button>
      </form>

      {/* Auto-suggest Dropdown */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.length === 0 && !isLoading ? (
            <div className="px-5 py-4 text-sm text-gray-500 text-center">
              Tidak ada buku yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Show up to 4 items normally */}
              {suggestions.slice(0, 4).map((book) => (
                <Link 
                  key={book.id} 
                  href={`/buku/${book.slug}`}
                  className="px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 block transition-colors"
                >
                  <p className="text-sm text-gray-700 truncate">
                    <span className="font-semibold text-gray-900">{book.title}</span> &mdash; <span className="text-gray-500">{book.author}</span>
                  </p>
                </Link>
              ))}

              {/* Show 5th item as "dll" link if total is 5 */}
              {suggestions.length === 5 && (
                <Link
                  href={`/katalog?q=${encodeURIComponent(query.trim())}`}
                  className="px-5 py-3 bg-gray-50/50 hover:bg-primary-50 border-t border-gray-100 flex items-center justify-center gap-2 transition-colors text-sm font-medium text-primary-600"
                >
                  Lihat hasil lainnya (dll...) &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
