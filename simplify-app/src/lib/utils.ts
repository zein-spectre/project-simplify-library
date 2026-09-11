import slugify from 'slugify';

/**
 * Generate slug dari teks (judul buku, bab, dll.)
 */
export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'id',
  });
}

/**
 * Format tanggal ke bahasa Indonesia
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Estimasi waktu baca berdasarkan konten (kata per menit = 200)
 */
export function estimateReadTime(content: string): number {
  try {
    const parsed = JSON.parse(content);
    const text = extractTextFromDoc(parsed);
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  } catch {
    return 1;
  }
}

function extractTextFromDoc(doc: unknown): string {
  if (typeof doc === 'string') return doc;
  if (Array.isArray(doc)) return doc.map(extractTextFromDoc).join(' ');
  if (doc && typeof doc === 'object') {
    const obj = doc as Record<string, unknown>;
    if (obj.text && typeof obj.text === 'string') return obj.text;
    return Object.values(obj).map(extractTextFromDoc).join(' ');
  }
  return '';
}

/**
 * Truncate teks ke panjang tertentu
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Build URL gambar cover dari Appwrite Storage
 */
export function getCoverUrl(fileId: string): string | null {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;
  if (!fileId) return null;
  return `${endpoint}/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
}

/**
 * Status badge color mapping
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-emerald-100 text-emerald-700';
    case 'draft': return 'bg-amber-100 text-amber-700';
    case 'archived': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'published': return 'Terbit';
    case 'draft': return 'Draft';
    case 'archived': return 'Arsip';
    default: return status;
  }
}
