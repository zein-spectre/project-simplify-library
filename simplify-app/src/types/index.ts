// ─── Tipe Data Utama Simplify Library ─────────────────────────────────────────

export type BookStatus = 'draft' | 'published' | 'archived';
export type ChapterStatus = 'draft' | 'published';
export type AdminRole = 'super_admin' | 'editor';
export type MediaType = 'cover' | 'illustration';

export interface Category {
  $id: string;
  name: string;
  slug: string;
  description?: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface Book {
  $id: string;
  original_title: string;
  simplified_title: string;
  original_author: string;
  description: string;
  cover_image_id?: string;
  category_id: string;
  status: BookStatus;
  slug: string;
  created_by: string;
  $createdAt: string;
  $updatedAt: string;
  // Joined (opsional, di-fetch terpisah)
  category?: Category;
  chapter_count?: number;
}

export interface Chapter {
  $id: string;
  book_id: string;
  title: string;
  order_index: number;
  content: string; // JSON string — BlockSuite doc snapshot
  status: ChapterStatus;
  slug: string;
  $createdAt: string;
  $updatedAt: string;
  // Joined
  sub_chapters?: SubChapter[];
}

export interface SubChapter {
  $id: string;
  chapter_id: string;
  title: string;
  order_index: number;
  content: string; // JSON string
  slug: string;
  $createdAt: string;
  $updatedAt: string;
}

// ─── Tipe untuk Form ──────────────────────────────────────────────────────────

export interface BookFormData {
  original_title: string;
  simplified_title: string;
  original_author: string;
  description: string;
  category_id: string;
  status: BookStatus;
  slug: string;
  cover_image_id?: string;
}

export interface ChapterFormData {
  title: string;
  order_index: number;
  status: ChapterStatus;
  slug: string;
  book_id: string;
}

export interface SubChapterFormData {
  title: string;
  order_index: number;
  slug: string;
  chapter_id: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

// ─── Tipe untuk API Response ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
}

export interface AdminUser {
  $id: string;
  name: string;
  email: string;
  labels: string[]; // 'super_admin' | 'editor'
}
