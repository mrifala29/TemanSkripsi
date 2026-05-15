# 🎓 AI Skripsi Defense Simulator (MVP)

## Overview
Aplikasi SaaS untuk membantu mahasiswa latihan sidang skripsi melalui simulasi tanya jawab dengan AI.

Fokus:
* Latihan sidang
* Identifikasi kelemahan skripsi

---

## Alur Aplikasi (User Journey)

```
[Landing Page] → [Halaman Harga] → [Login / Register] → [Dashboard App]
     /                /pricing          /auth/login           /documents
                                        /auth/register        /sessions
                                                              /analysis
                                                              /similarity
```

1. User mengunjungi landing page (`/`) — melihat fitur & preview
2. Klik **Mulai Sekarang** → diarahkan ke halaman harga (`/pricing`)
3. Klik **Beli Sekarang** → diarahkan ke login/register (`/auth/login`)
4. Setelah login → masuk ke area app (`/documents`, `/sessions`, dll.)
5. Halaman app **terlindungi** — redirect ke login jika belum autentikasi

---

## Struktur Frontend (3 Zone)

| Zone | Path | Siapa yang Bisa Akses |
|------|------|----------------------|
| **Public / Marketing** | `/`, `/pricing`, `/auth/*` | Semua pengunjung (tanpa login) |
| **App / Dashboard** | `/documents`, `/sessions`, `/analysis`, `/similarity` | User yang sudah login |
| **Admin** | `/admin/*` | Admin saja (role-based) |

Setiap zone punya **navbar berbeda** yang dikendalikan oleh `components/NavbarController.tsx`:
- **Public** (`/`, `/pricing`): navbar marketing (Logo, Harga, Login CTA)
- **App** (`/documents`, `/sessions`, dll.): navbar app (Logo, nav fitur, avatar user, logout)
- **Auth** (`/auth/*`): tanpa navbar
- **Admin** (`/admin/*`): sidebar admin *(belum diimplementasi)*

### Struktur Folder Frontend (Aktual)

```
frontend/app/
├── layout.tsx          ← root layout (import NavbarController)
├── page.tsx            ← landing page (public)
├── pricing/
│   └── page.tsx        ← halaman harga (public)
├── auth/               ← tanpa navbar
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── documents/          ← app zone (butuh login)
│   └── page.tsx        ← dashboard utama user
├── sessions/           ← app zone (butuh login)
│   └── page.tsx
├── analysis/           ← app zone (butuh login)
│   └── page.tsx
└── similarity/         ← app zone (butuh login)
    └── page.tsx

frontend/components/
└── NavbarController.tsx ← client component, deteksi path → render navbar yg tepat

frontend/lib/
├── api.ts              ← API client + auth endpoints + Bearer token
└── auth.ts             ← token storage utilities (localStorage)

frontend/middleware.ts  ← route protection (redirect ke login jika belum auth)
```

> **Catatan**: Tanpa Next.js Route Groups. Pemisahan zona dihandle oleh `NavbarController` + `middleware.ts`.

---

## Features (MVP)

### 1. Upload Dokumen
* Input: **PDF** (Proposal atau Laporan Akhir — dipilih saat upload)
* PPTX tidak didukung
* Digunakan sebagai konteks AI

---

### 2. Simulasi Sidang (Core)
Chat interaktif dengan AI sebagai dosen penguji. Persona berbeda per tipe dokumen:
- **Sempro (Proposal)**: advisory & gatekeeping — menilai kelayakan rencana, membimbing, min. 5 tanya-jawab
- **Sidang (Laporan Akhir)**: kritis & evidence-demanding — menguji konsistensi dan validitas, min. 10 tanya-jawab

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
AI memberikan evaluasi dokumen sesuai tipe:

**Proposal (5 aspek)**:
* Latar Belakang (20%)
* Rumusan Masalah (25%)
* Tujuan Penelitian (15%)
* Metode Penelitian (30%)
* Daftar Pustaka (10%)

**Laporan Akhir (7 aspek)**:
* Abstrak (5%)
* Latar Belakang (10%)
* Rumusan Masalah (15%)
* Tujuan Penelitian (10%)
* Metode Penelitian (20%)
* Hasil dan Pembahasan (30%) — termasuk evaluasi Consistency & Interconnection
* Kesimpulan dan Saran (10%)

Output:
* Skor keseluruhan (0–100)
* Skor + analisa + saran per aspek
* Potensi pertanyaan sidang (Laporan Akhir only)

---

### 4. Cek Kesamaan & Typo (Laporan Akhir)

* Cek kemiripan teks internal (dibandingkan dokumen lain di sistem) — bukan Turnitin
* Deteksi typo: salah ejaan, kesalahan tata bahasa, punctuation
* Laporan typo mencantumkan lokasi halaman dan baris untuk memudahkan koreksi
* Hanya untuk Laporan Akhir (`document_type: final_report`)

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
- **Teknologi**: pgvector embeddings + Gemini
- **Proses**:
  - Parse **PDF** → Extract teks
  - Split teks menjadi chunks (1000 chars, overlap 200)
  - Generate vector embeddings untuk setiap chunk
  - Similarity search untuk retrieve konteks relevan saat AI menjawab

### 3. Automated Analysis & Scoring
AI menganalisis skripsi secara otomatis dan memberikan skor per tipe dokumen.
- **Teknologi**: Structured output (Pydantic) + LLM analysis
- **Output**:
  - Proposal: skor 5 aspek (0-100): latar belakang, rumusan masalah, tujuan, metode penelitian, daftar pustaka
  - Laporan Akhir: skor 7 aspek (0-100): abstrak, latar belakang, rumusan masalah, tujuan penelitian, metode penelitian, hasil dan pembahasan, kesimpulan & saran
  - Skor keseluruhan
  - Analisa teks + saran perbaikan per aspek
  - Potensi pertanyaan sidang (Laporan Akhir only)

### 4. Cek Kesamaan & Typo
Cek kemiripan teks internal + deteksi typo beserta lokasi.
- **Teknologi**: pgvector cosine similarity + LLM typo detection
- **Output**: Persentase kemiripan overall + daftar typo dengan halaman, baris, dan konteks kalimat
- **Catatan**: Cek internal saja, bukan setara Turnitin. Hanya untuk Laporan Akhir.

---
## MVP Goal
* Upload file
* Simulasi sidang sederhana
* Analisa + skor

---

## Positioning
* Alat latihan sidang
* Bukan alat membuat skripsi