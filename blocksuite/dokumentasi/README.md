# Dokumentasi Proyek: Custom BlockSuite Editor (HTML Preview & LaTeX KaTeX)

Dokumen ini berisi rangkuman teknis lengkap mengenai konfigurasi editor BlockSuite, arsitektur ekstensi, masalah-masalah yang dihadapi, serta solusi teknis yang diterapkan hingga perbaikan rendering LaTeX.

---

## 1. Ringkasan & Spesifikasi Proyek

### Tujuan Proyek
Membangun editor berbasis [BlockSuite](https://github.com/toeverything/blocksuite) yang mampu menerima output teks dari AI Agent (berisi markdown, code block HTML/SVG, dan notasi rumus matematika LaTeX) serta merendernya secara interaktif dan mulus langsung di dalam editor:
1. **Inline HTML Preview**: Code block bertipe `html` memiliki tombol switcher tab **Code** dan **Preview** yang berdampingan dengan selector bahasa tanpa menggunakan modal/popup.
2. **LaTeX Math Rendering**: Mendukung notasi matematika block `$$...$$` (baik single-line maupun multi-line) dan notasi inline `$...$` menggunakan **KaTeX**.
3. **Data Persistence**: Data editor tersimpan otomatis di browser secara lokal menggunakan **IndexedDB** (`y-indexeddb`).

### Tech Stack & Dependensi
- **Bundler & Runtime**: Vite 5 + TypeScript
- **BlockSuite Core**: `@blocksuite/blocks`, `@blocksuite/presets`, `@blocksuite/store` (versi `0.15.0-canary-202406291027-8aed732`)
- **Math Engine**: `katex` (^0.18.7) + `@types/katex`
- **Penyimpanan Lokal**: `y-indexeddb` (^9.0.12)

---

## 2. Struktur Proyek

```
testing-blocksuite/
├── dokumentasi/
│   └── README.md           # Dokumentasi teknis proyek ini
├── index.html              # HTML shell & font/styling dasar
├── package.json            # Daftar dependensi & scripts
├── vite.config.ts          # Konfigurasi Vite
└── src/
    ├── main.ts             # Inisialisasi BlockSuite, doc, store, IndexedDB, dan ekstensi
    ├── html-preview.ts     # Ekstensi switcher tab Code/Preview untuk HTML code blocks
    └── latex-renderer.ts   # Ekstensi scanner & rendering notasi LaTeX dengan KaTeX
```

---

## 3. Inisialisasi Editor & IndexedDB (`src/main.ts`)

### Konfigurasi Dasar
Editor diinisialisasi menggunakan `AffineEditorContainer` dengan `DocCollection` dan schema default `AffineSchemas`.

```typescript
import '@blocksuite/presets/themes/affine.css';
import { AffineSchemas } from '@blocksuite/blocks';
import { AffineEditorContainer } from '@blocksuite/presets';
import { Schema, DocCollection, Text } from '@blocksuite/store';
import { IndexeddbPersistence } from 'y-indexeddb';
import { initHtmlPreview } from './html-preview';
import { initLatexRenderer } from './latex-renderer';

const schema = new Schema().register(AffineSchemas);
const collection = new DocCollection({ schema });
collection.meta.initialize();

const doc = collection.createDoc();

const editor = new AffineEditorContainer();
editor.doc = doc;
editor.mode = 'page';
editor.autofocus = true;
document.body.append(editor);

// Inisialisasi ekstensi
initHtmlPreview(editor);
initLatexRenderer(editor);
```

### Solusi Masalah Persistence Yjs
**Masalah**: Memanggil `doc.load()` sebelum `IndexeddbPersistence` siap atau memanggil inisialisasi block sebelum database tersinkronisasi menyebabkan error Yjs (*"Invalid access"* atau block terduplikasi setiap kali refresh).

**Solusi**: `IndexeddbPersistence` dipasang ke `doc.spaceDoc`, dan `doc.load()` dipanggil di dalam listener `provider.on('synced')`. Callback pembuatan block awal hanya dieksekusi jika dokumen masih kosong:

```typescript
const provider = new IndexeddbPersistence('blocksuite-demo', doc.spaceDoc);

provider.on('synced', () => {
  doc.load(() => {
    const pageBlockId = doc.addBlock('affine:page', {
      title: new Text('Untitled'),
    });
    doc.addBlock('affine:surface', {}, pageBlockId);
    const noteId = doc.addBlock('affine:note', {}, pageBlockId);
    doc.addBlock(
      'affine:paragraph',
      { text: new Text('Hello World! Ketik sesuatu di sini...') },
      noteId
    );
  });
});
```

---

## 4. Ekstensi HTML Preview (`src/html-preview.ts`)

### Kebutuhan & Desain
- Tab switcher **Code** dan **Preview** harus terletak **berdampingan (disamping)** tombol pemilih bahasa ("HTML ▼"), bukan di baris baru dan bukan berupa modal dialog.
- Saat tab **Preview** aktif, area teks kode disembunyikan dan konten HTML langsung dirender menggunakan sandboxed `<iframe>`.

### Penemuan Arsitektur DOM BlockSuite
1. Tombol pemilih bahasa (`affine-code-language-list-widget`) dirender di dalam Shadow DOM / portal via `HoverController` pada koordinat `position: absolute; top: 0; left: 0;` dengan lebar ~68px.
2. Karena menggunakan Shadow DOM, `querySelector` standar tidak dapat langsung mengambil tombol tersebut dari luar komponen host.

### Solusi Implementasi
- Menyematkan pembungkus tombol tab (`tabsWrap`) secara absolut di `top: 2px; left: 72px;` di dalam container `.affine-code-block-container`.
- Mengambil teks isi kode secara bersih dari elemen `<v-line>` atau `<rich-text>`:
  ```typescript
  function getCodeText(codeEl: Element): string {
    const lines = codeEl.querySelectorAll('v-line');
    if (lines.length) {
      return Array.from(lines).map((l) => l.textContent ?? '').join('\n');
    }
    return codeEl.querySelector('rich-text')?.textContent ?? '';
  }
  ```
- Saat tombol **Preview** diklik:
  - `.rich-text-container` dan `#line-numbers` diatur ke `visibility: hidden`.
  - `iframe.srcdoc = getCodeText(codeEl)` dimuat dan `iframe.style.display = 'block'`.
- Saat tombol **Code** diklik:
  - `.rich-text-container` dan `#line-numbers` dikembalikan ke `visibility: ''`.
  - `iframe` disembunyikan kembali.

---

## 5. Ekstensi LaTeX Math Renderer (`src/latex-renderer.ts`)

### Latar Belakang
BlockSuite versi `0.15.0-canary` belum memiliki skema bawaan `LatexBlockSchema` (fitur LaTeX block resmi baru tersedia pada BlockSuite v0.27+). Oleh karena itu, rendering rumus matematika ditangani menggunakan arsitektur scanner berbasis KaTeX.

### Masalah-Masalah Teknis & Solusinya

#### Masalah 1: Infinite Loop pada MutationObserver
- **Gejala**: Halaman web macet total (freeze/unresponsive) sesaat setelah LaTeX dirender.
- **Penyebab**: Saat scanner mendeteksi formula dan menyisipkan elemen DOM KaTeX, mutasi DOM tersebut memicu `MutationObserver` kembali secara terus-menerus tanpa henti.
- **Solusi**:
  1. Menambahkan guard lock `isScanning` boolean flag.
  2. Menggunakan `debouncedScan()` dengan interval 200ms.
  3. Menandai elemen yang sudah diproses dengan atribut `data-latex-rendered="1"`.

#### Masalah 2: Noise Placeholder UI pada `textContent`
- **Gejala**: Rumus matematika gagal diparse oleh KaTeX atau menghasilkan string aneh karena teks paragraph mengandung teks placeholder bawaan BlockSuite (*"Type '/' for commands"*).
- **Solusi**: Mengekstrak teks murni hanya dari sub-elemen internal `<v-text>` yang mewakili ketikan asli pengguna:
  ```typescript
  function getCleanText(el: Element): string {
    const vTexts = el.querySelectorAll('v-text');
    if (vTexts.length > 0) {
      return Array.from(vTexts).map((vt) => vt.textContent ?? '').join('');
    }
    const richText = el.querySelector('rich-text');
    if (richText) {
      const innerVTexts = richText.querySelectorAll('v-text');
      return Array.from(innerVTexts).map((vt) => vt.textContent ?? '').join('');
    }
    return '';
  }
  ```

#### Masalah 3: Editor Terkunci / Tidak Bisa Klik (Overlay Blocking)
- **Gejala**: Setelah rumus dirender, pengguna tidak bisa mengklik paragraf tersebut untuk mengedit rumus kembali.
- **Solusi**:
  1. Menyertakan event listener `click` pada overlay KaTeX yang memanggil fungsi `cleanOverlay()`. Saat diklik, overlay dilepas dan paragraf kembali ke mode edit teks biasa.
  2. Menambahkan listener `selectionchange` pada dokumen: saat kursor keluar (blur) dari paragraf formula, scanner otomatis merender ulang KaTeX.

#### Masalah 4: Notasi Multi-line vs Single-line Block Math
Pengguna sering mem-paste formula matematika dalam format multi-baris seperti:
```
$$
E = \frac{Output}{Input} \times 100
$$
```
Di BlockSuite, baris-baris tersebut dipecah menjadi beberapa node paragraph (`affine-paragraph`) terpisah:
- Paragraf 1: `$$`
- Paragraf 2: `E = \frac{Output}{Input} \times 100`
- Paragraf 3: `$$`

**Solusi**:
1. **Case A (Multi-line Block)**:
   - Scanner mendeteksi paragraf yang hanya berisi `$$`.
   - Melakukan loop ke paragraf-paragraf berikutnya hingga menemukan paragraf penutup `$$`.
   - Menggabungkan isi rumus dan merendernya via `katex.renderToString(mathContent, { displayMode: true })`.
   - Menyisipkan hasil render ke paragraf pembuka dan menyembunyikan paragraf isi + penutup (`maxHeight: '0'`, `opacity: '0'`, `overflow: 'hidden'`).
2. **Case B (Single-line Block)**:
   - Mendeteksi regex `^\$\$([\s\S]+?)\$\$$` dalam satu baris.
   - Merender display math secara absolut/terpusat.
3. **Case C (Inline Math)**:
   - Mendeteksi notasi `$formula$` (dengan perlindungan regex agar tidak salah mendeteksi angka harga dolar seperti `$100`).

---

## 6. Cara Menjalankan & Memverifikasi

### Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui browser pada URL yang tertera (biasanya `http://localhost:5173`).

### Skenario Pengujian

#### 1. Pengujian HTML Preview
1. Buat code block dengan mengetikkan ``` dan pilih bahasa **HTML**.
2. Masukkan kode HTML contoh:
   ```html
   <div style="padding: 16px; background: #2563eb; color: #fff; border-radius: 8px;">
     <h3>Halo dari Preview!</h3>
     <p>Ini adalah rendering HTML interaktif.</p>
   </div>
   ```
3. Klik tombol **Preview** di samping pemilih bahasa. Kode akan terender seketika di dalam iframe.
4. Klik tombol **Code** untuk kembali mengedit kode.

#### 2. Pengujian LaTeX Rumus Matematika
1. **Inline Math**: Ketikkan kalimat seperti `Nilai $E = mc^2$ adalah persamaan relativitas.` lalu klik di luar paragraf. Rumus akan terender rapi sejajar dengan teks.
2. **Single-line Block**: Ketik `$$\sum_{i=1}^n i = \frac{n(n+1)}{2}$$` lalu klik di luar paragraf. Rumus akan terender di tengah.
3. **Multi-line Block**: Paste teks:
   ```
   $$
   E = \frac{Output}{Input} \times 100
   $$
   ```
   Lalu klik di luar paragraf. Rumus efisiensi pecahan akan terender di tengah dengan tampilan KaTeX yang presisi.
4. **Mode Edit**: Klik pada rumus yang sudah terender; overlay akan hilang dan menampilkan teks asli kembali untuk diedit.
