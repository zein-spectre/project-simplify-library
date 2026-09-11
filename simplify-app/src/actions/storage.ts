'use server';

/**
 * storage-actions.ts
 *
 * Upload file ke Appwrite Storage menggunakan REST API multipart/form-data.
 * Tidak menggunakan SDK agar kompatibel dengan Appwrite Server 1.5.x.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;
const BUCKET = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!;

function newId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

/**
 * Upload file cover ke Appwrite Storage.
 * @param file - File object dari FormData
 * @returns file ID yang baru dibuat
 */
export async function uploadCoverFile(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  if (!file) throw new Error('Tidak ada file yang diunggah.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran file melebihi batas 5MB.');

  const fileId = newId();
  const uploadFormData = new FormData();
  uploadFormData.append('fileId', fileId);
  uploadFormData.append('file', file);

  const res = await fetch(
    `${ENDPOINT}/v1/storage/buckets/${BUCKET}/files`,
    {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': API_KEY,
      },
      body: uploadFormData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Upload gagal: ${res.status}`);
  }

  const data = await res.json();
  return data.$id as string;
}

/**
 * Hapus file dari Appwrite Storage.
 */
export async function deleteCoverFile(fileId: string): Promise<void> {
  await fetch(
    `${ENDPOINT}/v1/storage/buckets/${BUCKET}/files/${fileId}`,
    {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': PROJECT,
        'X-Appwrite-Key': API_KEY,
      },
    }
  );
}
