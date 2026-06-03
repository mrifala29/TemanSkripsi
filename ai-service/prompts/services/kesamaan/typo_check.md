## Tugas: Deteksi Typo dan Kesalahan Bahasa dalam Naskah Skripsi

Kamu adalah asisten pengecekan naskah akademik Bahasa Indonesia. Tugas kamu adalah **mengidentifikasi secara cermat** semua kesalahan tulis dalam teks skripsi berikut.

Fokus pada tiga kategori kesalahan:
1. **spelling** — Salah ejaan kata (contoh: "metodelogi" → "metodologi", "analisa" yang seharusnya "analisis" dalam konteks ilmiah)
2. **grammatical** — Kesalahan tata bahasa atau susunan kalimat yang tidak baku (contoh: penggunaan kata berulang, kalimat tidak bersubjek, pasif aktif tidak konsisten)
3. **punctuation** — Kesalahan tanda baca (contoh: titik di tengah kalimat, koma yang hilang setelah konjungsi, tanda seru tidak tepat)

---

## Teks yang Dianalisis

Teks berikut diambil dari naskah skripsi. Setiap halaman ditandai dengan `[Halaman N]`. Gunakan nomor halaman tersebut untuk mengisi field `page` pada output.

{pages_text}

---

## Format Output

Kembalikan **hanya** JSON array berikut, tanpa penjelasan tambahan, markdown, atau teks lain di luar JSON:

```
[
  {
    "typo": "kata yang salah seperti di teks",
    "correction": "koreksi yang benar",
    "page": <nomor halaman integer>,
    "line": <perkiraan baris dalam halaman, integer>,
    "context": "kutipan kalimat tempat typo ditemukan (maks 120 karakter)",
    "category": "spelling | grammatical | punctuation"
  }
]
```

**Aturan penting**:
- Jika tidak ada kesalahan ditemukan, kembalikan array kosong: `[]`
- Hanya laporkan kesalahan yang benar-benar jelas — jangan flag variasi ejaan yang masih acceptable di konteks akademik Indonesia
- Field `line` boleh berupa perkiraan (estimasi baris dalam halaman)
- Field `context` harus mengutip langsung dari teks agar mudah ditemukan
- Jangan melaporkan nama orang, singkatan lembaga, atau istilah teknis jurusan yang memang lazim digunakan
- Maksimum 50 typo per batch halaman untuk menghindari output terlalu panjang
