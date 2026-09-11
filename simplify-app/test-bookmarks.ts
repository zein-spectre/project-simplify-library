import { config } from 'dotenv';
config({ path: '.env.local' });
import { listDocuments, DB_ID, BOOKMARKS_COL, Q } from './src/lib/appwrite-rest';

async function test() {
  console.log("DB_ID:", DB_ID);
  console.log("BOOKMARKS_COL:", BOOKMARKS_COL);
  try {
    const res = await listDocuments(DB_ID, BOOKMARKS_COL, { queries: [Q.limit(1)] });
    console.log("Success! Documents:", res.documents.length);
  } catch (err) {
    console.error("Error fetching bookmarks:", err);
  }
}
test();
