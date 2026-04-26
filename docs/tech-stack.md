# 🛠️ Tech Stack — TemanSkripsi

Dokumen ini menjadi acuan teknologi yang digunakan dalam project **TemanSkripsi** (AI Skripsi Defense Simulator). Stack dipilih agar ramah bagi junior developer, tetapi tetap production-ready.

---

## Overview Arsitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│              Next.js + Tailwind CSS + Framer Motion              │
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTP / REST
┌─────────────────────────────▼────────────────────────────────────┐
│                    BACKEND (Laravel API)                         │
│         app/Http/Controllers  →  app/Services  →  app/Jobs       │
└──────┬──────────────────────┬───────────────────┬────────────────┘
       │                      │                   │
       ▼                      ▼                   ▼
┌─────────────┐   ┌───────────────────┐  ┌───────────────┐
│  Supabase   │   │  Python AI Service │  │  Redis Cache  │
│  (Postgres  │   │  (LangChain + RAG) │  │  (Queue/Cache)│
│  + Storage) │   │  FastAPI / Flask   │  └───────────────┘
└─────────────┘   └───────────────────┘
```

---

## 1. Frontend — Next.js

| Item | Pilihan | Alasan |
|------|---------|--------|
| Framework | **Next.js 14 (App Router)** | SSR/SSG bagus untuk SEO landing page |
| Styling | **Tailwind CSS** | Cepat, tidak perlu banyak CSS custom |
| Animasi Landing Page | **Framer Motion** | Animasi smooth, mudah dipelajari, cocok untuk landing page SaaS |
| Animasi Background | **tsParticles** atau **Spline** | Efek visual seperti partikel/buku terbang yang sesuai tema akademik |
| Chat UI | **shadcn/ui** | Komponen siap pakai, konsisten, mudah dikustomisasi |
| State Management | **Zustand** | Ringan, cocok untuk MVP |
| HTTP Client | **Axios** | Familiar dan konsisten |
| File Upload | **react-dropzone** | Drag & drop PDF/PPT |

### Ide Animasi Landing Page (TemanSkripsi)
- Animasi buku terbuka/bergerak dengan **Framer Motion**
- Efek partikel berbentuk bintang/dokumen menggunakan **tsParticles**
- Hero section dengan typing effect (teks berubah: "Siap Sidang?", "Latihan Sekarang")
- Scroll-triggered animations untuk setiap section fitur

---

## 2. Backend — Laravel

| Item | Pilihan | Alasan |
|------|---------|--------|
| Framework | **Laravel 11** | Matang, banyak dokumentasi, cocok untuk junior |
| PHP | **PHP 8.2+** | Fitur modern, stabil |
| API Style | **REST API (JSON)** | Sederhana dan mudah debug |
| Auth | **Laravel Sanctum** | Token-based auth, ringan untuk SaaS |
| File Storage | **Supabase Storage** via S3 SDK | Terpadu dengan database |
| Queue | **Laravel Queue** + Redis | Proses parsing dokumen secara async |
| Job | `ProcessDocumentJob` | Parsing PDF/PPT → kirim ke AI Service |
| Validation | **Laravel Form Request** | Konsisten dan terstruktur |
| HTTP Client | **Laravel Http (Guzzle)** | Komunikasi ke Python AI Service |

### Struktur Folder Laravel (Rekomendasi)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── DocumentController.php
│   │   ├── SessionController.php
│   │   ├── MessageController.php
│   │   └── AnalysisController.php
│   └── Requests/
│       ├── UploadDocumentRequest.php
│       └── SendMessageRequest.php
├── Services/
│   ├── DocumentService.php
│   ├── AIService.php          ← komunikasi ke Python AI
│   ├── AnalysisService.php
│   └── StorageService.php
└── Jobs/
    └── ProcessDocumentJob.php ← async parsing + embedding
```

---

## 3. AI Service — Python + LangChain

> Dijalankan sebagai microservice terpisah. Laravel memanggil service ini via HTTP.

| Item | Pilihan | Alasan |
|------|---------|--------|
| Language | **Python 3.11** | Ekosistem AI paling lengkap |
| Web Framework | **FastAPI** | Async, cepat, auto docs (Swagger) |
| AI Orchestration | **LangChain** | Standar untuk RAG pipeline |
| LLM Provider | **OpenAI GPT-4o** (atau Gemini) | Kualitas tinggi untuk analisis skripsi |
| Embeddings | **OpenAI text-embedding-3-small** | Murah dan akurat |
| Vector Store | **Supabase pgvector** | Terintegrasi dengan DB utama, tidak perlu infra baru |
| PDF Parser | **pdfplumber** + **PyMuPDF** | Akurat untuk teks skripsi |
| PPT Parser | **python-pptx** | Parsing slide presentasi |
| Output Schema | **Pydantic v2** | Validasi JSON output LLM |

### RAG Pipeline

```
Upload PDF/PPT
      │
      ▼
Parse & Extract Text (pdfplumber / python-pptx)
      │
      ▼
Split into Chunks (RecursiveCharacterTextSplitter, chunk=1000, overlap=200)
      │
      ▼
Generate Embeddings (OpenAI text-embedding-3-small)
      │
      ▼
Store Vectors (Supabase pgvector)
      │
      ▼
Retrieval (similarity_search top-k=5)
      │
      ▼
LLM Call (GPT-4o + system prompt dosen penguji)
      │
      ▼
Structured Output (Pydantic schema → JSON)
      │
      ▼
Return to Laravel API
```

---

## 4. Database — Supabase (PostgreSQL)

| Item | Pilihan |
|------|---------|
| Database | **Supabase PostgreSQL** |
| Auth | **Supabase Auth** (diintegrasikan dengan Laravel Sanctum) |
| File Storage | **Supabase Storage** (bucket: `documents`) |
| Vector Store | **pgvector extension** (untuk embeddings RAG) |
| Realtime | **Supabase Realtime** (opsional: untuk chat streaming) |

---

## 5. Cache & Queue — Redis

> Gunakan Redis hanya jika dibutuhkan. Untuk MVP, bisa mulai tanpa Redis dulu.

| Item | Kegunaan |
|------|----------|
| **Redis** | Cache hasil analisis (agar tidak re-hit LLM untuk dokumen sama) |
| **Redis Queue** | Laravel Queue driver untuk `ProcessDocumentJob` |
| Provider | **Upstash Redis** (serverless, gratis tier tersedia) |

---

## 6. Infrastruktur & Deployment

| Komponen | Platform | Tier Gratis? |
|----------|----------|--------------|
| Frontend (Next.js) | **Vercel** | ✅ Ya |
| Backend (Laravel) | **Railway** atau **Render** | ✅ Ya (limited) |
| AI Service (Python) | **Railway** atau **Render** | ✅ Ya (limited) |
| Database | **Supabase** | ✅ Ya (500MB) |
| Storage | **Supabase Storage** | ✅ Ya (1GB) |
| Redis | **Upstash** | ✅ Ya (10k req/day) |

---

## 7. Dev Tools

| Tool | Kegunaan |
|------|----------|
| **Docker Compose** | Jalankan semua service secara lokal |
| **Postman / Bruno** | Testing API endpoint |
| **pgAdmin** atau **TablePlus** | Kelola database Supabase |
| **GitHub Actions** | CI/CD pipeline |
| **.env** | Konfigurasi secrets (jangan di-commit) |

---

## Urutan Belajar yang Disarankan (untuk Junior Developer)

1. **Setup Supabase** → buat project, jalankan schema SQL
2. **Setup Laravel** → buat API endpoint upload & auth
3. **Setup Python FastAPI** → buat endpoint `/analyze` dan `/chat`
4. **Integrasikan LangChain RAG** → load PDF → embed → retrieve → LLM
5. **Setup Next.js** → landing page + halaman upload + chat UI
6. **Tambahkan animasi** → Framer Motion di landing page
7. **Hubungkan semua** → Laravel ↔ Python AI Service ↔ Frontend

---

## 8. AI Features & Usage

Aplikasi TemanSkripsi menggunakan 4 fitur AI utama yang dijalankan via **Python AI Service (FastAPI + LangChain)**.

### A. Conversational AI (Chatbot Dosen)

**Tujuan**: AI bertindak sebagai dosen penguji yang kritis, mengajukan pertanyaan spesifik tentang skripsi.

**Tech Stack**:
- Model: OpenAI GPT-4o
- Framework: LangChain + LangGraph (untuk state management chat)
- Integration: FastAPI endpoint `/api/chat`

**Flow Penggunaan**:
```
1. User upload dokumen → Document_Chunks created & embedded
2. User send message di chat → Laravel API → Python AI Service
3. AI Service:
   - Retrieve top-5 chunks paling relevan dari vector store
   - Combine chunks + chat history sebagai context
   - LLM generate pertanyaan/respons dengan system prompt "Dosen Penguji"
   - Return JSON response dengan AI message + follow-up flag
4. Response → Database (messages table) → Frontend
```

**Pydantic Schema (Response)**:
```python
class ChatResponse(BaseModel):
    message: str              # Pertanyaan atau respons AI
    turn_index: int          # Urutan giliran
    is_followup: bool        # Apakah AI menggali lebih dalam?
    context_chunks: list[str] # Chunks yang digunakan (debugging)
    tokens_used: int         # Token count (cost tracking)
```

**System Prompt Template**:
```
Anda adalah dosen penguji skripsi yang kritis dan fokus pada logika.
Peran Anda:
- Mengajukan pertanyaan mendalam tentang masalah penelitian, metodologi, dan hasil
- Menggali kelemahan argumen jika jawaban user tidak memuaskan
- Tidak langsung memberi jawaban, biarkan mahasiswa berpikir
- Prioritas: latar belakang → rumusan masalah → metode → hasil & kesimpulan

Konteks Skripsi:
{retrieved_context}

Chat History:
{chat_history}

Pertanyaan/Respons berikutnya:
```

---

### B. Document Understanding & RAG

**Tujuan**: AI membaca & memahami dokumen skripsi secara mendalam untuk konteks simulasi & analisis.

**Tech Stack**:
- Parser: pdfplumber (PDF) + python-pptx (PPT)
- Chunking: LangChain RecursiveCharacterTextSplitter (chunk_size=1000, overlap=200)
- Embeddings: OpenAI text-embedding-3-small (1536 dimensions)
- Vector Store: Supabase pgvector
- Retrieval: pgvector similarity search (cosine distance)

**Flow Processing**:
```
1. User upload PDF/PPT → Document created (parse_status: pending)
2. Laravel Queue trigger ProcessDocumentJob
3. Python Worker:
   - Parse file → extract teks per bab
   - Split into chunks → 1000 char per chunk, overlap 200 char
   - Generate embedding untuk setiap chunk (batch API call)
   - Store chunks + embedding di document_chunks table
   - Update document.parse_status → done
4. Document siap untuk simulasi & analisis
```

**Retrieval Query**:
```sql
-- Dijalankan saat chat/analyze
SELECT id, content, metadata, similarity FROM match_document_chunks(
    query_embedding := <user_question_embedding>,
    match_document := <document_id>,
    match_count := 5,
    match_threshold := 0.7
);
```

**Cost Optimization**:
- Chunk size 1000: balance antara token cost & context relevance
- Overlap 200: mencegah informasi penting terpotong di boundary
- Batch embedding API call: lebih murah daripada per-request
- Cache embedding: jangan re-embed dokumen yang sudah diprocess

---

### C. Automated Analysis & Scoring

**Tujuan**: AI menganalisis skripsi otomatis & memberikan skor per-aspek + feedback.

**Tech Stack**:
- Model: OpenAI GPT-4o
- Output: Pydantic v2 structured schema (force JSON output)
- Storage: analyses + analysis_scores tables

**Flow Analisis**:
```
1. User trigger analisis dokumen → Analysis created (status: pending)
2. Laravel Queue trigger AnalyzeDocumentJob
3. Python Worker:
   - Retrieve ALL chunks dari dokumen (semantic + order-by chunk_index)
   - For each aspect (7 aspek), prompt LLM untuk score:
     a. Kejelasan Latar Belakang
     b. Rumusan Masalah & Tujuan
     c. Kekuatan Metodologi
     d. Kualitas Analisis & Pembahasan
     e. Konsistensi Pembahasan
     f. Kualitas Kesimpulan
     g. Kualitas Referensi
   - Aggregate skor → overall_score (rata-rata)
   - Extract kelemahan, saran, pertanyaan potensial
   - Store hasil → analyses + analysis_scores tables
4. User bisa lihat hasil di dashboard
```

**Pydantic Schema (Analysis Output)**:
```python
class AspectScore(BaseModel):
    aspect: str           # Nama aspek
    score: float          # 0-100
    notes: str           # Penjelasan singkat

class AnalysisResult(BaseModel):
    overall_score: float
    summary: str
    weaknesses: list[str]
    suggestions: list[str]
    potential_questions: list[str]
    aspect_scores: list[AspectScore]
```

**Prompt Template untuk Scoring**:
```
Analisis skripsi berikut berdasarkan aspek: {aspect_name}

Indikator penilaian untuk {aspect_name}:
{aspect_indicators}

Isi Skripsi:
{full_document_text}

Berikan skor 0-100 dan penjelasan singkat untuk aspek ini.

Response harus JSON format:
{
  "aspect": "{aspect_name}",
  "score": <0-100>,
  "notes": "<penjelasan>"
}
```

---

### D. AI-Text Detection (Optional)

**Tujuan**: Deteksi estimasi % teks yang ditulis AI per bab skripsi.

**Tech Stack**:
- Detection: OpenAI GPT-4o embedding + statistical analysis
- Alternative: Third-party API (e.g., OpenAI moderation, Copyleaks)
- Storage: similarity_checks table

**Flow Detection**:
```
1. User trigger AI-text check → Similarity_Checks created (status: pending)
2. Python Worker:
   - Split document by chapters (deteksi "BAB I", "BAB II", dll)
   - For each chapter:
     a. Segment text into paragraphs
     b. Check embedding similarity with known AI outputs
     c. Generate statistical score
   - Store hasil → similarity_checks table (status: done)
3. User lihat report persentase AI-text per bab
```

**Pydantic Schema**:
```python
class SimilarityCheckResult(BaseModel):
    chapter: str
    ai_text_percent: float  # 0-100
    confidence: float       # confidence level (0-1)
    notes: str             # penjelasan
```

**Disclaimer** ⚠️:
```
Catatan: Deteksi AI-text adalah estimasi kasar berbasis statistical analysis.
Akurasi tidak setara dengan Turnitin atau plagiarism checker profesional.
Gunakan hasil ini hanya sebagai referensi pembelajaran, bukan pengganti checker resmi.
```

---

## Environment Variables Contoh

```env
# Laravel (.env)
APP_KEY=<SECRET_PLACEHOLDER>
DB_CONNECTION=pgsql
SUPABASE_URL=<SECRET_PLACEHOLDER>
SUPABASE_KEY=<SECRET_PLACEHOLDER>
AI_SERVICE_URL=http://localhost:8000
REDIS_URL=<SECRET_PLACEHOLDER>
QUEUE_CONNECTION=redis

# Python AI Service (.env)
OPENAI_API_KEY=<SECRET_PLACEHOLDER>
SUPABASE_URL=<SECRET_PLACEHOLDER>
SUPABASE_KEY=<SECRET_PLACEHOLDER>

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_SUPABASE_URL=<SECRET_PLACEHOLDER>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<SECRET_PLACEHOLDER>
```

---

> **Catatan untuk Junior Developer:** Mulai dari satu fitur kecil yang berfungsi end-to-end (upload → parse → 1 pertanyaan AI → reply), sebelum menambah fitur lain. Jangan coba bangun semua sekaligus.
