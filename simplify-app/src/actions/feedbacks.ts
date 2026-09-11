'use server';

import { listDocuments, createDocument, updateDocument, deleteDocument, Q, DB_ID, FEEDBACKS_COL } from '@/lib/appwrite-rest';
import { revalidatePath } from 'next/cache';

const uniqueId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

export async function createFeedback(message: string) {
  try {
    if (!FEEDBACKS_COL) return { error: 'Feedback collection not configured' };
    
    await createDocument(DB_ID, FEEDBACKS_COL, uniqueId(), {
      message: message.trim(),
      read: false,
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create feedback:', error);
    return { error: error.message || 'Gagal mengirim pesan.' };
  }
}

export async function getFeedbacks() {
  try {
    if (!FEEDBACKS_COL) return [];
    
    const res = await listDocuments(DB_ID, FEEDBACKS_COL, {
      queries: [
        Q.limit(100),
        Q.orderDesc('$createdAt')
      ]
    });
    
    return res.documents;
  } catch (error) {
    console.error('Failed to get feedbacks:', error);
    return [];
  }
}

export async function markFeedbackRead(id: string) {
  try {
    if (!FEEDBACKS_COL) return false;
    
    await updateDocument(DB_ID, FEEDBACKS_COL, id, {
      read: true
    });
    
    revalidatePath('/admin/feedbacks');
    return true;
  } catch (error) {
    return false;
  }
}

export async function deleteFeedbackAction(id: string) {
  try {
    if (!FEEDBACKS_COL) return false;
    
    await deleteDocument(DB_ID, FEEDBACKS_COL, id);
    
    revalidatePath('/admin/feedbacks');
    return true;
  } catch (error) {
    return false;
  }
}
