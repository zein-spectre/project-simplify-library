'use client';

/**
 * BlockSuiteEditor — Wrapper iframe untuk editor blocksuite/ folder.
 *
 * Blocksuite folder berjalan sebagai Vite dev server TERPISAH (port 5173).
 * Next.js admin embed editor tersebut via iframe agar tidak perlu
 * menginstall atau memodifikasi apapun di dalam folder blocksuite/.
 *
 * Komunikasi via postMessage:
 * - Iframe → Parent: EDITOR_READY, EDITOR_CONTENT_CHANGE ({ json, html })
 *
 * Cara jalankan:
 *   Terminal 1: cd blocksuite && npm run dev   (port 5173)
 *   Terminal 2: cd simplify-app && npm run dev (port 3000)
 */

import { useEffect, useRef, useCallback, useState } from 'react';

export interface EditorContentPayload {
  /** JSON snapshot dari BlockSuite — source of truth */
  json: string;
  /** HTML yang di-export dari BlockSuite — untuk pembaca publik */
  html: string;
}

interface BlockSuiteEditorProps {
  /** ID unik bab — digunakan sebagai docId di IndexedDB blocksuite */
  docId: string;
  /** Dipanggil saat konten berubah (debounce sudah ditangani di iframe) */
  onChange?: (payload: EditorContentPayload) => void;
  /** Dipanggil saat editor siap (iframe loaded & IndexedDB synced) */
  onReady?: () => void;
  readOnly?: boolean;
  /** URL blocksuite editor. Default: http://localhost:5173 */
  editorUrl?: string;
  /** JSON cadangan dari Appwrite jika IndexedDB iframe kosong */
  initialJson?: string;
}

export default function BlockSuiteEditor({
  docId,
  onChange,
  onReady,
  readOnly = false,
  editorUrl = 'http://localhost:5173',
  initialJson,
}: BlockSuiteEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onChangeRef = useRef(onChange);
  const onReadyRef = useRef(onReady);
  onChangeRef.current = onChange;
  onReadyRef.current = onReady;

  const [isEditorReady, setIsEditorReady] = useState(false);

  // Bangun URL dengan query params untuk docId & mode
  const iframeSrc = `${editorUrl}?docId=${encodeURIComponent(docId)}&readOnly=${readOnly}`;

  // Terima pesan dari iframe (blocksuite)
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Hanya proses pesan dari blocksuite editor
      const allowedOrigins = ['localhost:5173', editorUrl];
      const isAllowed = allowedOrigins.some(
        (o) => event.origin.includes(o) || editorUrl.includes(event.origin)
      );
      if (!isAllowed && !event.origin.includes('localhost')) return;

      const { type, payload } = event.data || {};

      if (type === 'EDITOR_READY') {
        setIsEditorReady(true);
        onReadyRef.current?.();
      }

      if (type === 'REQUEST_INITIAL_CONTENT' && iframeRef.current?.contentWindow) {
        // Iframe melapor IndexedDB-nya kosong, berikan JSON dari Appwrite jika ada
        if (initialJson) {
          iframeRef.current.contentWindow.postMessage(
            { type: 'LOAD_INITIAL_CONTENT', payload: { json: initialJson } },
            '*'
          );
        } else {
          // Jika di Appwrite juga kosong (bab baru), perintahkan buat template kosong
          iframeRef.current.contentWindow.postMessage(
            { type: 'LOAD_EMPTY_TEMPLATE' },
            '*'
          );
        }
      }

      if (type === 'EDITOR_CONTENT_CHANGE' && onChangeRef.current) {
        // payload: { json: string, html: string }
        if (payload && typeof payload.json === 'string' && typeof payload.html === 'string') {
          onChangeRef.current(payload as EditorContentPayload);
        }
      }
    },
    [editorUrl, initialJson]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <div className="relative w-full h-full">
      {/* Loading overlay saat editor belum siap */}
      {!isEditorReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Memuat editor...</span>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        className="w-full h-full border-0"
        style={{ minHeight: '500px' }}
        allow="clipboard-read; clipboard-write"
        title={`Editor Bab: ${docId}`}
      />
    </div>
  );
}


