## Evaluasi Proposal Penelitian (Sempro) — 5 Aspek

Proposal dinilai berdasarkan kelayakan rencana penelitian. Pertanyaan utama: **"Bisa dikerjakan? Layak?"**

Evaluasi menggunakan tepat **5 aspek** berikut dengan bobot masing-masing.

---

### Aspek yang Dievaluasi

**1. latar_belakang — Latar Belakang (Bobot: 20%)**

Kriteria evaluasi:
- **Konteks & Relevansi**: Masalah diposisikan dalam konteks yang jelas (global, nasional, atau institusional); scope masalah proporsional — tidak terlalu umum, tidak terlalu sempit
- **Urgensi & Signifikansi**: Data, fakta, atau statistik terkini mendukung urgensi penelitian; dampak yang terjadi jika masalah tidak ditangani dijelaskan
- **Identifikasi Gap**: Knowledge gap atau practical gap teridentifikasi dengan jelas; penelitian ini diposisikan sebagai "pengisi" gap tersebut
- **Alur Logis**: Alur berpikir natural dari konteks umum → masalah spesifik → justifikasi penelitian; setiap paragraf mendukung argumen, tidak ada tangent

**2. rumusan_masalah — Rumusan Masalah (Bobot: 25%)**

Kriteria evaluasi:
- **Spesifisitas & Kejelasan**: Setiap pertanyaan penelitian spesifik dan tidak bersifat umum atau vague; hubungan antar variabel (jika ada) tercermin dalam pertanyaan
- **Keterukuran (Measurability)**: Pertanyaan dapat dijawab melalui data empiris — bukan pertanyaan filosofis atau normatif; kriteria "terjawab" jelas dan dapat diverifikasi
- **Konsistensi dengan Latar Belakang**: Setiap pertanyaan berasal dari gap atau masalah yang dijelaskan di latar belakang; tidak ada pertanyaan yang "meloncat" dari konteks
- **Delineasi Logis**: Jumlah pertanyaan proporsional (2–4 untuk S1, 3–5 untuk S2); masing-masing pertanyaan unik dan berkontribusi berbeda pada tujuan penelitian
- **Kualitas Formulasi**: Diformulasikan dengan tepat ("Apa...", "Bagaimana...", "Apakah terdapat..."); bukan pertanyaan yang bernada evaluatif subjektif

**3. tujuan — Tujuan Penelitian (Bobot: 15%)**

Kriteria evaluasi:
- **Kesesuaian dengan Rumusan Masalah**: Tujuan umum jelas dan logis mengikuti latar belakang; setiap tujuan khusus menjawab satu pertanyaan penelitian secara langsung; tidak ada tujuan di luar scope masalah
- **Kriteria SMART**: Specific (jelas apa yang ingin dicapai), Measurable (ada indikator keberhasilan), Achievable (realistis dalam konteks penelitian S1/S2), Relevant (relevan dengan masalah), Time-bound (dapat dicapai dalam 6–12 bulan untuk S1)
- **Kelayakan (Feasibility)**: Tujuan realistis untuk diselesaikan dalam timeframe yang direncanakan; tidak ada scope creep atau overambition yang tidak realistis
- **Definisi Output**: Deliverable konkret disebutkan (laporan, model, rekomendasi, tool, prototype); output tersebut measurable dan dapat diobservasi

**4. metode_penelitian — Metode Penelitian (Bobot: 30%)**

Kriteria evaluasi — ini adalah aspek dengan bobot tertinggi:
- **Pemilihan & Justifikasi Metode**: Pendekatan penelitian tepat untuk menjawab pertanyaan (kualitatif/kuantitatif/mixed); ada justifikasi mengapa metode ini dipilih; desain penelitian spesifik dan jelas
- **Sampling & Partisipan**: Strategi sampling jelas (random, purposive, stratified, dll.); ukuran sampel memadai dan ada justifikasi statistik; prosedur rekrutmen partisipan realistis
- **Pengumpulan Data**: Instrumen spesifik disebutkan (kuesioner, wawancara, observasi, data sekunder); prosedur validasi dan reliabilitas instrumen direncanakan; durasi pengumpulan data feasible
- **Analisis Data**: Teknik analisis sesuai dengan jenis data dan pertanyaan penelitian; ada rencana penanganan missing data dan outlier; software atau tools disebutkan
- **Kelayakan & Logistik**: Akses ke lokasi penelitian atau responden sudah ada atau ada rencana jelas; hambatan potensial diidentifikasi dengan contingency plan
- **Etika Penelitian**: Ethical issues teridentifikasi (informed consent, confidentiality); compliance dengan regulasi yang berlaku

**5. daftar_pustaka — Daftar Pustaka (Bobot: 10%)**

Kriteria evaluasi:
- **Kuantitas & Kualitas Sumber**: Jumlah referensi memadai (minimal 15–20 untuk S1, 30–40 untuk S2); minimal 80% adalah sumber primer (original research), bukan secondary summary
- **Relevansi & Coverage**: Relevansi langsung dengan topik penelitian; ada referensi dari berbagai perspektif; landmark papers di bidang ini hadir
- **Kemutakhiran (Recency)**: Minimal 70–80% dari publikasi 5–10 tahun terakhir; ada representasi perkembangan terkini; tidak "stuck" pada literatur lebih dari 10 tahun lalu
- **Representasi Kontekstual**: Jika penelitian konteks Indonesia, ada literatur lokal yang relevan; jika studi komparatif, ada literatur dari berbagai konteks
- **Format Sitasi**: Format citation konsisten (APA, Harvard, Chicago, atau sesuai panduan institusi); setiap entri lengkap (author, tahun, judul, publisher/jurnal, halaman)

---

## Perhitungan Skor Overall

Hitung skor overall sebagai rata-rata **tertimbang** berdasarkan bobot:

```
overall = (latar_belakang × 0.20) + (rumusan_masalah × 0.25) + (tujuan × 0.15) + (metode_penelitian × 0.30) + (daftar_pustaka × 0.10)
```

Bulatkan ke 1 desimal.

---

## Format Output JSON

Balas HANYA dengan JSON berikut — tanpa teks, komentar, atau markdown sebelum/sesudah JSON:

{
  "document_type": "proposal",
  "overall": <rata-rata tertimbang kelima aspek, dibulatkan 1 desimal>,
  "summary": "<2–3 kalimat: sebutkan kekuatan utama dan kelemahan kritis proposal ini secara spesifik terhadap isinya — tidak boleh generik>",
  "aspects": [
    {
      "aspek": "latar_belakang",
      "label": "Latar Belakang",
      "skor": <0–100>,
      "analisa": "<3–5 kalimat analisis yang mengutip atau merujuk langsung ke konten dokumen — spesifik, tidak generik>",
      "saran": "<2–3 saran perbaikan yang konkret dan actionable — sebutkan apa yang harus dilakukan>"
    },
    {
      "aspek": "rumusan_masalah",
      "label": "Rumusan Masalah",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "tujuan",
      "label": "Tujuan Penelitian",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "metode_penelitian",
      "label": "Metode Penelitian",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "daftar_pustaka",
      "label": "Daftar Pustaka",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    }
  ]
}

**Peringatan keras**:
- Kelima aspek dengan kunci `aspek` yang tepat HARUS selalu hadir dalam output
- Urutan aspek HARUS sesuai: latar_belakang, rumusan_masalah, tujuan, metode_penelitian, daftar_pustaka
- Field `document_type` HARUS bernilai "proposal"
- Output HANYA JSON, tidak ada teks lain
