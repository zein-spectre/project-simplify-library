/**
 * migrate-chapters-schema.ts
 *
 * Tambah attribute baru ke chapters collection yang sudah ada:
 * - content_json   : JSON snapshot BlockSuite (source of truth)
 * - content_html   : HTML export untuk pembaca publik (build artifact)
 * - renderer_version: versi renderer saat HTML di-generate
 *
 * Juga memastikan sub_chapters collection sudah ada dengan skema lengkap.
 *
 * Jalankan: npx tsx scripts/migrate-chapters-schema.ts
 */

import * as https from 'https';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const ENDPOINT = new URL(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID;
const SUBCHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID;

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
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
        try { resolve({ status: res.statusCode || 0, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode || 0, body: { raw: d } }); }
      });
    });
    request.on('error', reject);
    if (data) request.write(data);
    request.end();
  });
}

async function addAttr(colId, type, key, extra, label) {
  const r = await req('POST', `/databases/${DB_ID}/collections/${colId}/attributes/${type}`, { key, ...extra });
  if (r.status === 201 || r.status === 200 || r.status === 202) console.log(`  OK ${label}`);
  else if (r.status === 409) console.log(`  EXISTS ${label}`);
  else console.error(`  ERROR [${r.status}] ${label}: ${r.body.message || JSON.stringify(r.body)}`);
}

async function createCollection(colId, name, label) {
  const PERMS = ['read("any")', 'create("users")', 'update("users")', 'delete("users")'];
  const r = await req('POST', `/databases/${DB_ID}/collections`, { collectionId: colId, name, permissions: PERMS, documentSecurity: false });
  if (r.status === 201 || r.status === 200 || r.status === 202) { console.log(`OK Collection: ${label}`); return true; }
  else if (r.status === 409) { console.log(`EXISTS Collection: ${label}`); return false; }
  else throw new Error(`[${r.status}] ${label}: ${r.body.message}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function migrate() {
  console.log('Migrasi skema chapters & sub_chapters...\n');
  console.log(`chapters collection: ${CHAPTERS_COL}`);
  await addAttr(CHAPTERS_COL, 'string', 'content_json', { size: 5000000, required: false }, 'chapters.content_json');
  await sleep(300);
  await addAttr(CHAPTERS_COL, 'string', 'content_html', { size: 5000000, required: false }, 'chapters.content_html');
  await sleep(300);
  await addAttr(CHAPTERS_COL, 'string', 'renderer_version', { size: 20, required: false, default: '' }, 'chapters.renderer_version');
  await sleep(2000);

  console.log(`\nsub_chapters collection: ${SUBCHAPTERS_COL}`);
  const created = await createCollection(SUBCHAPTERS_COL, 'sub_chapters', `sub_chapters (${SUBCHAPTERS_COL})`);
  if (created) {
    await sleep(500);
    await addAttr(SUBCHAPTERS_COL, 'string', 'chapter_id', { size: 50, required: true }, 'sub_chapters.chapter_id');
    await addAttr(SUBCHAPTERS_COL, 'string', 'book_id', { size: 50, required: true }, 'sub_chapters.book_id');
    await addAttr(SUBCHAPTERS_COL, 'string', 'title', { size: 300, required: true }, 'sub_chapters.title');
    await addAttr(SUBCHAPTERS_COL, 'integer', 'order_index', { required: false, min: 0, max: 9999, default: 0 }, 'sub_chapters.order_index');
    await addAttr(SUBCHAPTERS_COL, 'string', 'content_json', { size: 5000000, required: false }, 'sub_chapters.content_json');
    await addAttr(SUBCHAPTERS_COL, 'string', 'content_html', { size: 5000000, required: false }, 'sub_chapters.content_html');
    await addAttr(SUBCHAPTERS_COL, 'string', 'renderer_version', { size: 20, required: false, default: '' }, 'sub_chapters.renderer_version');
    await addAttr(SUBCHAPTERS_COL, 'string', 'slug', { size: 300, required: true }, 'sub_chapters.slug');
    await addAttr(SUBCHAPTERS_COL, 'enum', 'status', { elements: ['draft', 'published'], required: false, default: 'draft' }, 'sub_chapters.status');
    await sleep(2000);
    const r = await req('POST', `/databases/${DB_ID}/collections/${SUBCHAPTERS_COL}/indexes`, { key: 'chapter_idx', type: 'key', attributes: ['chapter_id', 'order_index'] });
    if (r.status === 201 || r.status === 409) console.log('  OK index: sub_chapters.chapter_id');
  }
  console.log('\nMigrasi selesai!');
}

migrate().catch((err) => { console.error('Error:', err.message || err); process.exit(1); });
