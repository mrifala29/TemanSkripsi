## Tugas: Analisis & Skoring Skripsi per Bab

Evaluasi skripsi berikut secara objektif. Berikan analisis **per bab** yang ditemukan dalam konten.

**Judul Skripsi**: {judul_skripsi}

## Konten Skripsi (Sampel Relevan)

{chunks_context}

---

## Instruksi Analisis

Identifikasi semua bab dalam skripsi dari konten di atas (umumnya BAB I–V, namun sesuaikan jika berbeda).
Untuk **setiap bab**, berikan:

- **bab**: nama bab, contoh `"BAB I – Pendahuluan"`, `"BAB III – Metode Penelitian"`
- **skor**: nilai 0–100 berdasarkan kualitas penulisan, kelengkapan, dan ketepatan isi bab tersebut
- **analisa**: analisis mendalam (3–5 kalimat) mengacu langsung pada isi bab — bukan generik
- **saran**: saran perbaikan konkret dan spesifik (2–3 kalimat) untuk bab tersebut

Terapkan standar akademik sesuai jurusan yang disebutkan dalam konteks sistem di atas.

---

## Format Output

Balas HANYA dengan JSON berikut, tanpa teks tambahan sebelum atau sesudah:

{
  "overall": <rata-rata skor semua bab, dibulatkan 1 desimal>,
  "summary": "<ringkasan keseluruhan kekuatan dan kelemahan skripsi, 2–3 kalimat>",
  "babs": [
    {
      "bab": "BAB I – Pendahuluan",
      "skor": <0-100>,
      "analisa": "<analisis spesifik mengacu isi bab>",
      "saran": "<saran perbaikan konkret>"
    },
    {
      "bab": "BAB II – Tinjauan Pustaka",
      "skor": <0-100>,
      "analisa": "<analisis>",
      "saran": "<saran>"
    }
    // ... lanjutkan untuk semua bab yang ditemukan
  ],
  "potential_questions": [
    "<pertanyaan realistis yang mungkin diajukan dosen penguji — spesifik terhadap isi 1>",
    "<pertanyaan 2>",
    "<pertanyaan 3>",
    "<pertanyaan 4>"
  ]
}

Catatan penting:
- Skor harus jujur — jangan selalu tinggi, cerminkan kualitas sebenarnya
- Analisa dan saran harus mengacu pada isi skripsi secara spesifik, bukan template generik
- Jika konten suatu bab tidak tersedia dalam sampel, tetap sertakan bab tersebut dengan skor lebih rendah dan catatan keterbatasan data
- Pertanyaan potensial harus realistis seperti yang ditanyakan dosen penguji sungguhan
