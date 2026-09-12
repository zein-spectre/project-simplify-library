import '@blocksuite/presets/themes/affine.css';
import './editor-registration';

import { AffineSchemas, HtmlAdapter } from '@blocksuite/blocks';
import { AffineEditorContainer } from '@blocksuite/presets';

// Vite pre-bundle skips customElements.define. Register manually.
// Patch to create shadow root and guard against slots being undefined.
// Store _connectedRan on `this` so each element instance has its own flag.
if (!customElements.get('affine-editor-container')) {
  const origConnected = AffineEditorContainer.prototype.connectedCallback;
  AffineEditorContainer.prototype.connectedCallback = function () {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }
    const el = this as typeof this & { _connectedRan?: boolean };
    if (!el._connectedRan) {
      el._connectedRan = true;
      try {
        origConnected.call(this);
      } catch (e) {
        // Slots may be undefined when called during doc.load()
      }
    }
  };
  customElements.define('affine-editor-container', AffineEditorContainer as CustomElementConstructor);
}
import { Schema, DocCollection, Job } from '@blocksuite/store';
import { IndexeddbPersistence } from 'y-indexeddb';
import { initHtmlPreview } from './html-preview';
import { initLatexRenderer } from './latex-renderer';


const searchParams = new URLSearchParams(window.location.search);
const DOC_ID = searchParams.get('docId') || 'default-doc';
const READ_ONLY = searchParams.get('readOnly') === 'true';

const schema = new Schema().register(AffineSchemas);
const collection = new DocCollection({ schema });
collection.meta.initialize();

let doc = collection.createDoc({ id: DOC_ID });

let isMounted = false;
let _editor: AffineEditorContainer | null = null;

function mountEditor(targetDoc: typeof doc) {
  if (!isMounted) {
    _editor = new AffineEditorContainer();
    _editor.mode = 'page';
    _editor.autofocus = false;
    document.body.append(_editor);
    _editor.doc = targetDoc;
    _editor.requestUpdate();
    initHtmlPreview(_editor);
    initLatexRenderer(_editor);
    isMounted = true;
  }
}

async function exportJsonSnapshot(): Promise<string> {
  const job = new Job({ collection });
  const snapshot = await job.docToSnapshot(_editor!.doc);
  return JSON.stringify(snapshot);
}

async function exportHtmlString(): Promise<string> {
  try {
    const job = new Job({ collection });
    const snapshot = await job.docToSnapshot(_editor!.doc);
    const adapter = new HtmlAdapter(job);
    const result = await adapter.fromDocSnapshot({
      snapshot,
      assets: job.assetsManager,
    });
    return result.file;
  } catch {
    return document.querySelector('.affine-doc-viewport')?.innerHTML ?? '';
  }
}

function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

const sendContentToParent = debounce(async () => {
  if (READ_ONLY || !isMounted) return;
  try {
    const [json, html] = await Promise.all([exportJsonSnapshot(), exportHtmlString()]);
    window.parent.postMessage({ type: 'EDITOR_CONTENT_CHANGE', payload: { json, html } }, '*');
  } catch (err) {
    console.error('[BlockSuite] Gagal export konten:', err);
  }
}, 1000);

const provider = new IndexeddbPersistence(`simplify-chapter-${DOC_ID}`, doc.spaceDoc);

provider.on('synced', () => {
  console.log('[BlockSuite] IndexedDB synced, hasData:', doc.spaceDoc.share.size > 0);
  const hasExistingData = doc.spaceDoc.share.size > 0;

  if (hasExistingData) {
    doc.load();
    mountEditor(doc);
    window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
    doc.spaceDoc.on('update', sendContentToParent);
  } else {
    initEmptyTemplate();
  }
});

// Fallback: if synced doesn't fire within 3s, init anyway
let _initialized = false;
setTimeout(() => {
  if (!_initialized) {
    _initialized = true;
    console.log('[BlockSuite] Synced timeout — init empty template');
    initEmptyTemplate();
  }
}, 3000);

window.addEventListener('message', async (event) => {
  const { type, payload } = event.data || {};
  
  if (type === 'LOAD_INITIAL_CONTENT') {
    try {
      const snapshot = JSON.parse(payload.json);
      const job = new Job({ collection });
      
      collection.removeDoc(DOC_ID);
      const loadedDoc = await job.snapshotToDoc(snapshot);
      
      mountEditor(loadedDoc as any);
      window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
      _editor!.doc.spaceDoc.on('update', sendContentToParent);
      
    } catch (e) {
      console.error('[BlockSuite] Gagal parse JSON:', e);
      initEmptyTemplate();
    }
  } 
  else if (type === 'LOAD_EMPTY_TEMPLATE') {
    initEmptyTemplate();
  }
});

function initEmptyTemplate() {
  if (_initialized) return;
  _initialized = true;
  doc.load(); // doc is already created at the top level
  
  const pageBlockId = doc.addBlock('affine:page', {});
  doc.addBlock('affine:surface', {}, pageBlockId);
  const noteId = doc.addBlock('affine:note', {}, pageBlockId);
  doc.addBlock('affine:paragraph', {}, noteId);
  
  doc.resetHistory();
  
  mountEditor(doc);
  window.parent.postMessage({ type: 'EDITOR_READY', payload: { docId: DOC_ID } }, '*');
  doc.spaceDoc.on('update', sendContentToParent);
}
