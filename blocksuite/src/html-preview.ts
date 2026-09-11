/**
 * HTML Preview — inline Code / Preview tab switcher.
 *
 * The "HTML ▼" button is rendered by HoverController as a portal
 * at position:absolute top:0 left:0 inside affine-code. Its width
 * is ~68px for "HTML" label. We position our tabs at left:72px
 * on the same row — no need to find the portal element.
 */

const INJECTED_ATTR = 'data-preview-injected';

interface BlockState {
  codeBtn: HTMLButtonElement;
  previewBtn: HTMLButtonElement;
  tabsWrap: HTMLElement;
  iframe: HTMLIFrameElement;
}
const states = new WeakMap<Element, BlockState>();

// ─── Read code text ────────────────────────────────────────────────────────

function getCodeText(codeEl: Element): string {
  const lines = codeEl.querySelectorAll('v-line');
  if (lines.length) {
    return Array.from(lines).map((l) => l.textContent ?? '').join('\n');
  }
  return codeEl.querySelector('rich-text')?.textContent ?? '';
}

// ─── Language ──────────────────────────────────────────────────────────────

function getLanguage(codeEl: Element): string {
  const lang = (codeEl as any).model?.language;
  return lang ? String(lang).toLowerCase() : '';
}

// ─── Tab button — plain text, same color as surroundings ───────────────────

function makeTab(label: string, active: boolean): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = `
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 12px;
    font-family: sans-serif;
    color: #8e8e8e;
    padding: 2px 6px;
    white-space: nowrap;
    transition: opacity .12s;
    opacity: ${active ? '1' : '0.5'};
    font-weight: ${active ? '600' : '400'};
  `;
  return btn;
}

function applyActive(btn: HTMLButtonElement, active: boolean) {
  btn.style.opacity    = active ? '1' : '0.5';
  btn.style.fontWeight = active ? '600' : '400';
}

// ─── Switch tab ────────────────────────────────────────────────────────────

function switchTab(codeEl: Element, tab: 'code' | 'preview', s: BlockState) {
  applyActive(s.codeBtn,    tab === 'code');
  applyActive(s.previewBtn, tab === 'preview');

  const container = codeEl.querySelector('.affine-code-block-container') as HTMLElement | null;
  if (!container) return;

  // Hide/show the code editing area
  const richText   = container.querySelector('.rich-text-container') as HTMLElement | null;
  const lineNums   = container.querySelector('#line-numbers')        as HTMLElement | null;

  if (tab === 'preview') {
    if (richText) richText.style.visibility = 'hidden';
    if (lineNums)  lineNums.style.visibility  = 'hidden';
    s.iframe.srcdoc       = getCodeText(codeEl);
    s.iframe.style.display = 'block';
  } else {
    if (richText) richText.style.visibility = '';
    if (lineNums)  lineNums.style.visibility  = '';
    s.iframe.style.display = 'none';
    s.iframe.srcdoc        = '';
  }
}

// ─── Inject tabs ───────────────────────────────────────────────────────────

function injectTabs(codeEl: Element) {
  const container = codeEl.querySelector('.affine-code-block-container') as HTMLElement | null;
  if (!container) return;

  // ── Tabs row: absolute, same row as the "HTML ▼" button ─────────────
  const tabsWrap = document.createElement('div');
  tabsWrap.setAttribute(INJECTED_ATTR, '1');
  tabsWrap.style.cssText = `
    position: absolute;
    top: 2px;
    left: 72px;
    height: 24px;
    display: flex;
    align-items: center;
    z-index: 7;
    pointer-events: auto;
  `;

  const codeBtn    = makeTab('Code',    true);
  const previewBtn = makeTab('Preview', false);
  tabsWrap.append(codeBtn, previewBtn);
  container.appendChild(tabsWrap);

  // ── Iframe — covers the code content area when Preview is active ────
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-popups');
  iframe.style.cssText = `
    display: none;
    position: absolute;
    top: 30px; left: 0; right: 0; bottom: 0;
    width: 100%;
    height: calc(100% - 30px);
    border: none;
    background: #fff;
    border-radius: 0 0 10px 10px;
    z-index: 5;
  `;
  container.appendChild(iframe);

  const state: BlockState = { codeBtn, previewBtn, tabsWrap, iframe };
  states.set(codeEl, state);

  codeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTab(codeEl, 'code', state);
  });
  previewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    switchTab(codeEl, 'preview', state);
  });

  codeEl.setAttribute(INJECTED_ATTR, '1');
}

// ─── Remove tabs ───────────────────────────────────────────────────────────

function removeTabs(codeEl: Element) {
  const s = states.get(codeEl);
  if (!s) return;
  switchTab(codeEl, 'code', s);
  s.tabsWrap.remove();
  s.iframe.remove();
  states.delete(codeEl);
  codeEl.removeAttribute(INJECTED_ATTR);
}

// ─── Sync ──────────────────────────────────────────────────────────────────

function syncBlock(codeEl: Element) {
  const isHtml   = getLanguage(codeEl) === 'html';
  const injected = codeEl.hasAttribute(INJECTED_ATTR);
  if ( isHtml && !injected) injectTabs(codeEl);
  if (!isHtml &&  injected) removeTabs(codeEl);
}

// ─── Main entry ────────────────────────────────────────────────────────────

export function initHtmlPreview(_editorEl: HTMLElement) {
  const seen = new WeakSet<Element>();

  function scanAll() {
    document.querySelectorAll('affine-code').forEach((codeEl) => {
      syncBlock(codeEl);
      if (!seen.has(codeEl)) {
        seen.add(codeEl);
        new MutationObserver(() => syncBlock(codeEl)).observe(codeEl, {
          childList: true, subtree: true, attributes: true,
        });
      }
    });
  }

  new MutationObserver(scanAll).observe(document.body, {
    childList: true, subtree: true,
  });

  setTimeout(scanAll, 300);
  setTimeout(scanAll, 900);
  setTimeout(scanAll, 2200);
}
