## Tugas: Analisis Kesamaan Dokumen

Catatan: Endpoint ini menggunakan pgvector cosine similarity — tidak memanggil LLM.
File ini disediakan sebagai dokumentasi konteks, bukan sebagai prompt aktif.

**Judul Skripsi**: {judul_skripsi}

---

## Deskripsi Proses

Layanan kesamaan (similarity) bekerja secara otomatis:

1. Ambil semua chunk dari dokumen target
2. Untuk setiap chunk, cari chunk serupa dari dokumen lain menggunakan pgvector
3. Hitung persentase overall similarity berdasarkan jumlah chunk yang memiliki kecocokan
4. Kembalikan top-10 chunk paling mirip beserta sumber dokumennya

Threshold kemiripan: 0.70 (cosine similarity)

---

## Output

Layanan ini mengembalikan:
- Persentase kemiripan overall (0–100%)
- Daftar chunk paling mirip + sumber dokumen
- Catatan disclaimer (internal check, bukan Turnitin)

---

## Disclaimer (selalu ditampilkan ke user)

Pengecekan ini bersifat internal — hanya membandingkan antar dokumen yang ada di sistem TemanSkripsi.
Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional.
Gunakan sebagai referensi awal saja.
