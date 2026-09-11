import katex from 'katex';

/**
 * ChapterContentRenderer
 *
 * Merender konten bab dari field content_html yang tersimpan di Appwrite.
 * HTML di-generate oleh BlockSuite saat admin menerbitkan bab (publish flow).
 *
 * Strategi rendering:
 * - content_html ada → render HTML langsung (dangerouslySetInnerHTML)
 * - content_html kosong → tampilkan pesan "sedang dikurasi"
 */

interface ChapterContentRendererProps {
  /** HTML string yang di-generate oleh BlockSuite saat publish */
  contentHtml?: string;
  /** Fallback: teks mentah atau placeholder lama */
  content?: string;
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/** Mengubah BlockSuite HTML code blocks menjadi elemen HTML visual yang dirender */
function processHtmlCodeBlocks(html: string): string {
  return html.replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, (match, innerHtml) => {
    // Strip syntax highlighting spans (e.g. <span style="...">) to get pure text
    const pureText = innerHtml.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    const decoded = pureText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x3C;/gi, '<'); // BlockSuite sometimes uses &#x3C;

    const decodedTrim = decoded.trim().toLowerCase();
    
    // Check if it's explicitly marked as HTML (e.g. class="code-html") OR if pure text starts with html/svg
    const isHtmlBlock = match.toLowerCase().includes('"html"') || 
                        match.toLowerCase().includes('code-html') ||
                        match.toLowerCase().includes('language-html') ||
                        decodedTrim.startsWith('<html') || 
                        decodedTrim.startsWith('<svg') || 
                        decodedTrim.startsWith('<style') || 
                        decodedTrim.startsWith('<div');

    if (isHtmlBlock) {
      // Escape the decoded HTML for use in srcdoc
      const safeSrcDoc = decoded.replace(/"/g, '&quot;');
      return `<div class="raw-html-preview my-4 w-full rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden" style="height: 400px; resize: vertical;">
        <iframe srcdoc="${safeSrcDoc}" style="width: 100%; height: 100%; border: none;"></iframe>
      </div>`;
    }
    return match;
  });
}

function processMath(html: string): string {
  let processed = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      // Decode entities for math block before feeding to KaTeX
      const decodedMath = math
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]*>/g, ''); // Remove blocksuite span tags if any

      return katex.renderToString(decodedMath, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  processed = processed.replace(/(^|[^\$])\$([^$\n]+?)\$(?!\$)/g, (match, prefix, math) => {
    try {
      const decodedMath = math
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/<[^>]*>/g, '');
      return prefix + katex.renderToString(decodedMath, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  return processed;
}

export default function ChapterContentRenderer({
  contentHtml,
  content,
}: ChapterContentRendererProps) {
  // Prioritaskan content_html (format baru), fallback ke content lama jika ada
  const htmlToRender = contentHtml || '';

  if (!htmlToRender && !content) {
    return (
      <div className="prose-simplify">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
          <p className="text-amber-700 text-sm font-medium">Konten bab ini sedang dalam proses kurasi.</p>
          <p className="text-amber-600 text-xs mt-1">Tim editor sedang menyiapkan ringkasan untuk bab ini.</p>
        </div>
      </div>
    );
  }

  if (htmlToRender) {
    let finalHtml = processHtmlCodeBlocks(htmlToRender);
    finalHtml = processMath(finalHtml);
    return (
      <>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* BlockSuite Table Fallbacks */
          .affine-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid #e5e7eb; }
          .affine-table th, .affine-table td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
          .affine-table th { background-color: #f9fafb; font-weight: 600; }
          
          .blocksuite-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; border: 1px solid #e5e7eb; }
          .blocksuite-content th, .blocksuite-content td { border: 1px solid #e5e7eb; padding: 0.75rem; text-align: left; }
          .blocksuite-content th { background-color: #f9fafb; font-weight: 600; }
          
          /* Admin-like Code Blocks (Light Gray) */
          .blocksuite-content pre { background-color: #f9fafb !important; color: #111827 !important; border: 1px solid #e5e7eb; overflow-x: auto; padding: 1rem; border-radius: 0.75rem; }
          .blocksuite-content pre code { color: #111827 !important; background: none !important; }
        `}} />
        <div
          className="prose-simplify blocksuite-content"
          suppressHydrationWarning
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: finalHtml }}
        />
      </>
    );
  }

  // Fallback untuk konten lama (sebelum migrasi ke HTML export)
  return (
    <div className="prose-simplify">
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 text-sm text-primary-700">
        <p className="font-medium mb-1">📖 Konten bab ini tersedia.</p>
        <p className="text-xs text-primary-500">
          Konten sedang diproses ulang ke format terbaru. Hubungi admin jika konten tidak tampil.
        </p>
      </div>
    </div>
  );
}

/** Export helper agar halaman baca bisa menghitung estimasi waktu baca */
export { estimateReadingTime };

