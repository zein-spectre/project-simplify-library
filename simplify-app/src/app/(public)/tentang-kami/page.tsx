import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Tentang Simplify Library — inisiatif literasi hukum terbuka Indonesia.',
};

export default function TentangKamiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Tentang Simplify Library</h1>
      
      <div className="prose-simplify card p-8 sm:p-10">
        <p><em>Assalamu'alaikum wr wb.</em></p>
        
        <p>Hai, saya Salammzein.</p>
        
        <p>
          Simplify Library adalah kumpulan rangkuman dan penyederhanaan dari narasi buku-buku akademik yang seringkali terasa sangat formal.
        </p>

        <p>
          Project personal ini lahir dari pengalaman saya sendiri saat berkuliah, dimana waktu membaca buku akademik atau duduk di kelas perkuliahan, saya sering kesulitan untuk memahami atau berkontribusi di dalam kelas—baik bertanya maupun berkomentar. Setelah disadari, salah satu penyebabnya adalah belum adanya gambaran umum tentang materi yang sedang dibahas, sehingga apa yang disampaikan dosen hanya berhenti pada "oh, begitu", tanpa tahu setelah itu informasi dari materi mau buat apa (selain dihapal untuk ujian).
        </p>

        <p>
          Berbeda halnya dengan aktivitas sehari-hari. Dalam berorganisasi, gambaran umum jelas terlihat dari apa yang telah dikerjakan senior sebelumnya dan itu mudah dipahami karena terbayangkan. Dalam bekerja, kita tahu mengapa suatu pekerjaan dilakukan, skill apa yang dibutuhkan, dan output apa yang akan didapat. Pola pikir semacam ini yang menurut saya sering hilang saat berhadapan dengan teks akademik.
        </p>

        <p>
          Di sisi lain, meskipun mentor atau dosen sudah memberikan rekomendasi bacaan yang baik, banyak mahasiswa saat ini menghadapi keterbatasan waktu. Kesibukan kuliah kerap berbarengan dengan tanggung jawab lain—bekerja, berorganisasi, atau aktivitas lainnya—sehingga waktu dan konsentrasi untuk membaca secara mendalam pun semakin terkikis.
        </p>

        <p>
          Atas dasar itu, saya membangun Simplify Library untuk memberikan gambaran umum dan penyederhanaan narasi dari buku-buku yang umum direkomendasikan bagi mahasiswa, khususnya mahasiswa Hukum Keluarga Islam—bidang yang juga saya tekuni sebagai dosen. Namun, tidak menutup kemungkinan beberapa buku di luar scope tersebut turut dibahas sebagai bacaan penopang.
        </p>

        <p>
          Saya berharap project ini bermanfaat, baik bagi saya sendiri maupun bagi siapa pun yang ingin memahami materi akademik di tengah keterbatasan waktu dan konsentrasi.
        </p>

        <p>
          Prinsip yang saya pegang dalam project ini bukan meringkas seringkas-ringkasnya, melainkan menyederhanakan dengan disertai contoh praktis. Tujuannya bukan agar <strong>membaca lebih cepat</strong>, tapi agar <strong>memahami lebih mudah.</strong>
        </p>
        
        <p><em>Wassalam,</em></p>
        <p>@salammzein</p>
      </div>
    </div>
  );
}
