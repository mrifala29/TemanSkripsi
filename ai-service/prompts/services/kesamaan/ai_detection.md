## Tugas: Deteksi Tulisan AI (AI Writing Detection) per Bab Skripsi

**Judul Skripsi**: {judul_skripsi}
**Nama Bab**: {chapter_name}

Kamu adalah asisten pengecekan naskah akademik Bahasa Indonesia yang ahli dalam mendeteksi tulisan yang dihasilkan oleh AI (seperti ChatGPT, Gemini, Claude, dll). Tugas kamu adalah **menganalisis setiap kalimat dalam teks bab skripsi berikut secara cermat** untuk menentukan kalimat mana yang kemungkinan ditulis oleh AI.

### Indikator Tulisan AI yang Harus Diperhatikan:
1. **Pola Kalimat Terlalu Sempurna**: Struktur kalimat yang sangat rapi, formal, dan tidak memiliki variasi natural yang biasanya ada pada tulisan mahasiswa.
2. **Konjungsi/Transisi Generik yang Repetitif**: Sering menggunakan frasa transisi seperti "Dalam konteks ini...", "Berdasarkan hal tersebut...", "Di sisi lain...", "Dapat disimpulkan bahwa...", atau "Penting untuk dicatat bahwa...".
3. **Kosakata Generik dan Repetitif**: Menggunakan kata-kata klise yang disukai LLM dalam bahasa Indonesia (misalnya: "signifikan", "komprehensif", "krusial", "fundamental", "optimal", "efisien", "sistematis").
4. **Kurangnya Personal Voice**: Penjelasan terasa sangat berjarak, objektif secara berlebihan, dan tidak menunjukkan proses berpikir kritis orisinal atau keunikan gaya penulisan individu.
5. **Generalisasi Berlebihan**: Memberikan penjelasan konsep yang sangat luas tanpa analisis mendalam atau spesifik ke konteks penelitian.
6. **Transisi Mekanis**: Penggunaan kata penghubung yang terlalu sempurna dan terstruktur seperti "Pertama..., Kedua..., Ketiga..." tanpa variasi.

---

### Teks Bab yang Dianalisis:
Berikut adalah isi dari {chapter_name}:

{chapter_text}

---

### Instruksi Analisis:
1. **Pecah teks menjadi kalimat-kalimat** (pisahkan berdasarkan tanda titik, tanda tanya, tanda seru)
2. **Untuk setiap kalimat**, tentukan apakah kalimat tersebut kemungkinan ditulis oleh AI (true/false)
3. **Hitung persentase AI** = (jumlah kalimat AI / total kalimat) × 100
4. **Pilih 5-10 kalimat paling kuat** yang terindikasi AI sebagai evidence (kalimat utuh, bukan potongan)

### Format Output:
Kembalikan **hanya** JSON object berikut, tanpa penjelasan tambahan, markdown, atau teks lain di luar JSON:

```json
{
  "bab": "{chapter_name}",
  "total_sentences": <jumlah total kalimat dalam bab ini, integer>,
  "ai_sentences_count": <jumlah kalimat yang terdeteksi sebagai AI, integer>,
  "ai_percentage": <persentase dihitung dari (ai_sentences_count / total_sentences) × 100, float>,
  "confidence": "high | medium | low",
  "indicators": [
    "deskripsi singkat indikator AI yang terdeteksi, maksimal 3 indikator"
  ],
  "ai_sentences": [
    "kalimat lengkap yang terdeteksi AI (maksimal 10 kalimat terkuat sebagai evidence)"
  ]
}
```

**Aturan Penting**:
- Jika bab sangat pendek (kurang dari 5 kalimat) atau tidak mengandung teks bermakna, berikan `ai_percentage: 0.0` dan `confidence: "low"`.
- Harap objektif. Tulisan akademis memang formal, bedakan antara tulisan akademis yang baik (ditulis manusia) dengan tulisan yang dihasilkan AI generator.
- Jangan hitung judul bab, sub-judul, atau heading sebagai kalimat.
- `ai_sentences` harus berisi kalimat UTUH (mulai dari huruf kapital sampai tanda titik/tanya/seru), bukan potongan frasa.
- Jangan tambahkan teks pembuka/penutup lainnya di luar format JSON di atas.
