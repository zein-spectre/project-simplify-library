'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publishHierarchy, HierarchyItem } from '@/actions/chapters';
import {
  Tree,
  NodeModel,
  MultiBackend,
  getBackendOptions,
} from '@minoru/react-dnd-treeview';
import { DndProvider } from 'react-dnd';
import {
  GripVertical, Plus, Pencil, Trash2,
  BookOpen, Edit3, Loader2, RefreshCw, Save,
  ChevronDown, ChevronRight
} from 'lucide-react';

interface Chapter {
  $id: string;
  title: string;
  order_index: number;
  parent_id?: string | null;
  status: string;
  slug?: string;
  is_new?: boolean;
}

interface Book {
  $id: string;
  simplified_title: string;
  original_author: string;
  slug?: string;
}

interface ChapterManagerProps {
  book: Record<string, unknown>;
  initialChapters: Record<string, unknown>[];
}

function newTempId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

// Komponen Render Node untuk Tree
const CustomNode = ({ 
  node, 
  depth,
  isOpen,
  onToggle, 
  onDelete, 
  onRename, 
  onAddSub,
  bookId
}: { 
  node: NodeModel<Chapter>; 
  depth: number;
  isOpen: boolean;
  onToggle: (id: NodeModel['id']) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onAddSub: (parentId: string) => void;
  bookId: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(node.text);
  const chapter = node.data!;

  const handleSaveRename = () => {
    if (title.trim() && title !== node.text) {
      onRename(String(node.id), title.trim());
    } else {
      setTitle(node.text); // revert
    }
    setIsEditing(false);
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl group hover:border-primary-200 transition-colors mb-2 shadow-sm"
      style={{ marginLeft: depth * 24 }}
    >
      <div className="text-gray-300 hover:text-gray-500 cursor-grab flex-shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2">
        {/* Toggle chevron (optional, jika punya anak) */}
        <button onClick={() => onToggle(node.id)} className="text-gray-400 hover:text-primary-600 flex-shrink-0">
           {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {isEditing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') {
                setTitle(node.text);
                setIsEditing(false);
              }
            }}
            className="input-field py-1 text-sm w-full"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800 truncate">{node.text}</p>
        )}
      </div>

      {!chapter.is_new && (
        <span className={`badge flex-shrink-0 ${chapter.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {chapter.status === 'published' ? 'Terbit' : 'Draft'}
        </span>
      )}
      {chapter.is_new && (
        <span className="badge bg-blue-100 text-blue-700 flex-shrink-0">
          Baru
        </span>
      )}

      <div className="flex items-center gap-1 flex-shrink-0">
        {!chapter.is_new && (
          <Link
            href={`/admin/books/${bookId}/chapters/${node.id}/editor`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            title="Buka Editor"
          >
            <Edit3 className="w-4 h-4" />
          </Link>
        )}
        {depth < 4 && (
          <button
            onClick={() => {
              if (!isOpen) onToggle(node.id);
              onAddSub(String(node.id));
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="Tambah Sub-bab"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          title="Ganti Nama"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(String(node.id))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Hapus Bab"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function ChapterManager({ book, initialChapters }: ChapterManagerProps) {
  const router = useRouter();
  const typedBook = book as unknown as Book;
  
  // Konversi Initial Chapters ke Format Tree
  const initialTreeData: NodeModel<Chapter>[] = useMemo(() => {
    return initialChapters.map((c: any) => ({
      id: c.$id,
      parent: c.parent_id || '0',
      text: c.title,
      droppable: true,
      data: {
        $id: c.$id,
        title: c.title,
        order_index: c.order_index,
        parent_id: c.parent_id,
        status: c.status,
        slug: c.slug,
        is_new: false,
      }
    }));
  }, [initialChapters]);

  const [treeData, setTreeData] = useState<NodeModel<Chapter>[]>(initialTreeData);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleDrop = (newTreeData: NodeModel[]) => {
    setTreeData(newTreeData as NodeModel<Chapter>[]);
  };

  const handleAddRootChapter = () => {
    if (!newChapterTitle.trim()) return;
    const tempId = newTempId();
    const newNode: NodeModel<Chapter> = {
      id: tempId,
      parent: '0',
      text: newChapterTitle.trim(),
      droppable: true,
      data: {
        $id: tempId,
        title: newChapterTitle.trim(),
        order_index: treeData.length,
        parent_id: null,
        status: 'draft',
        is_new: true,
      }
    };
    setTreeData([...treeData, newNode]);
    setNewChapterTitle('');
  };

  const handleAddSubChapter = (parentId: string) => {
    const subTitle = 'Sub-bab Baru';
    const tempId = newTempId();
    const newNode: NodeModel<Chapter> = {
      id: tempId,
      parent: parentId,
      text: subTitle,
      droppable: true,
      data: {
        $id: tempId,
        title: subTitle.trim(),
        order_index: 999, // akan diurutkan nanti saat save
        parent_id: parentId,
        status: 'draft',
        is_new: true,
      }
    };
    setTreeData([...treeData, newNode]);
  };

  const handleDelete = (id: string) => {
    // Langsung hapus karena ini masih mode draft (bisa di-cancel)
    // Cari semua keturunan untuk ikut dihapus
    const getDescendants = (parentId: string | number): string[] => {
      const children = treeData.filter(n => n.parent === parentId);
      let desc: string[] = [];
      children.forEach(c => {
        desc.push(String(c.id));
        desc = desc.concat(getDescendants(c.id));
      });
      return desc;
    };

    const toDeleteIds = [id, ...getDescendants(id)];
    
    // Masukkan ke array deleted jika asalnya dari database (bukan is_new)
    const existingDeleted = toDeleteIds.filter(did => {
      const node = treeData.find(n => n.id === did);
      return node && !node.data?.is_new;
    });
    
    setDeletedIds([...deletedIds, ...existingDeleted]);
    setTreeData(treeData.filter(n => !toDeleteIds.includes(String(n.id))));
  };

  const handleRename = (id: string, newTitle: string) => {
    setTreeData(treeData.map(node => {
      if (node.id === id) {
        return {
          ...node,
          text: newTitle,
          data: { ...node.data!, title: newTitle }
        };
      }
      return node;
    }));
  };

  const hasChanges = deletedIds.length > 0 || JSON.stringify(treeData) !== JSON.stringify(initialTreeData);

  const handlePublish = () => {
    startTransition(async () => {
      try {
        // Flatten tree dengan DFS agar order_index selalu berurutan sesuai hierarki visual
        const getFlatTree = () => {
          const map = new Map<string, NodeModel<Chapter> & { children: any[] }>();
          treeData.forEach(n => map.set(String(n.id), { ...n, children: [] }));
          
          const roots: any[] = [];
          map.forEach(node => {
            if (node.parent !== '0' && node.parent !== 0 && map.has(String(node.parent))) {
              map.get(String(node.parent))!.children.push(node);
            } else {
              roots.push(node);
            }
          });

          // Urutkan roots berdasarkan kemunculan aslinya di treeData (jaga urutan sibling root)
          roots.sort((a, b) => {
             return treeData.findIndex(n => n.id === a.id) - treeData.findIndex(n => n.id === b.id);
          });
          // Note: Kita asumsikan array asal untuk sibling setingkat sudah benar, 
          // tapi lebih aman sorting chilren juga.
          map.forEach(node => {
            node.children.sort((a, b) => treeData.findIndex(n => n.id === a.id) - treeData.findIndex(n => n.id === b.id));
          });

          const flat: NodeModel<Chapter>[] = [];
          const traverse = (nodes: any[]) => {
            nodes.forEach(n => {
              flat.push(n);
              traverse(n.children);
            });
          };
          traverse(roots);
          return flat;
        };

        const flatTree = getFlatTree();

        // Susun payload berdasarkan urutan tree visual saat ini
        const hierarchyPayload: HierarchyItem[] = flatTree.map((node, index) => ({
          id: String(node.id),
          parent_id: node.parent === '0' || node.parent === 0 ? null : String(node.parent),
          order_index: index, 
          title: node.text,
          is_new: node.data?.is_new
        }));

        await publishHierarchy(typedBook.$id, hierarchyPayload, deletedIds);
        
        // Bersihkan state deleted
        setDeletedIds([]);
        router.refresh();
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleCancel = () => {
    // Tanpa konfirmasi browser
    setTreeData(initialTreeData);
    setDeletedIds([]);
  };

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <div className="flex flex-col gap-6">
        {/* Top: Book Info & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-3">Informasi Buku</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <p className="text-xs text-gray-400">Judul Simplifikasi</p>
                <p className="font-medium text-gray-800">{typedBook.simplified_title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Penulis Asli</p>
                <p>{typedBook.original_author}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Bab</p>
                <p className="font-bold text-primary-600">{treeData.length} Bab (termasuk sub-bab)</p>
              </div>
            </div>
          </div>

          <div className="card p-5 bg-amber-50 border-amber-100 flex flex-col justify-center">
            <h3 className="font-semibold text-sm text-amber-900 mb-2">Panduan Hierarki</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Tekan dan tahan ikon <b>Titik Enam</b> di sebelah kiri untuk menggeser bab. Geser ke atas/bawah untuk mengurutkan, dan <b>geser ke kanan</b> di bawah bab lain untuk menjadikannya sub-bab (maksimal 4 tingkat).
              <br /><br />
              Jangan lupa klik <b>Terbitkan Perubahan</b> agar pengunjung bisa melihat struktur terbaru ini!
            </p>
          </div>
        </div>

        {/* Bottom: Chapter List */}
        <div className="w-full">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-600" />
                <h2 className="font-semibold text-gray-900 text-sm">Struktur Hierarki Bab (Draft)</h2>
              </div>
              <div className="flex items-center gap-2">
                {hasChanges && (
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                    title="Batal"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handlePublish}
                  disabled={isPending || !hasChanges}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Terbitkan Perubahan
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50/50 min-h-[400px]">
              {treeData.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada bab. Tambahkan bab pertama di bawah.</p>
                </div>
              ) : (
                <Tree
                  tree={treeData}
                  rootId={'0'}
                  initialOpen={true}
                  onDrop={handleDrop}
                  classes={{
                    root: "pb-4",
                    draggingSource: "opacity-30",
                    dropTarget: "bg-primary-100/60 ring-2 ring-primary-400 rounded-xl"
                  }}
                  placeholderRender={(node, { depth }) => (
                    <div
                      className="absolute right-0 h-1 bg-primary-500 rounded-full z-10"
                      style={{ left: depth * 24, transform: 'translateY(-50%)' }}
                    />
                  )}
                  render={(node, { depth, isOpen, onToggle }) => (
                    <CustomNode
                      node={node}
                      depth={depth}
                      isOpen={isOpen}
                      onToggle={onToggle}
                      onDelete={handleDelete}
                      onRename={handleRename}
                      onAddSub={handleAddSubChapter}
                      bookId={typedBook.$id}
                    />
                  )}
                />
              )}

              {/* Add Root Chapter */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddRootChapter(); }}
                  placeholder="Judul bab utama baru..."
                  className="input-field text-sm flex-1 bg-white"
                  disabled={isPending}
                />
                <button
                  onClick={handleAddRootChapter}
                  disabled={isPending || !newChapterTitle.trim()}
                  className="btn-primary whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Bab Utama
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
