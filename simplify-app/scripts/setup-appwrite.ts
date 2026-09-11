/**
 * Setup Appwrite Database, Collections, dan Storage Bucket
 * menggunakan REST API langsung (kompatibel dengan Appwrite Server 1.5.x)
 *
 * Jalankan: npm run setup:appwrite
 */

import * as https from 'https';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const ENDPOINT = new URL(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!);
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const BOOKS_COL = process.env.NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID!;
const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID!;
const SUBCHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID!;
const CATEGORIES_COL = process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

// ── HTTP Helper ──────────────────────────────────────────────────────────────

function req(method: string, path: string, body?: Record<string, unknown>): Promise<{ status: number; body: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options: https.RequestOptions = {
      hostname: ENDPOINT.hostname,
      port: ENDPOINT.port || 443,
      path: `/v1${path}`,
      method,
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': String(Buffer.byteLength(data)) } : {}),
      },
    };

    const request = https.request(options, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 0, body: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode || 0, body: { raw: d } });
        }
      });
    });

    request.on('error', reject);
    if (data) request.write(data);
    request.end();
  });
}

async function create(path: string, body: Record<string, unknown>, label: string) {
  const r = await req('POST', path, body);
  if (r.status === 201 || r.status === 200 || r.status === 202) {
    console.log(`✅ ${label}`);
    return r.body;
  } else if (r.status === 409) {
    console.log(`ℹ️  Sudah ada: ${label}`);
    return null;
  } else {
    const errBody = r.body as { message?: string };
    throw new Error(`[${r.status}] ${label}: ${errBody.message || JSON.stringify(r.body)}`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Permissions helper ───────────────────────────────────────────────────────

const PERMS = [
  'read("any")',
  'create("users")',
  'update("users")',
  'delete("users")',
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function setup() {
  console.log('🚀 Memulai setup Appwrite (REST direct, Server 1.5.x)...\n');

  // 1. Database
  await create(`/databases`, { databaseId: DB_ID, name: 'Simplify Library Database' }, `Database: ${DB_ID}`);
  await sleep(800);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. categories collection
  // ──────────────────────────────────────────────────────────────────────────
  const catCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: CATEGORIES_COL,
    name: 'categories',
    permissions: PERMS,
    documentSecurity: false,
  }, `Collection: ${CATEGORIES_COL}`);

  if (catCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${CATEGORIES_COL}/attributes/string`, { key: 'name', size: 100, required: true }, 'attr: categories.name');
    await create(`/databases/${DB_ID}/collections/${CATEGORIES_COL}/attributes/string`, { key: 'slug', size: 100, required: true }, 'attr: categories.slug');
    await create(`/databases/${DB_ID}/collections/${CATEGORIES_COL}/attributes/string`, { key: 'description', size: 500, required: false }, 'attr: categories.description');
    await sleep(2000); // Tunggu attribute processing
    await create(`/databases/${DB_ID}/collections/${CATEGORIES_COL}/indexes`, { key: 'slug_idx', type: 'unique', attributes: ['slug'] }, 'index: categories.slug');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. books collection
  // ──────────────────────────────────────────────────────────────────────────
  const booksCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: BOOKS_COL,
    name: 'books',
    permissions: PERMS,
    documentSecurity: false,
  }, `Collection: ${BOOKS_COL}`);

  if (booksCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'original_title', size: 300, required: true }, 'attr: books.original_title');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'simplified_title', size: 300, required: true }, 'attr: books.simplified_title');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'original_author', size: 200, required: true }, 'attr: books.original_author');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'description', size: 5000, required: false }, 'attr: books.description');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'cover_image_id', size: 100, required: false }, 'attr: books.cover_image_id');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'category_id', size: 50, required: true }, 'attr: books.category_id');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/enum`, { key: 'status', elements: ['draft', 'published', 'archived'], required: false, default: 'draft' }, 'attr: books.status');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'slug', size: 300, required: true }, 'attr: books.slug');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/attributes/string`, { key: 'created_by', size: 100, required: false }, 'attr: books.created_by');
    await sleep(2000);
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/indexes`, { key: 'slug_idx', type: 'unique', attributes: ['slug'] }, 'index: books.slug');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/indexes`, { key: 'status_idx', type: 'key', attributes: ['status'] }, 'index: books.status');
    await create(`/databases/${DB_ID}/collections/${BOOKS_COL}/indexes`, { key: 'category_idx', type: 'key', attributes: ['category_id'] }, 'index: books.category_id');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. chapters collection
  // ──────────────────────────────────────────────────────────────────────────
  const chapCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: CHAPTERS_COL,
    name: 'chapters',
    permissions: PERMS,
    documentSecurity: false,
  }, `Collection: ${CHAPTERS_COL}`);

  if (chapCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/string`, { key: 'book_id', size: 50, required: true }, 'attr: chapters.book_id');
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/string`, { key: 'title', size: 300, required: true }, 'attr: chapters.title');
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/integer`, { key: 'order_index', required: false, min: 0, max: 9999, default: 0 }, 'attr: chapters.order_index');
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/string`, { key: 'content', size: 500000, required: false }, 'attr: chapters.content');
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/enum`, { key: 'status', elements: ['draft', 'published'], required: false, default: 'draft' }, 'attr: chapters.status');
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/string`, { key: 'slug', size: 300, required: true }, 'attr: chapters.slug');
    await sleep(2000);
    await create(`/databases/${DB_ID}/collections/${CHAPTERS_COL}/indexes`, { key: 'book_idx', type: 'key', attributes: ['book_id', 'order_index'] }, 'index: chapters.book_id');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. sub_chapters collection
  // ──────────────────────────────────────────────────────────────────────────
  const subChapCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: SUBCHAPTERS_COL,
    name: 'sub_chapters',
    permissions: PERMS,
    documentSecurity: false,
  }, `Collection: ${SUBCHAPTERS_COL}`);

  if (subChapCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/attributes/string`, { key: 'chapter_id', size: 50, required: true }, 'attr: sub_chapters.chapter_id');
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/attributes/string`, { key: 'title', size: 300, required: true }, 'attr: sub_chapters.title');
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/attributes/integer`, { key: 'order_index', required: false, min: 0, max: 9999, default: 0 }, 'attr: sub_chapters.order_index');
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/attributes/string`, { key: 'content', size: 500000, required: false }, 'attr: sub_chapters.content');
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/attributes/string`, { key: 'slug', size: 300, required: true }, 'attr: sub_chapters.slug');
    await sleep(2000);
    await create(`/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/indexes`, { key: 'chapter_idx', type: 'key', attributes: ['chapter_id', 'order_index'] }, 'index: sub_chapters.chapter_id');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. user_progress collection
  // ──────────────────────────────────────────────────────────────────────────
  const PROGRESS_COL = process.env.NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID || 'user_progress';
  const progCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: PROGRESS_COL,
    name: 'user_progress',
    permissions: PERMS,
    documentSecurity: false,
  }, `Collection: ${PROGRESS_COL}`);

  if (progCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${PROGRESS_COL}/attributes/string`, { key: 'user_id', size: 50, required: true }, 'attr: user_progress.user_id');
    await create(`/databases/${DB_ID}/collections/${PROGRESS_COL}/attributes/string`, { key: 'book_id', size: 50, required: true }, 'attr: user_progress.book_id');
    await create(`/databases/${DB_ID}/collections/${PROGRESS_COL}/attributes/string`, { key: 'last_chapter_slug', size: 300, required: false }, 'attr: user_progress.last_chapter_slug');
    await create(`/databases/${DB_ID}/collections/${PROGRESS_COL}/attributes/integer`, { key: 'progress_percent', required: false, min: 0, max: 100, default: 0 }, 'attr: user_progress.progress_percent');
    await sleep(2000);
    await create(`/databases/${DB_ID}/collections/${PROGRESS_COL}/indexes`, { key: 'user_book_idx', type: 'unique', attributes: ['user_id', 'book_id'] }, 'index: user_progress.user_book_id');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 9. feedbacks collection
  // ──────────────────────────────────────────────────────────────────────────
  const FEEDBACKS_COL = process.env.NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID || 'feedbacks';
  const fbCreated = await create(`/databases/${DB_ID}/collections`, {
    collectionId: FEEDBACKS_COL,
    name: 'feedbacks',
    permissions: PERMS, // Admin bisa baca/tulis, tapi karena ini public submit, Appwrite REST API dengan Master Key bisa nulis
    documentSecurity: false,
  }, `Collection: ${FEEDBACKS_COL}`);

  if (fbCreated) {
    await sleep(500);
    await create(`/databases/${DB_ID}/collections/${FEEDBACKS_COL}/attributes/string`, { key: 'message', size: 5000, required: true }, 'attr: feedbacks.message');
    await create(`/databases/${DB_ID}/collections/${FEEDBACKS_COL}/attributes/boolean`, { key: 'read', required: false, default: false }, 'attr: feedbacks.read');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Storage Bucket
  // ──────────────────────────────────────────────────────────────────────────
  await create(`/storage/buckets`, {
    bucketId: BUCKET_ID,
    name: 'Simplify Covers',
    permissions: PERMS,
    fileSecurity: false,
    enabled: true,
    maximumFileSize: 5 * 1024 * 1024,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp'],
    compression: 'none',
    encryption: true,
    antivirus: false,
  }, `Storage Bucket: ${BUCKET_ID}`);

  console.log('\n🎉 Setup Appwrite selesai!');
  console.log('\nLangkah selanjutnya:');
  console.log('  1. cd simplify-app && npm run dev');
  console.log('  2. cd blocksuite && npm run dev');
  console.log('  3. Buka http://localhost:3000/admin/login');
}

setup().catch((err) => {
  console.error('\n❌ Error:', err.message || err);
  process.exit(1);
});
