/**
 * migrate-bookmarks-schema.mjs
 *
 * Script migrasi untuk Tahap 5:
 * Membuat koleksi `bookmarks` di Appwrite.
 *
 * Jalankan: node scripts/migrate-bookmarks-schema.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '../simplify-app/.env.local');
  const content = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key) env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

const env = loadEnv();
const ENDPOINT = env['NEXT_PUBLIC_APPWRITE_ENDPOINT'];
const PROJECT  = env['NEXT_PUBLIC_APPWRITE_PROJECT_ID'];
const API_KEY  = env['APPWRITE_API_KEY'];
const DB_ID    = env['NEXT_PUBLIC_APPWRITE_DATABASE_ID'];
const BOOKMARKS_COL_ID = 'bookmarks';

if (!ENDPOINT || !PROJECT || !API_KEY || !DB_ID) {
  console.error('❌ Environment variables tidak lengkap. Cek simplify-app/.env.local');
  process.exit(1);
}

const headers = {
  'X-Appwrite-Project': PROJECT,
  'X-Appwrite-Key': API_KEY,
  'Content-Type': 'application/json',
};

async function appwriteReq(method, path, body) {
  const url = `${ENDPOINT}/v1${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

async function createAttributeSafe(colId, type, body) {
  const path = `/databases/${DB_ID}/collections/${colId}/attributes/${type}`;
  try {
    await appwriteReq('POST', path, body);
    console.log(`  ✅ Atribut "${body.key}" berhasil ditambahkan`);
  } catch (err) {
    if (err.message?.includes('Attribute with the same') || err.message?.includes('already exists')) {
      console.log(`  ⏩ Atribut "${body.key}" sudah ada — dilewati`);
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  Simplify Library — Migrasi Bookmarks (Tahap 5)');
  console.log('══════════════════════════════════════════════\n');

  console.log(`🔖 STEP 1: Membuat koleksi "${BOOKMARKS_COL_ID}"...`);
  try {
    await appwriteReq('POST', `/databases/${DB_ID}/collections`, {
      collectionId: BOOKMARKS_COL_ID,
      name: 'Bookmarks',
      documentSecurity: false,
      permissions: [
        'read("users")',
        'create("users")',
        'update("users")',
        'delete("users")'
      ],
    });
    console.log(`  ✅ Koleksi "${BOOKMARKS_COL_ID}" berhasil dibuat`);
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log(`  ⏩ Koleksi "${BOOKMARKS_COL_ID}" sudah ada — lanjut ke atribut`);
    } else {
      throw err;
    }
  }

  console.log(`\n📝 STEP 2: Menambah atribut...`);
  
  await createAttributeSafe(BOOKMARKS_COL_ID, 'string', {
    key: 'user_id',
    size: 50,
    required: true,
  });

  await createAttributeSafe(BOOKMARKS_COL_ID, 'string', {
    key: 'book_id',
    size: 50,
    required: true,
  });

  console.log(`\n🔍 STEP 3: Membuat index...`);
  try {
    await appwriteReq('POST', `/databases/${DB_ID}/collections/${BOOKMARKS_COL_ID}/indexes`, {
      key: 'idx_user_book',
      type: 'unique',
      attributes: ['user_id', 'book_id'],
      orders: ['ASC', 'ASC'],
    });
    console.log(`  ✅ Index "idx_user_book" berhasil dibuat`);
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log(`  ⏩ Index "idx_user_book" sudah ada — dilewati`);
    } else {
      console.warn(`  ⚠️  Index "idx_user_book" gagal: ${err.message}`);
    }
  }

  try {
    await appwriteReq('POST', `/databases/${DB_ID}/collections/${BOOKMARKS_COL_ID}/indexes`, {
      key: 'idx_user_id',
      type: 'key',
      attributes: ['user_id'],
      orders: ['ASC'],
    });
    console.log(`  ✅ Index "idx_user_id" berhasil dibuat`);
  } catch (err) {
    if (err.message?.includes('already exists')) {
      console.log(`  ⏩ Index "idx_user_id" sudah ada — dilewati`);
    } else {
      console.warn(`  ⚠️  Index "idx_user_id" gagal: ${err.message}`);
    }
  }

  console.log('\n✅ Selesai!');
  console.log('Jangan lupa update NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID=bookmarks di .env.local\n');
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
