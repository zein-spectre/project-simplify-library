import * as https from 'https';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const ENDPOINT = new URL(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!);
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CHAPTERS_COL = process.env.NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID!;

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

async function addParentIdAttr() {
  console.log('Adding parent_id attribute to chapters collection...');
  const r = await req('POST', `/databases/${DB_ID}/collections/${CHAPTERS_COL}/attributes/string`, {
    key: 'parent_id',
    size: 50,
    required: false
  });

  if (r.status === 201 || r.status === 200 || r.status === 202) {
    console.log('✅ parent_id attribute added successfully.');
  } else if (r.status === 409) {
    console.log('ℹ️ parent_id attribute already exists.');
  } else {
    console.error(`❌ Failed to add parent_id attribute: ${JSON.stringify(r.body)}`);
  }
}

addParentIdAttr();
