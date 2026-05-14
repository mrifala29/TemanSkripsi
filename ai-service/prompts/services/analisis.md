## Tugas: Analisis & Skoring Skripsi

Evaluasi skripsi berikut secara objektif berdasarkan 6 aspek akademis.

**Judul Skripsi**: {judul_skripsi}

## Konten Skripsi (Sampel Relevan)

{chunks_context}

---

## Aspek yang Dinilai

Berikan skor 0–100 dan umpan balik konkret untuk setiap aspek berikut.
Terapkan perspektif dan standar akademik sesuai jurusan yang disebutkan dalam konteks di atas.

1. **Kejelasan Latar Belakang** — Masalah spesifik, ada data/fakta pendukung, urutan logika umum→khusus jelas, tujuan relevan
2. **Rumusan Masalah & Tujuan** — Tidak ambigu, konsisten dengan latar belakang, spesifik dan terukur, tidak terlalu luas
3. **Kekuatan Metodologi** — Metode sesuai tujuan, prosedur dijelaskan langkah demi langkah, variabel terdefinisi, alasan pemilihan kuat
4. **Kualitas Analisis & Pembahasan** — Interpretatif bukan hanya deskriptif, ada keterkaitan teori/referensi, data mendukung argumen, tidak ada lompatan logika
5. **Konsistensi Pembahasan** — Latar belakang, metode, dan hasil saling terhubung, tidak kontradiksi antar bab, istilah konsisten
6. **Kualitas Kesimpulan** — Menjawab rumusan masalah, berbasis hasil penelitian (bukan opini baru), ringkas dan jelas

---

## Format Output

Balas HANYA dengan JSON berikut, tanpa teks tambahan sebelum atau sesudah:

{
  "overall": <rata-rata semua skor, dibulatkan 1 desimal>,
  "summary": "<ringkasan kekuatan dan kelemahan utama, 2–3 kalimat>",
  "scores": [
    {"aspect": "Kejelasan Latar Belakang", "score": <0-100>, "feedback": "<umpan balik spesifik mengacu isi skripsi>"},
    {"aspect": "Rumusan Masalah & Tujuan", "score": <0-100>, "feedback": "<umpan balik>"},
    {"aspect": "Kekuatan Metodologi", "score": <0-100>, "feedback": "<umpan balik>"},
    {"aspect": "Kualitas Analisis & Pembahasan", "score": <0-100>, "feedback": "<umpan balik>"},
    {"aspect": "Konsistensi Pembahasan", "score": <0-100>, "feedback": "<umpan balik>"},
    {"aspect": "Kualitas Kesimpulan", "score": <0-100>, "feedback": "<umpan balik>"}
  ],
  "weaknesses": [
    "<kelemahan utama 1 — spesifik>",
    "<kelemahan utama 2>",
    "<kelemahan utama 3>"
  ],
  "suggestions": [
    "<saran perbaikan konkret 1>",
    "<saran perbaikan konkret 2>",
    "<saran perbaikan konkret 3>"
  ],
  "potential_questions": [
    "<pertanyaan yang mungkin diajukan penguji saat sidang 1>",
    "<pertanyaan 2>",
    "<pertanyaan 3>",
    "<pertanyaan 4>"
  ]
}

Catatan penting:
- Skor harus jujur mencerminkan kualitas skripsi — jangan selalu tinggi
- Feedback harus mengacu pada isi skripsi secara spesifik, bukan generik
- Pertanyaan potensial harus realistis seperti yang ditanyakan dosen penguji sungguhan
