import { createEmptyDoc, PageEditor } from '@blocksuite/presets';
import '@blocksuite/presets/effects';

// Manually inject the theme CSS since @toeverything/theme/dist/style.css
// is not in the exports field of that package (BlockSuite canary issue)
function injectThemeCSS() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Use a CDN fallback for the AFFiNE theme
  // The local file path from node_modules also works with Vite's ?url import
  link.href =
    'https://cdn.jsdelivr.net/npm/@toeverything/theme@1.1.1/dist/style.css';
  document.head.appendChild(link);
}

export function createEditor(container: HTMLElement) {
  // Inject theme styles
  injectThemeCSS();

  // Create a new doc and initialize it
  const { doc } = createEmptyDoc();
  doc.load();

  // Instantiate the PageEditor web component
  const editor = new PageEditor();
  editor.doc = doc;
  editor.style.cssText = `
    width: 100%;
    height: 100%;
    display: block;
  `;

  container.appendChild(editor);

  return { editor, doc };
}
