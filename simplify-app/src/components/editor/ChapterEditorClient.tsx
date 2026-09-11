'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { updateChapter } from '@/actions/chapters';
import type { EditorContentPayload } from './BlockSuiteEditor';
import {
  ChevronLeft, Eye, CheckCircle,
  Clock, Loader2
} from 'lucide-react';
import BlockSuiteEditor from './BlockSuiteEditor';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface Book {
  $id: string;
  simplified_title: string;
  slug?: string;
}

interface Chapter {
  $id: string;
  title: string;
  status: string;
  content_json?: string;
}

interface ChapterEditorClientProps {
  book: Record<string, unknown>;
  chapter: Record<string, unknown>;
}

export default function ChapterEditorClient({ book, chapter }: ChapterEditorClientProps) {
  const typedBook = book as unknown as Book;
  const typedChapter = chapter as unknown as Chapter;
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [chapterStatus, setChapterStatus] = useState<string>(typedChapter.status);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Simpan html terbaru dari editor di ref (tidak perlu trigger re-render)
  const lastHtmlRef = useRef<string>('');
  const lastJsonRef = useRef<string>('');

  // Dipanggil oleh BlockSuiteEditor tiap ada perubahan (sudah di-debounce 1 detik di iframe)
  const handleContentChange = useCallback(async (payload: EditorContentPayload) => {
    lastHtmlRef.current = payload.html;
    lastJsonRef.current = payload.json;

    setSaveState('saving');
    try {
      const res = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          id: typedChapter.$id,
          contentJson: payload.json
        })
      });
      if (!res.ok) throw new Error('Gagal');
      
      setSaveState('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveState('idle'), 3000);
    } catch {
      setSaveState('error');
    }
  }, [typedChapter.$id]);

  // Ubah status saja (tanpa publish konten HTML)
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'published') {
      await handlePublish();
      return;
    }
    try {
      await updateChapter(typedChapter.$id, typedBook.$id, { status: newStatus });
      setChapterStatus(newStatus);
    } catch {
      alert('Gagal mengubah status bab.');
    }
  };

  // Publish: simpan HTML + JSON + set status published
  const handlePublish = async () => {
    if (isPublishing) return;

    // Pastikan ada konten untuk di-publish
    const htmlToPublish = lastHtmlRef.current;
    const jsonToPublish = lastJsonRef.current;

    if (!htmlToPublish && !jsonToPublish) {
      alert('Tulis konten bab terlebih dahulu sebelum menerbitkan.');
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch('/api/editor/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          id: typedChapter.$id,
          contentHtml: htmlToPublish,
          contentJson: jsonToPublish
        })
      });
      if (!res.ok) throw new Error('Gagal');
      
      setChapterStatus('published');
    } catch {
      alert('Gagal menerbitkan bab. Coba lagi.');
    } finally {
      setIsPublishing(false);
    }
  };

  const saveStateLabel = {
    idle: lastSaved ? (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle className="w-3.5 h-3.5" />
        Tersimpan ({lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})
      </span>
    ) : null,
    saving: (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Menyimpan...
      </span>
    ),
    saved: (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle className="w-3.5 h-3.5" />
        Tersimpan...
      </span>
    ),
    error: (
      <span className="text-xs text-red-500">Gagal menyimpan</span>
    ),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Editor Topbar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        {/* Back */}
        <Link
          href={`/admin/books/${typedBook.$id}/chapters`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {typedBook.simplified_title}
        </Link>

        <span className="text-gray-200">/</span>

        {/* Chapter Title */}
        <span className="text-sm font-semibold text-gray-800 truncate max-w-xs">
          {typedChapter.title}
        </span>

        {/* Save state */}
        <div className="ml-2">{saveStateLabel[saveState]}</div>

        {/* Spacer */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Status Publikasi:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              chapterStatus === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {chapterStatus === 'published' ? 'Terbit' : 'Draft'}
            </span>
          </div>

          <div className="w-px h-4 bg-gray-200"></div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Preview */}
        {typedBook.slug && (
          <Link
            href={`/buku/${typedBook.slug}`}
            target="_blank"
            className="btn-ghost text-xs px-3 py-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </Link>
        )}

        {/* Publish / Update button */}
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="btn-primary py-1.5 px-4 text-sm whitespace-nowrap"
        >
          {isPublishing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Menyimpan...
            </span>
          ) : chapterStatus === 'published' ? (
            'Perbarui Terbitan'
          ) : (
            'Terbitkan'
          )}
        </button>

        {/* Unpublish button */}
        {chapterStatus === 'published' && (
          <button
            onClick={() => handleStatusChange('draft')}
            className="btn-ghost text-xs px-4 py-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            Kembalikan ke Draft
          </button>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden bg-white">
        <BlockSuiteEditor
          docId={typedChapter.$id}
          onChange={handleContentChange}
          readOnly={false}
          initialJson={typedChapter.content_json}
        />
      </div>
    </div>
  );
}
