## Tugas: Analisis Kesamaan Dokumen + Deteksi Typo

**Judul Skripsi**: {judul_skripsi}

---

## Deskripsi Proses

Layanan ini menjalankan dua pemeriksaan secara berurutan:

### 1. Cek Kesamaan (pgvector — semua dokumen)
1. Ambil semua chunk dari dokumen target
2. Untuk setiap chunk, cari chunk serupa dari dokumen lain menggunakan pgvector cosine similarity
3. Hitung persentase overall similarity: `chunk_dengan_kecocokan / total_chunk × 100`
4. Kembalikan top-10 chunk paling mirip beserta sumber dokumennya

Threshold kemiripan: 0.70 (cosine similarity)

### 2. Deteksi Typo (LLM — khusus Laporan Akhir)
- Hanya dijalankan jika `document_type == "final_report"`
- LLM membaca teks skripsi per halaman, mengidentifikasi typo per kategori:
  - **spelling** — salah ejaan kata
  - **grammatical** — kesalahan tata bahasa
  - **punctuation** — kesalahan tanda baca
- Setiap typo dilengkapi: kata salah, koreksi, nomor halaman, perkiraan baris, kutipan konteks
- Prompt typo detection: `services/kesamaan/typo_check.md`

---

## Output

Layanan ini mengembalikan:
- Persentase kemiripan overall (0–100%)
- Daftar chunk paling mirip + sumber dokumen
- `typo_check` object (null jika bukan Laporan Akhir):
  - `total_typos_detected`
  - `typo_categories`: spelling_errors, grammatical_errors, punctuation_errors
  - `typos_with_location`: list typo dengan page, line, context
- Catatan disclaimer

---

## Disclaimer (selalu ditampilkan ke user)

Pengecekan ini bersifat internal — hanya membandingkan antar dokumen yang ada di sistem TemanSkripsi.
Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional.
Gunakan sebagai referensi awal saja.
