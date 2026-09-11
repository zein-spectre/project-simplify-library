'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, Loader2 } from 'lucide-react';

interface SearchSuggestion {
  $id: string;
  simplified_title: string;
  original_author: string;
  slug: string;
  cover_image_id: string | null;
}

interface SearchAutocompleteProps {
  initialValue?: string;
  onSearch?: (query: string) => void;
  /** Jika true, klik saran navigasi ke halaman buku. Jika false, trigger onSearch. */
  navigateOnSelect?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchAutocomplete({
  initialValue = '',
  onSearch,
  navigateOnSelect = false,
  placeholder = 'Cari judul, penulis, atau topik...',
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setValue(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    // Jika dihapus, trigger search kosong ke parent
    if (!val) {
      setSuggestions([]);
      setIsOpen(false);
      onSearch?.('');
    }
  };

  const handleSelect = (suggestion: SearchSuggestion) => {
    setValue(suggestion.simplified_title);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    if (navigateOnSelect) {
      router.push(`/buku/${suggestion.slug}`);
    } else {
      onSearch?.(suggestion.simplified_title);
    }
  };

  const handleClear = () => {
    setValue('');
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch?.(value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSelect(suggestions[activeIndex]);
      } else {
        setIsOpen(false);
        onSearch?.(value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onSearch?.(value);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search icon / loader */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            className={`input-field pl-9 ${value ? 'pr-8' : 'pr-4'}`}
            autoComplete="off"
            aria-label="Cari buku"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden"
          role="listbox"
          aria-label="Saran pencarian"
        >
          <div className="py-1">
            {suggestions.map((s, i) => (
              <button
                key={s.$id}
                id={`suggestion-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleSelect(s)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === activeIndex ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-primary-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${i === activeIndex ? 'text-primary-700' : 'text-gray-800'}`}>
                    {s.simplified_title}
                  </p>
                  {s.original_author && (
                    <p className="text-xs text-gray-400 truncate">{s.original_author}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
          {/* Footer hint */}
          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {suggestions.length} hasil ditemukan
            </span>
            <span className="text-[10px] text-gray-400">
              ↑↓ navigasi · Enter pilih
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
