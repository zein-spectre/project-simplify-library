# Panduan Install Simplify Library di CasaOS (Jalur Mudah UI)

Panduan ini akan menjelaskan cara men-*deploy* aplikasi Simplify Library ke server CasaOS Anda **tanpa menggunakan terminal**. Kita akan langsung mengimpor konfigurasi Docker-Compose melalui antarmuka web CasaOS.

## Prasyarat
- Server CasaOS Anda sudah menyala dan dapat diakses dari browser.
- Anda sudah tahu IP server CasaOS Anda (misal: `192.168.110.124`).
- Port `2002` dan `2003` di CasaOS belum digunakan oleh aplikasi lain.

---

## Langkah Instalasi

1. Buka browser dan login ke **Dashboard CasaOS** Anda.
2. Di halaman utama, cari dan klik area (tombol plus atau App Store) untuk menginstal aplikasi baru (biasanya ikon **App Store**).
3. Di dalam jendela App Store, cari tombol bertuliskan **"Custom Install"** (biasanya ada di pojok kanan atas).
4. Di jendela pemasangan khusus, klik tab/tombol **"Import"** di pojok kanan atas. Akan muncul kolom teks kosong atau permintaan untuk mengunggah file.
5. Anda bisa **mengunggah (upload) file `docker-compose.yml`** yang ada di folder proyek ini, ATAU Anda bisa langsung mem-blok teks (copy-paste) seluruh isi teks di bawah ini ke dalam kolom impor tersebut:

```yaml
version: '3.8'

services:
  simplify-app:
    image: zeinspectre/simplify-library-web:latest
    container_name: simplify-library-web
    restart: unless-stopped
    ports:
      - "2002:3000"
    environment:
      # BlockSuite Editor URL (menggunakan IP lokal CasaOS)
      - NEXT_PUBLIC_BLOCKSUITE_URL=http://192.168.110.124:2003
      
      # Appwrite Configuration
      - NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.geladisalam.my.id
      - NEXT_PUBLIC_APPWRITE_PROJECT_ID=simplify-library-3
      - APPWRITE_API_KEY=78fd3f6c3d92cb3416a4605ab957e6c2dab62f7483ba8a89a7b8b31dfdc70b6efe18a523eff06dceeff136c9d2706e5cee0c2fd69e92a5c1f8fd158af2f511aac76391414a54134350f70057d69efdca1ad7bd958c933d8e08e27f315c867730a8e8c0c75799b53b5e5e626176498e349a84199a86eaa114422ea85d7978ecce
      
      # Database & Collections
      - NEXT_PUBLIC_APPWRITE_DATABASE_ID=simplify-db
      - NEXT_PUBLIC_APPWRITE_BOOKS_COLLECTION_ID=books
      - NEXT_PUBLIC_APPWRITE_CHAPTERS_COLLECTION_ID=chapters
      - NEXT_PUBLIC_APPWRITE_SUBCHAPTERS_COLLECTION_ID=sub_chapters
      - NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=categories
      
      # Storage
      - NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID=simplify-covers
      
      # Bookmarks
      - NEXT_PUBLIC_APPWRITE_BOOKMARKS_COLLECTION_ID=bookmarks
      
      # Progress & Feedback
      - NEXT_PUBLIC_APPWRITE_USER_PROGRESS_COLLECTION_ID=user_progress
      - NEXT_PUBLIC_APPWRITE_FEEDBACKS_COLLECTION_ID=feedbacks

  blocksuite-editor:
    image: zeinspectre/simplify-library-editor:latest
    container_name: simplify-library-editor
    restart: unless-stopped
    ports:
      - "2003:80"
```

6. Setelah teks dimasukkan, klik **Submit** (atau OK). CasaOS akan otomatis mem-parsing dan mengisi formulir kolom pemasangan.
7. Terakhir, klik **Install**.
8. CasaOS akan mengunduh (*pull*) aplikasi yang sudah jadi dari Docker Hub dan menyalakannya. Proses ini membutuhkan waktu beberapa saat (sekitar 1-3 menit tergantung kecepatan internet CasaOS).

---

## Selesai! Cara Mengakses Aplikasi

Setelah instalasi selesai, ikon aplikasi akan muncul di halaman depan CasaOS Anda.
Anda juga bisa langsung membuka browser dan mengetik:

- **Web Katalog:** [http://192.168.110.124:2002](http://192.168.110.124:2002)

*(Catatan: Editor BlockSuite akan dipanggil secara otomatis oleh sistem saat Admin membuka halaman edit buku, jadi Anda tidak perlu mengakses port 2003 secara manual).*
