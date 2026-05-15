## Tugas: Analisis & Skoring Skripsi

Evaluasi skripsi berikut secara mendalam berdasarkan **5 aspek penilaian akademik** yang telah ditentukan.

**Judul Skripsi**: {judul_skripsi}

## Konten Skripsi (Sampel Relevan)

{chunks_context}

---

## Instruksi Analisis

Evaluasi skripsi ini berdasarkan tepat 5 aspek berikut. Setiap aspek **wajib** dievaluasi mengacu langsung pada konten dokumen — bukan evaluasi generik atau template.

### Aspek yang Dievaluasi

**1. latar_belakang — Latar Belakang**
Kriteria:
- Relevansi dan urgensi masalah yang diteliti
- Dukungan data dan fakta terkini sebagai landasan
- Kualitas identifikasi gap penelitian
- Kejelasan alur berpikir dari masalah ke solusi penelitian

**2. rumusan_masalah — Rumusan Masalah**
Kriteria:
- Kejelasan dan spesifisitas rumusan masalah
- Konsistensi dengan latar belakang
- Keterukuran (measurability) setiap pertanyaan penelitian
- Cakupan yang tepat — tidak terlalu luas atau sempit

**3. metodologi — Metodologi**
Kriteria:
- Ketepatan pemilihan metode untuk menjawab rumusan masalah
- Kualitas desain penelitian dan teknik sampling
- Justifikasi pemilihan metode dibandingkan alternatif
- Kejelasan prosedur pengumpulan dan analisis data

**4. analisis_pembahasan — Analisis & Pembahasan**
Kriteria:
- Kedalaman analisis terhadap data yang dikumpulkan
- Kemampuan menjelaskan temuan, termasuk anomali
- Konsistensi temuan dengan metodologi yang digunakan
- Hubungan hasil dengan teori dan penelitian sebelumnya

**5. kesimpulan — Kesimpulan & Saran**
Kriteria:
- Keterjawaban semua rumusan masalah dalam kesimpulan
- Kesesuaian kesimpulan dengan temuan penelitian (tidak spekulatif)
- Spesifisitas dan relevansi saran yang diberikan
- Kontribusi nyata penelitian terhadap bidang ilmu

---

## Panduan Skoring

Gunakan rubrik ini secara ketat dan konsisten:

| Rentang | Makna |
|---------|-------|
| 90–100 | Sangat Baik — memenuhi semua kriteria, kualitas setara publikasi jurnal |
| 75–89 | Baik — memenuhi sebagian besar kriteria, ada perbaikan minor |
| 60–74 | Cukup — memenuhi standar minimum, ada kekurangan yang perlu diperbaiki |
| 40–59 | Kurang — banyak kriteria tidak terpenuhi, perlu revisi signifikan |
| 0–39 | Sangat Kurang — tidak memenuhi standar akademik minimum |

**Aturan jujur**: Skor harus mencerminkan kualitas nyata. Jika konten suatu aspek tidak ada atau tidak dapat dinilai dari sampel dokumen, berikan skor ≤50 dan nyatakan keterbatasan tersebut secara eksplisit dalam analisa. **Jangan berasumsi atau mengarang konten yang tidak ada.**

---

## Format Output

Balas HANYA dengan JSON berikut — tanpa teks, komentar, atau markdown sebelum/sesudah JSON:

{
  "overall": <rata-rata tertimbang kelima aspek, dibulatkan 1 desimal>,
  "summary": "<2–3 kalimat: sebutkan kekuatan utama dan kelemahan kritis skripsi ini secara spesifik terhadap isinya, bukan pernyataan generik>",
  "aspects": [
    {
      "aspek": "latar_belakang",
      "label": "Latar Belakang",
      "skor": <0–100>,
      "analisa": "<3–5 kalimat analisis yang mengutip atau merujuk langsung ke konten dokumen — spesifik, bukan generik>",
      "saran": "<2–3 saran perbaikan yang konkret dan actionable — sebutkan apa yang harus dilakukan, bukan sekadar 'perlu diperbaiki'>"
    },
    {
      "aspek": "rumusan_masalah",
      "label": "Rumusan Masalah",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "metodologi",
      "label": "Metodologi",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "analisis_pembahasan",
      "label": "Analisis & Pembahasan",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    },
    {
      "aspek": "kesimpulan",
      "label": "Kesimpulan & Saran",
      "skor": <0–100>,
      "analisa": "<analisis spesifik merujuk konten>",
      "saran": "<saran konkret dan actionable>"
    }
  ]
}

**Peringatan keras**:
- Kelima aspek dengan kunci `aspek` yang tepat HARUS selalu hadir dalam output
- Analisa TIDAK BOLEH menggunakan kalimat generik seperti "bab ini perlu dikembangkan" atau "penulis perlu memperhatikan"
- Saran TIDAK BOLEH hanya berupa "perlu diperbaiki" — harus menyebutkan tindakan spesifik
- Output HANYA JSON, tidak ada teks lain
