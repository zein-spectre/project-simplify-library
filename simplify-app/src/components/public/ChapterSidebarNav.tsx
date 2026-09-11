'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Chapter {
  $id: string;
  slug: string;
  title: string;
  parent_id?: string | null;
}

interface ChapterSidebarNavProps {
  chapters: Chapter[];
  bookSlug: string;
  currentChapterId: string;
}

export default function ChapterSidebarNav({
  chapters,
  bookSlug,
  currentChapterId,
}: ChapterSidebarNavProps) {
  // Bangun tree dan flatten dengan DFS agar urutan selalu benar secara hierarki
  const sortedChapters = (() => {
    const map = new Map<string, Chapter & { children: any[] }>();
    chapters.forEach(c => map.set(c.$id, { ...c, children: [] }));
    const roots: (Chapter & { children: any[] })[] = [];
    
    map.forEach(node => {
      if (node.parent_id && map.has(node.parent_id)) {
        map.get(node.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const flat: Chapter[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach(n => {
        flat.push(n);
        traverse(n.children);
      });
    };
    traverse(roots);
    return flat;
  })();

  const chapterIndex = sortedChapters.findIndex((c) => c.$id === currentChapterId);
  
  // Default tertutup (false)
  const [isExpanded, setIsExpanded] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  // Ekstrak heading setelah render (Client-Side)
  useEffect(() => {
    // Beri sedikit delay agar komponen server selesai render (terutama jika re-render transisi halaman)
    const timeout = setTimeout(() => {
      const contentContainer = document.querySelector('.blocksuite-content');
      if (!contentContainer) return;

      const headingElements = contentContainer.querySelectorAll('h1, h2, h3');
      const extractedHeadings: { id: string; text: string; level: number }[] = [];

      headingElements.forEach((el, index) => {
        // Jika heading tidak punya ID bawaan dari BlockSuite, buatkan ID dinamis
        if (!el.id) {
          const slug = el.textContent
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '') || `heading-${index}`;
          
          let finalId = slug;
          let counter = 1;
          
          // Pastikan ID tidak bentrok
          while (document.getElementById(finalId)) {
            finalId = `${slug}-${counter}`;
            counter++;
          }
          el.id = finalId;
        }
        
        const level = parseInt(el.tagName.replace('H', ''), 10);
        
        extractedHeadings.push({
          id: el.id,
          text: el.textContent || '',
          level,
        });
      });

      setHeadings(extractedHeadings);
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentChapterId]); // Re-run setiap kali bab berubah

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      // Scroll secara smooth, lalu sedikit offset agar tidak tertutup navbar atas (jika ada)
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <nav className="flex-1 overflow-y-auto py-3 relative z-10">
      {sortedChapters.map((ch, i) => {
        const isActive = ch.$id === currentChapterId;
        const isCompleted = i < chapterIndex;
        
        // Hitung kedalaman (depth) untuk indentasi
        let depth = 0;
        let curr = ch;
        while (curr.parent_id) {
          depth++;
          const p = sortedChapters.find(c => c.$id === curr.parent_id);
          if (!p) break;
          curr = p;
        }
        
        const indentClass = depth === 0 ? '' : depth === 1 ? 'ml-4' : 'ml-8';

        return (
          <div key={ch.$id} className={`flex flex-col ${indentClass}`}>
            {isActive ? (
              // Bab Aktif bertindak sebagai Toggle Accordion
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-start gap-2.5 px-4 py-3 transition-colors text-left bg-primary-50 border-r-2 border-primary-500 hover:bg-primary-100"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center mt-0.5 bg-primary-600 text-white">
                  {i + 1}
                </span>
                <span className="flex-1 text-xs leading-snug text-primary-700 font-semibold pr-2 break-words">
                  {ch.title}
                </span>
                <span className="flex-shrink-0 mt-0.5 text-primary-500">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>
            ) : (
              // Bab Lain bertindak sebagai Link biasa
              <Link
                href={`/buku/${bookSlug}/bab/${ch.slug}`}
                className="flex items-start gap-2.5 px-4 py-2.5 transition-colors hover:bg-gray-100"
              >
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center mt-0.5 ${
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : ''}
                </span>
                <span className={`text-xs leading-snug break-words ${isCompleted ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {depth === 0 ? `Bab ${i + 1}: ` : ''}{ch.title}
                </span>
              </Link>
            )}

            {/* Sub-list (ToC Dinamis) */}
            {isActive && isExpanded && headings.length > 0 && (
              <div className="bg-primary-50/50 pb-3 border-r-2 border-primary-500 relative z-0">
                {headings.map((h) => {
                  // Indentasi hierarkis berdasarkan level heading (H1, H2, H3)
                  const paddingLeft = 
                    h.level === 1 ? 'pl-11' : 
                    h.level === 2 ? 'pl-[3.5rem]' : 
                    'pl-[4.25rem]';
                  
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => scrollToHeading(h.id, e)}
                      className={`block py-1.5 pr-4 text-[11.5px] leading-relaxed text-gray-600 hover:text-primary-700 hover:bg-primary-100/50 transition-colors ${paddingLeft}`}
                      style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {h.text}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
