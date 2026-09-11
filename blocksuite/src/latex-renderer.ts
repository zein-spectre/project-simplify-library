/**
 * LaTeX Renderer — renders $$...$$ and $...$ using KaTeX.
 *
 * Key insight: `affine-paragraph.textContent` includes placeholder UI text.
 * We must read from `v-text` elements to get the actual user text.
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';

const OVERLAY_ATTR = 'data-latex-overlay';
const RENDERED_ATTR = 'data-latex-rendered';

let isScanning = false;
let scanTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Render LaTeX ──────────────────────────────────────────────────────────

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: 'html',
      strict: false,
    });
  } catch {
    return displayMode ? `$$${tex}$$` : `$${tex}$`;
  }
}

// ─── Get clean text from a v-line (only v-text content) ───────────────────

function getCleanText(el: Element): string {
  const vTexts = el.querySelectorAll('v-text');
  if (vTexts.length > 0) {
    return Array.from(vTexts).map((vt) => vt.textContent ?? '').join('');
  }
  // Fallback: try rich-text > v-line > v-text
  const richText = el.querySelector('rich-text');
  if (richText) {
    const innerVTexts = richText.querySelectorAll('v-text');
    return Array.from(innerVTexts).map((vt) => vt.textContent ?? '').join('');
  }
  return '';
}

// ─── Get focused paragraph ────────────────────────────────────────────────

function getFocusedParagraph(): Element | null {
  const sel = window.getSelection();
  if (!sel || !sel.focusNode) return null;
  const node = sel.focusNode.nodeType === 1
    ? sel.focusNode as Element
    : sel.focusNode.parentElement;
  return node?.closest('affine-paragraph, affine-list') ?? null;
}

// ─── Clean overlay from element ───────────────────────────────────────────

function cleanOverlay(el: HTMLElement) {
  el.querySelectorAll(`[${OVERLAY_ATTR}]`).forEach((o) => o.remove());
  el.removeAttribute(RENDERED_ATTR);
  // Unhide if was hidden
  el.style.removeProperty('max-height');
  el.style.removeProperty('overflow');
  el.style.removeProperty('opacity');
  el.style.removeProperty('margin');
  el.style.removeProperty('padding');
}

// ─── Process inline $...$ in text → HTML ──────────────────────────────────

function processInline(text: string): string | null {
  const inlineRe = /(?<!\$)\$([^\$\n]+?)\$(?!\$)/g;
  let hasMatch = false;
  let result = escapeHtml(text);

  result = result.replace(inlineRe, (match, tex) => {
    if (/^\d/.test(tex.trim())) return match;
    hasMatch = true;
    return renderLatex(unescapeHtml(tex), false);
  });

  return hasMatch ? result : null;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function unescapeHtml(s: string): string {
  return s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

// ─── Scan all paragraphs ──────────────────────────────────────────────────

function scanAll() {
  if (isScanning) return;
  isScanning = true;

  try {
    const focusedP = getFocusedParagraph();
    const allParagraphs = Array.from(
      document.querySelectorAll('affine-paragraph, affine-list')
    ) as HTMLElement[];

    // Phase 1: multi-paragraph block math ($$\n...\n$$)
    let i = 0;
    while (i < allParagraphs.length) {
      const p = allParagraphs[i];
      const text = getCleanText(p).trim();

      // Skip already rendered
      if (p.hasAttribute(RENDERED_ATTR)) {
        // Check if text changed
        const savedText = p.getAttribute('data-latex-src');
        if (savedText === text) { i++; continue; }
        // Text changed, clean and re-process
        cleanOverlay(p);
      }

      // Skip if user is editing this paragraph
      if (p === focusedP) { i++; continue; }

      // Case A: standalone $$ (multi-line block math opening)
      if (text === '$$') {
        let j = i + 1;
        const contentLines: string[] = [];

        while (j < allParagraphs.length) {
          const jText = getCleanText(allParagraphs[j]).trim();
          if (jText === '$$') break;
          contentLines.push(jText);
          j++;
        }

        if (j < allParagraphs.length && contentLines.length > 0) {
          const group = allParagraphs.slice(i, j + 1);

          // Skip if user is editing any paragraph in group
          if (group.some((gp) => gp === focusedP)) {
            i = j + 1;
            continue;
          }

          const mathContent = contentLines.join('\n');
          const rendered = renderLatex(mathContent, true);

          // Put overlay on opening $$
          p.setAttribute(RENDERED_ATTR, '1');
          p.setAttribute('data-latex-src', text);
          p.style.position = 'relative';

          const overlay = document.createElement('div');
          overlay.setAttribute(OVERLAY_ATTR, '1');
          overlay.innerHTML = rendered;
          overlay.style.cssText = `
            text-align: center;
            padding: 12px 0;
            cursor: text;
          `;
          overlay.addEventListener('click', () => group.forEach((g) => cleanOverlay(g)));
          p.appendChild(overlay);

          // Hide middle + closing paragraphs
          for (let k = i + 1; k <= j; k++) {
            const cp = allParagraphs[k];
            cp.setAttribute(RENDERED_ATTR, '1');
            cp.setAttribute('data-latex-src', getCleanText(cp).trim());
            cp.style.maxHeight = '0';
            cp.style.overflow = 'hidden';
            cp.style.opacity = '0';
            cp.style.margin = '0';
            cp.style.padding = '0';
          }

          i = j + 1;
          continue;
        }
      }

      // Case B: single-line block math $$...$$
      const blockMatch = text.match(/^\$\$([\s\S]+?)\$\$$/);
      if (blockMatch) {
        const rendered = renderLatex(blockMatch[1], true);

        p.setAttribute(RENDERED_ATTR, '1');
        p.setAttribute('data-latex-src', text);
        p.style.position = 'relative';

        const overlay = document.createElement('div');
        overlay.setAttribute(OVERLAY_ATTR, '1');
        overlay.innerHTML = rendered;
        overlay.style.cssText = `
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          text-align: center;
          display: flex; align-items: center; justify-content: center;
          cursor: text;
          background: var(--affine-background-primary-color, #fff);
          z-index: 1;
        `;
        overlay.addEventListener('click', () => cleanOverlay(p));
        p.appendChild(overlay);

        i++;
        continue;
      }

      // Case C: inline math $...$
      if (text.includes('$') && !text.startsWith('$$')) {
        const rendered = processInline(text);
        if (rendered) {
          // Find the v-line to overlay
          const vLine = p.querySelector('v-line') as HTMLElement | null;
          if (vLine && !vLine.hasAttribute(RENDERED_ATTR)) {
            vLine.setAttribute(RENDERED_ATTR, '1');
            vLine.setAttribute('data-latex-src', text);
            vLine.style.position = 'relative';

            const overlay = document.createElement('div');
            overlay.setAttribute(OVERLAY_ATTR, '1');
            overlay.innerHTML = rendered;
            overlay.style.cssText = `
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: var(--affine-background-primary-color, #fff);
              z-index: 1;
              display: flex; align-items: center; flex-wrap: wrap;
              cursor: text;
            `;
            overlay.addEventListener('click', () => {
              cleanOverlay(vLine);
            });
            vLine.appendChild(overlay);
          }
        }
      }

      i++;
    }
  } finally {
    isScanning = false;
  }
}

function debouncedScan() {
  if (scanTimer) clearTimeout(scanTimer);
  scanTimer = setTimeout(scanAll, 200);
}

// ─── Main entry ────────────────────────────────────────────────────────────

export function initLatexRenderer(_editorEl: HTMLElement) {
  new MutationObserver(debouncedScan).observe(document.body, {
    childList: true,
    subtree: true,
  });

  document.addEventListener('selectionchange', debouncedScan);

  setTimeout(scanAll, 600);
  setTimeout(scanAll, 1500);
  setTimeout(scanAll, 3000);
}
