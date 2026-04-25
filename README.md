# 🎓 AI Skripsi Defense Simulator (MVP)

## Overview
Aplikasi SaaS untuk membantu mahasiswa latihan sidang skripsi melalui simulasi tanya jawab dengan AI.

Fokus:
* Latihan sidang
* Identifikasi kelemahan skripsi

---

## Features (MVP)

### 1. Upload Dokumen
* Input: PDF atau PPT
* Digunakan sebagai konteks AI

---

### 2. Simulasi Sidang (Core)
Chat interaktif dengan AI sebagai dosen penguji.

Flow:
1. User upload file
2. AI membaca dokumen
3. AI mulai bertanya
4. User menjawab
5. AI memberi respon dan lanjut ke pertanyaan berikutnya

Rules:
* 1 pertanyaan per step
* Tunggu jawaban user
* Gali lebih dalam jika jawaban lemah

---

### 3. Analisa Skripsi
AI memberikan evaluasi dokumen (Proposal atau Laporan Akhir).

Output:
* Skor keseluruhan (0–100)
* Kelemahan utama (bullet points)
* Potensi pertanyaan sidang
* Saran perbaikan

Contoh aspek penilaian:
* Kejelasan latar belakang
* Rumusan Masalah & Tujuan
* Kekuatan Metodologi
* Kualitas Analisis & Pembahasan
* Konsistensi Pembahasan
* Kualitas Kesimpulan

---

### 4. Similarity Check (Basic - Optional)

* Cek kemiripan teks sederhana, bukan Turnitin
* Cek persentase teks yang dibuat oleh AI pada setiap bab

---

## AI Behavior

Role:
* Dosen penguji skripsi

Karakter:
* Kritis
* Fokus logika
* Tidak langsung memberi jawaban

Prioritas pertanyaan:
* Latar belakang
* Rumusan masalah
* Metode
* Hasil & kesimpulan

---
## AI Features

### 1. Conversational AI (Chatbot Dosen)
AI bertindak sebagai dosen penguji yang kritical dan membimbing. 
- **Teknologi**: LLM (GPT-4o) + RAG (Retrieval-Augmented Generation)
- **Fitur**: 
  - Memahami konteks dokumen skripsi
  - Mengajukan pertanyaan spesifik berdasarkan konten
  - Menggali lebih dalam jika jawaban user lemah
  - Memberikan feedback yang konstruktif

### 2. Document Understanding & RAG
AI membaca dan memahami dokumen skripsi secara mendalam.
- **Teknologi**: LangChain + pgvector embeddings + OpenAI
- **Proses**:
  - Parse PDF/PPT → Extract teks
  - Split teks menjadi chunks (1000 chars, overlap 200)
  - Generate vector embeddings untuk setiap chunk
  - Similarity search untuk retrieve konteks relevan saat AI menjawab

### 3. Automated Analysis & Scoring
AI menganalisis skripsi secara otomatis dan memberikan skor.
- **Teknologi**: Structured output (Pydantic) + LLM analysis
- **Output**:
  - Skor per-aspek (0-100): latar belakang, rumusan masalah, metodologi, analisis, konsistensi, kesimpulan, referensi
  - Skor keseluruhan
  - Kelemahan utama (bullet points)
  - Potensi pertanyaan sidang
  - Saran perbaikan spesifik

### 4. AI-Text Detection (Optional)
Cek estimasi persentase teks yang ditulis oleh AI di setiap bab.
- **Teknologi**: AI text detection model
- **Output**: Persentase estimasi AI-generated text per bab
- **Catatan**: Estimasi kasar, bukan setara Turnitin

---
## MVP Goal
* Upload file
* Simulasi sidang sederhana
* Analisa + skor

---

## Positioning
* Alat latihan sidang
* Bukan alat membuat skripsi