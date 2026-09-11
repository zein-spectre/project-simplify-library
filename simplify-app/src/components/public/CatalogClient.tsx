'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutGrid, List, BookOpen, ArrowUpDown, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import BookCard from './BookCard';
import SearchAutocomplete from './SearchAutocomplete';
import { usePublicAuth } from '@/contexts/PublicAuthContext';

interface CatalogClientProps {
  books: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  total: number;
  initialQuery: string;
  initialKategori: string;
  initialView: 'grid' | 'list';
}

export default function CatalogClient({
  books,
  categories,
  total,
  initialQuery,
  initialKategori,
  initialView,
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = usePublicAuth();
  
  const [view, setView] = useState<'grid' | 'list'>(initialView);
  const [searchVal, setSearchVal] = useState(initialQuery);
  const [activeKategori, setActiveKategori] = useState(initialKategori);
  const [sortVal, setSortVal] = useState<'recent' | 'alphabet' | 'progress'>('recent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // State untuk menyimpan progress user (jika login)
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetch(`/api/progress?userId=${user.$id}`)
        .then(res => res.json())
        .then((progresses: Record<string, any>[]) => {
          if (!Array.isArray(progresses)) return;
          const progMap: Record<string, number> = {};
          progresses.forEach((p) => {
            progMap[p.book_id as string] = p.progress_percent as number;
          });
          setUserProgress(progMap);
        })
        .catch(() => {});
    }
  }, [user]);

  const applyFilters = useCallback(
    (q: string, kat: string) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (kat) params.set('kategori', kat);
      if (view !== 'grid') params.set('view', view);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, view]
  );

  // Debounced search
  let debounce: ReturnType<typeof setTimeout>;
  const handleSearch = (val: string) => {
    setSearchVal(val);
    clearTimeout(debounce);
    debounce = setTimeout(() => applyFilters(val, activeKategori), 500);
  };

  const handleKategori = (kat: string) => {
    setActiveKategori(kat);
    applyFilters(searchVal, kat);
  };

  const clearSearch = () => {
    setSearchVal('');
    applyFilters('', activeKategori);
  };

  // Sorting Logic
  const sortedBooks = [...books].sort((a, b) => {
    let result = 0;
    if (sortVal === 'alphabet') {
      const titleA = String(a.simplified_title || '').toLowerCase();
      const titleB = String(b.simplified_title || '').toLowerCase();
      result = titleA.localeCompare(titleB);
    } else if (sortVal === 'progress' && user) {
      const progA = userProgress[a.$id as string] || 0;
      const progB = userProgress[b.$id as string] || 0;
      // Urutkan dari progress tertinggi defaultnya
      if (progA !== progB) {
        result = progB - progA;
      } else {
        // Jika sama, urutkan berdasarkan update terbaru
        const dateA = new Date(String(a.$updatedAt || a.$createdAt || 0)).getTime();
        const dateB = new Date(String(b.$updatedAt || b.$createdAt || 0)).getTime();
        result = dateB - dateA;
      }
    } else {
      // Default: Recent (berdasarkan tanggal update atau create)
      const dateA = new Date(String(a.$updatedAt || a.$createdAt || 0)).getTime();
      const dateB = new Date(String(b.$updatedAt || b.$createdAt || 0)).getTime();
      result = dateB - dateA; // Descending by default
    }
    
    return sortOrder === 'asc' ? -result : result;
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Koleksi Ringkasan Buku Hukum</h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} buku tersedia · Semua dapat diakses gratis tanpa login
        </p>
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <SearchAutocomplete
          initialValue={searchVal}
          onSearch={(q) => {
            setSearchVal(q);
            applyFilters(q, activeKategori);
          }}
          navigateOnSelect={false}
          placeholder="Cari judul, penulis, atau topik..."
          className="flex-1 min-w-[200px] max-w-md"
        />

        <div className="flex items-center gap-3 ml-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1">
            <div className="relative group">
              <select
                value={sortVal}
                onChange={(e) => setSortVal(e.target.value as any)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-l-lg pl-9 pr-8 py-2 outline-none hover:border-primary-300 focus:border-primary-500 transition-colors cursor-pointer border-r-0"
              >
                <option value="recent">Terbaru</option>
                <option value="alphabet">Abjad (A-Z)</option>
                {user && <option value="progress">Progres Membaca</option>}
              </select>
              <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="p-2 border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary-300 rounded-r-lg text-gray-600 transition-colors h-[38px] flex items-center justify-center"
              title={`Ubah ke ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'desc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Tampilan Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:bg-gray-100'}`}
            title="Tampilan List"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide snap-x">
        <button
          onClick={() => handleKategori('')}
          className={`flex-shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            !activeKategori
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm'
          }`}
        >
          Semua ({total})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.$id as string}
            onClick={() => handleKategori(cat.name as string)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeKategori === cat.name
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm'
            }`}
          >
            {cat.name as string}
          </button>
        ))}
      </div>

      {/* Results */}
      {books.length === 0 ? (
        <div className="py-24 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Buku tidak ditemukan</h2>
          <p className="text-sm text-gray-400 mb-6">
            Tidak ada buku yang cocok dengan pencarian &quot;{searchVal}&quot;.
          </p>
          <button onClick={clearSearch} className="btn-secondary">
            Lihat Semua Buku
          </button>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6' 
          : 'space-y-3'
        }>
          {sortedBooks.map((book) => (
            <BookCard 
              key={book.$id as string} 
              book={book} 
              view={view} 
              progress={userProgress[book.$id as string]}
            />
          ))}
        </div>
      )}
    </>
  );
}
