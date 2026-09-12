import { Schema, DocCollection, Job } from '@blocksuite/store';
import { AffineSchemas } from '@blocksuite/blocks';
import { AffineEditorContainer } from '@blocksuite/presets';

const schema = new Schema().register(AffineSchemas);
const collection = new DocCollection({ schema });
collection.meta.initialize();

const doc = collection.createDoc({ id: 'test-doc' });
try {
  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {});
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock('affine:paragraph', {}, noteId);
  });
  console.log("Empty doc initialized successfully. Root:", doc.root?.id);
} catch (e) {
  console.error("Error loading empty doc:", e);
}

const doc2 = collection.createDoc({ id: 'test-doc-2' });
try {
  doc2.load();
  console.log("Empty doc (no callback) loaded successfully. Root:", doc2.root?.id);
} catch (e) {
  console.error("Error loading empty doc without callback:", e);
}
