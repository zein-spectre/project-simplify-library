import { getDocument, DB_ID, BOOKS_COL, CHAPTERS_COL } from '@/lib/appwrite-rest';
import { notFound } from 'next/navigation';
import AdminTopbar from '@/components/admin/AdminTopbar';
import ChapterEditorClient from '@/components/editor/ChapterEditorClient';

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default async function ChapterEditorPage({ params }: PageProps) {
  const { id, chapterId } = await params;

  const [book, chapter] = await Promise.all([
    getDocument(DB_ID, BOOKS_COL, id).catch(() => null),
    getDocument(DB_ID, CHAPTERS_COL, chapterId).catch(() => null),
  ]);

  if (!book || !chapter) notFound();

  const typedBook = book as Record<string, unknown>;
  const typedChapter = chapter as Record<string, unknown>;

  const editorUrl = process.env['NEXT_PUBLIC_BLOCKSUITE_URL'] || 'http://localhost:5173';

  return (
    <>
      <AdminTopbar breadcrumbs={[
        { label: typedBook.simplified_title as string, href: `/admin/books/${id}/chapters` },
        { label: typedChapter.title as string },
        { label: 'Editor' },
      ]} />
      <ChapterEditorClient book={typedBook} chapter={typedChapter} editorUrl={editorUrl} />
    </>
  );
}
