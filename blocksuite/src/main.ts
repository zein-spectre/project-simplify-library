import '@blocksuite/presets/themes/affine.css';

import { AffineSchemas, HtmlAdapter } from '@blocksuite/blocks';
import { AffineEditorContainer } from '@blocksuite/presets';
import { Schema, DocCollection, Text, Job } from '@blocksuite/store';
import { IndexeddbPersistence } from 'y-indexeddb';
import { initHtmlPreview } from './html-preview';
import { initLatexRenderer } from './latex-renderer';

// ── Baca query params dari URL ────────────────────────────────────────────────
const searchParams = new URLSearchParams(window.location.search);
const DOC_ID = searchParams.get('docId') || 'default-doc';
const READ_ONLY = searchParams.get('readOnly') === 'true';

// ── Setup collection ──────────────────────────────────────────────────────────
const schema = new Schema().register(AffineSchemas);
const collection = new DocCollection({ schema });
collection.meta.initialize();

// Setiap bab menggunakan docId uniknya sendiri
const doc = collection.createDoc({ id: DOC_ID });

// ── Mount editor ──────────────────────────────────────────────────────────────
const editor = new AffineEditorContainer();
editor.doc = doc;
editor.mode = 'page';
editor.autofocus = !READ_ONLY;
document.body.append(editor);

// ── Extensions (after editor in DOM) ──────────────────────────────────────────
initHtmlPreview(editor);
initLatexRenderer(editor);

// ── Export helpers ────────────────────────────────────────────────────────────

/** Export JSON snapshot (source of truth) dari dokumen BlockSuite */
async function exportJsonSnapshot(): Promise<string> {
  const job = new Job({ collection });
  const snapshot = await job.docToSnapshot(editor.doc);
  return JSON.stringify(snapshot);
}

/** Export konten dokumen sebagai HTML string bersih */
async function exportHtmlString(): Promise<string> {
  try {
    const job = new Job({ collection });
    const snapshot = await job.docToSnapshot(editor.doc);
    const adapter = new HtmlAdapter(job);
    const result = await adapter.fromDocSnapshot({
      snapshot,
      assets: job.assetsManager,
    });
    return result.file;
  } catch {
    // Fallback: ambil innerHTML dari DOM sebagai HTML mentah
    return document.querySelector('.affine-doc-viewport')?.innerHTML ?? '';
  }
}

// ── Debounce helper ───────────────────────────────────────────────────────────
function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

// ── Kirim konten ke parent Next.js (debounce 1 detik) ────────────────────────
const sendContentToParent = debounce(async () => {
  if (READ_ONLY) return;
  try {
    const [json, html] = await Promise.all([exportJsonSnapshot(), exportHtmlString()]);
    window.parent.postMessage(
      {
        type: 'EDITOR_CONTENT_CHANGE',
        payload: { json, html },
      },
      '*'
    );
  } catch (err) {
    console.error('[BlockSuite] Gagal export konten:', err);
  }
}, 1000);

// ── IndexedDB FIRST, then doc.load inside synced ─────────────────────────────
// PENTING: Gunakan DOC_ID sebagai key agar setiap bab punya storage IndexedDB terpisah
const provider = new IndexeddbPersistence(`simplify-chapter-${DOC_ID}`, doc.spaceDoc);

let isEmpty = false;

provider.on('synced', () => {
  doc.load(() => {
    // Inisialisasi template kosong langsung di dalam callback load
    // agar BlockSuite tidak error (Invalid access: Add Yjs type to a document...).
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock('affine:paragraph', {}, noteId);

    isEmpty = true;
    window.parent.postMessage({ type: 'REQUEST_INITIAL_CONTENT', payload: { docId: DOC_ID } }, '*');
  });

  // Jika IndexedDB sudah punya data (tidak kosong), langsung jalankan editor
  if (!isEmpty) {
    window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
    // Mulai listen perubahan Yjs doc → autosave
    doc.spaceDoc.on('update', sendContentToParent);
  }
});

// ── Listener perintah sinkronisasi dari Next.js ───────────────────────────────
window.addEventListener('message', async (event) => {
  const { type, payload } = event.data || {};
  
  if (type === 'LOAD_INITIAL_CONTENT') {
    try {
      // Masukkan data JSON dari Appwrite ke dalam BlockSuite
      const snapshot = JSON.parse(payload.json);
      const job = new Job({ collection });
      
      // Hapus dokumen kosong yang dibuat di awal agar tidak bentrok id-nya
      collection.removeDoc(DOC_ID);
      
      // Load dari JSON ke dokumen baru
      const loadedDoc = await job.snapshotToDoc(snapshot);
      
      // Timpa editor dengan dokumen yang baru diload
      editor.doc = loadedDoc;
      
    } catch (e) {
      console.error('[BlockSuite] Gagal parse JSON cadangan dari Appwrite:', e);
    }
    // Lapor siap & mulai autosave
    window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
    editor.doc.spaceDoc.on('update', sendContentToParent);
  } 
  else if (type === 'LOAD_EMPTY_TEMPLATE') {
    // Template kosong sudah dibuat di doc.load, jadi tinggal lapor siap
    window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
    doc.spaceDoc.on('update', sendContentToParent);
  }
});
