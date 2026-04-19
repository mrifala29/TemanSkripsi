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

## Modes

### Simulation Mode
* Chat interaktif

### Analysis Mode
* Evaluasi dokumen + skor

---

## MVP Goal
* Upload file
* Simulasi sidang sederhana
* Analisa + skor

---

## Positioning
* Alat latihan sidang
* Bukan alat membuat skripsi