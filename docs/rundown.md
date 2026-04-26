# 🚀 TemanSkripsi — 2 Week Development Rundown (26 Apr - 9 May 2026)

> **Important**: File ini adalah instruksi lengkap untuk memandu development 2 minggu pertama. Ikuti urutan dengan ketat. Jika ada error, dokumentasikan di `/tmp/debug.log` dan hubungi AI engineer (saya).

---

## 📋 Ringkasan 2 Minggu

> **Strategi**: Frontend-first agar ada tampilan yang bisa dilihat sejak awal. AI & backend feature menyusul setelah UI sudah jalan.

| Minggu | Focus | Deliverable |
|--------|-------|-------------|
| **Week 1** (26 Apr - 2 May) | Infrastructure + Frontend UI | Supabase ✅ + Laravel API ✅ + Next.js UI ⏳ + Halaman upload/chat/analisa |
| **Week 2** (3 May - 9 May) | Backend Logic + AI Integration | Document upload ✅ + Auth ✅ + Python RAG + Simulasi end-to-end |

### Status Saat Ini (26 Apr)
- ✅ **Supabase**: Schema (8 tabel) + pgvector sudah di-import
- ✅ **Laravel**: Server jalan di port 8000, SupabaseService connected, routes ready
- ✅ **Next.js**: Project jalan di port 3000 (pages: Landing, Documents, Sessions, Analysis)
- ✅ **ai-service**: Folder & Dockerfile siap (FastAPI skeleton)
- ✅ **Docker Compose**: Siap untuk orchestrate 3 service
- ⚠️ **Supabase Storage**: Bucket "documents" perlu dibuat manual di Dashboard
- ❌ **Auth**: Belum ada login/register UI & endpoint
- ❌ **Upload**: Endpoint Laravel belum implement logic file storage
- ❌ **AI**: Python FastAPI belum implement RAG & Gemini

---

# WEEK 1: Infrastructure & MVP Core

## Day 1 - Sunday, 26 April (3-4 hours)
**Goal**: Setup Supabase + Database schema + Understand project structure

### Tasks

#### 1.1 Create Supabase Project
```bash
# Kunjungi https://supabase.com
# Sign up → Create new project
# Choose region closest to user base (e.g., Asia-Singapore if possible)
# Remember: Project URL & API Key (save to .env nanti)

# Expected output:
# - Supabase project URL: https://xxxxx.supabase.co
# - Anon Key: eyJ...
# - Service Role Key: eyJ...
```

**Expected time**: 5 min
**Checkpoint**: ✅ Bisa akses Supabase Dashboard

---

#### 1.2 Import Database Schema
```bash
# File: database/schema.sql (sudah siap)

# Step 1: Buka Supabase Dashboard → SQL Editor
# Step 2: Klik "New query"
# Step 3: Copy-paste seluruh isi database/schema.sql
# Step 4: Klik "Run"

# Tunggu sampai selesai. Harusnya output:
# ✓ Success. No rows returned
```

**Expected time**: 10 min
**Checkpoint**: ✅ Semua tabel sudah ada (bisa check di "Tables" sidebar)

---

#### 1.3 Verify Database Structure
```bash
# Di Supabase Dashboard → Table Editor

# Pastikan ada 8 tabel:
# 1. profiles
# 2. documents
# 3. document_chunks
# 4. simulation_sessions
# 5. messages
# 6. analyses
# 7. analysis_scores
# 8. similarity_checks

# Klik setiap tabel → pastikan columns sudah benar
# Khusus document_chunks: pastikan ada column "embedding" dengan type "vector(1536)"
```

**Expected time**: 5 min
**Checkpoint**: ✅ Semua tabel & columns verified

---

#### 1.4 Setup Storage Bucket
```bash
# Di Supabase Dashboard → Storage

# Step 1: Klik "Create a new bucket"
# Step 2: Name: "documents"
# Step 3: Pilih "Private"
# Step 4: Create bucket

# Expected output: Bucket "documents" sudah ada di sidebar Storage
```

**Expected time**: 3 min
**Checkpoint**: ✅ Bucket "documents" ready for file upload

---

#### 1.5 Create .env.local (untuk catatan Supabase credentials)
```bash
cd /Users/alfarizy/Desktop/Project/TemanSkripsi

# Buat file .env.supabase.example (untuk referensi, jangan commit secrets!)
cat > .env.supabase.example << 'EOF'
# Supabase Configuration (JANGAN COMMIT INI KALAU ADA SECRETS!)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=xxxxx

# OpenAI API (untuk LLM & Embeddings)
OPENAI_API_KEY=sk-...

# Redis (opsional, MVP bisa skip dulu)
REDIS_URL=redis://...
EOF

echo "✅ .env.supabase.example dibuat (referensi saja)"
```

**Expected time**: 2 min
**Checkpoint**: ✅ Template env file siap

---

### Day 1 Summary Checklist
- [ ] Supabase project created
- [ ] Database schema imported (8 tables)
- [ ] Storage bucket "documents" created
- [ ] .env template documented
- [ ] No errors di Supabase console

**Time spent**: ~25 min (dari planned 3-4 hours, banyak slack untuk eksperimen)

---

## Day 2 - Monday, 27 April (4-5 hours)
**Goal**: Laravel project setup + Database connection + Basic API structure

### Prerequisites
- PHP 8.2+, Composer installed
- Supabase credentials dari Day 1

### Tasks

#### 2.1 Create Laravel Project
```bash
cd /Users/alfarizy/Desktop/Project/TemanSkripsi

# Install Laravel
composer create-project laravel/laravel backend --prefer-dist

# Output:
# Creating a "laravel/laravel" project...
# ...
# cd backend
# php artisan key:generate
# ✅ Application key set successfully.

cd backend
```

**Expected time**: 5 min (depends on internet)
**Checkpoint**: ✅ Laravel project directory created

---

#### 2.2 Setup Environment Variables (Laravel)
```bash
# Dari backend/ folder

# Copy .env example
cp .env.example .env

# Edit .env dengan Supabase credentials
cat > .env << 'EOF'
APP_NAME="TemanSkripsi"
APP_ENV=local
APP_KEY=base64:... (auto-generated)
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (Supabase PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<SUPABASE_DB_PASSWORD>

# Supabase API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<ANON_KEY>

# AI Service (akan jalankan di localhost:8001)
AI_SERVICE_URL=http://localhost:8001

# Queue (MVP: database, later: redis)
QUEUE_CONNECTION=database

# Redis (optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
EOF

# Generate app key (kalau belum)
php artisan key:generate

# Output:
# ✓ Application key set successfully

**Expected time**: 3 min
**Checkpoint**: ✅ .env configured with Supabase credentials

---

#### 2.3 Create Database Connection Test
```bash
# Test Supabase connection
php artisan tinker

# Di tinker, ketik:
>>> DB::connection('pgsql')->getPdo()
# Output: PDOConnection object (berarti connected!)
# Ketik: exit

# Expected: Tidak ada error connection
```

**Expected time**: 2 min
**Checkpoint**: ✅ Laravel ↔ Supabase connected

---

#### 2.4 Create Laravel Directory Structure & Basic Controllers
```bash
# Dari backend/ folder

# Create app structure
mkdir -p app/Services
mkdir -p app/Http/Requests
mkdir -p app/Jobs

# Create DocumentController
php artisan make:controller DocumentController --resource

# Create SessionController  
php artisan make:controller SessionController --resource

# Create MessageController
php artisan make:controller MessageController --resource

# Create AnalysisController
php artisan make:controller AnalysisController --resource

# Output:
# Controller created successfully.
# (x4 times)
```

**Expected time**: 2 min
**Checkpoint**: ✅ Controllers created

---

#### 2.5 Create Service Classes
```bash
# Buat DocumentService
touch app/Services/DocumentService.php

# Buat AIService (untuk komunikasi ke Python)
touch app/Services/AIService.php

# Buat StorageService
touch app/Services/StorageService.php

# Kita akan implementasi nanti di Day 3
```

**Expected time**: 1 min
**Checkpoint**: ✅ Service files created

---

#### 2.6 Create API Routes Skeleton
```bash
# Edit routes/api.php
cat > routes/api.php << 'EOF'
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\AnalysisController;

Route::middleware('auth:sanctum')->group(function () {
    // Documents
    Route::resource('documents', DocumentController::class);
    Route::post('documents/{id}/parse', [DocumentController::class, 'parse']);
    
    // Sessions (Simulasi)
    Route::resource('sessions', SessionController::class);
    
    // Messages (Chat)
    Route::resource('sessions.messages', MessageController::class)->shallow();
    
    // Analyses
    Route::resource('analyses', AnalysisController::class);
    Route::post('documents/{id}/analyze', [AnalysisController::class, 'analyze']);
});
EOF

# Expected output: routes/api.php updated
```

**Expected time**: 2 min
**Checkpoint**: ✅ API routes skeleton ready

---

#### 2.7 Verify Laravel Setup
```bash
# Test Laravel server
php artisan serve

# Output:
# Laravel development server started: http://127.0.0.1:8000

# Di terminal baru, test:
curl http://localhost:8000/api/documents

# Expected: Error 401 (Unauthenticated) - karena middleware auth:sanctum
# Artinya Laravel jalan & middleware jalan ✅

# Stop server (Ctrl+C)
```

**Expected time**: 2 min
**Checkpoint**: ✅ Laravel server running

---

### Day 2 Summary Checklist
- [ ] Laravel project created
- [ ] .env configured with Supabase
- [ ] Supabase connection verified
- [ ] Controllers created (Document, Session, Message, Analysis)
- [ ] API routes skeleton created
- [ ] Laravel server running without errors

**Time spent**: ~20 min (dari planned 4-5 hours)

---

## Day 3 - Tuesday, 28 April (3-4 hours)
**Goal**: Lengkapi UI frontend — halaman fungsi, koneksi ke API, auth UI

> Day 1 & 2 sudah selesai (Supabase + Laravel). Sekarang fokus: buat UI yang bisa dipakai user, walau backend belum full logic.

### Prerequisite
- Next.js dev server jalan di `http://localhost:3000` ✅
- Laravel dev server jalan di `http://localhost:8000` ✅

---

### Tasks

#### 3.1 Buat Halaman Auth (Login & Register)

Buat dua file baru:

**`frontend/app/auth/login/page.tsx`** — form email + password, panggil `POST /api/auth/login`  
**`frontend/app/auth/register/page.tsx`** — form nama + email + password, panggil `POST /api/auth/register`

Behavior:
- Submit → kirim ke Laravel → simpan token di `localStorage`
- Redirect ke `/documents` setelah login berhasil
- Tampilkan error jika gagal

```bash
# Buat folder auth
mkdir -p frontend/app/auth/login
mkdir -p frontend/app/auth/register
# Buat kedua page.tsx di sana (lihat contoh di bawah)
```

**Checkpoint**: ✅ Form login & register tampil di browser, belum harus connect ke backend yang benar dulu

---

#### 3.2 Tambah Auth ke API Client

Edit `frontend/lib/api.ts` — tambahkan fungsi auth dan header token:

```typescript
// Tambah di lib/api.ts

export const auth = {
  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', { method: 'POST' }),
}

// Update fetchAPI untuk kirim token dari localStorage
function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}
```

**Checkpoint**: ✅ `lib/api.ts` sudah bisa kirim Bearer token

---

#### 3.3 Buat Laravel Auth Endpoints

Di `backend/routes/api.php` tambah:
```php
// Tanpa auth (public)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Dengan auth
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    // ... routes lain
});
```

Buat controller:
```bash
cd backend
php artisan make:controller AuthController
```

Implement 3 method:
1. `register()` → buat user baru di `users` table, return Sanctum token
2. `login()` → verifikasi credentials, return token
3. `logout()` → revoke token

**Checkpoint**: ✅ `POST /api/auth/login` dan `/register` return token JSON

---

#### 3.4 Test Halaman di Browser

Buka browser, cek semua halaman:

| URL | Yang Dilihat |
|-----|-------------|
| `http://localhost:3000` | Landing page dengan 3 card |
| `http://localhost:3000/documents` | Form upload + tabel kosong |
| `http://localhost:3000/sessions` | Tombol "Mulai Simulasi" |
| `http://localhost:3000/analysis` | Placeholder analisa |
| `http://localhost:3000/auth/login` | Form login |
| `http://localhost:3000/auth/register` | Form register |

**Checkpoint**: ✅ Semua halaman tampil tanpa error 500 di browser

---

### Day 3 Summary Checklist
- [ ] Halaman login & register dibuat
- [ ] `lib/api.ts` sudah kirim Bearer token
- [ ] Laravel `AuthController` dibuat
- [ ] `POST /api/auth/login` & `/register` tested via curl
- [ ] Semua halaman Next.js bisa dibuka tanpa error

**Time spent**: ~3-4 hours

---

## Day 4 - Wednesday, 29 April (3-4 hours)
**Goal**: Implement document upload — dari tombol di UI sampai file tersimpan di Supabase Storage

### Tasks

#### 4.1 Buat Supabase Storage Bucket (Manual — 5 menit)

```
1. Buka https://supabase.com → Login → Pilih project TemanSkripsi
2. Klik menu "Storage" di sidebar kiri
3. Klik "Create a new bucket"
4. Name: documents
5. Pilih "Private" (bukan public)
6. Klik "Create bucket"
```

**Checkpoint**: ✅ Bucket "documents" muncul di sidebar Storage

---

#### 4.2 Implement `DocumentController::store()` di Laravel

File: `backend/app/Http/Controllers/DocumentController.php`

Logic:
1. Validate file: tipe `pdf/pptx`, max 20MB
2. Upload file ke Supabase Storage via `SupabaseService`
3. Insert record ke tabel `documents` via Supabase REST API
4. Return JSON dengan data dokumen baru

```php
// Contoh response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "skripsi.pdf",
    "parse_status": "pending",
    "created_at": "2026-04-29T..."
  }
}
```

**Checkpoint**: ✅ `POST /api/documents` dengan file upload berhasil, file muncul di Supabase Storage

---

#### 4.3 Test Upload dari Frontend

Buka `http://localhost:3000/documents`:
1. Klik pilih file → pilih PDF
2. Klik Upload
3. File harus muncul di tabel dengan status `pending`

**Checkpoint**: ✅ Upload dari UI langsung masuk ke Supabase Storage

---

#### 4.4 Implement `DocumentController::index()` (List Documents)

- Query tabel `documents` via Supabase REST
- Filter by `user_id` (dari auth token)
- Return list + status parse

**Checkpoint**: ✅ `GET /api/documents` return list dokumen user

---

### Day 4 Summary Checklist
- [ ] Supabase Storage bucket "documents" dibuat
- [ ] `POST /api/documents` — upload file ke Supabase Storage
- [ ] `GET /api/documents` — list dokumen user
- [ ] Upload berhasil dari UI localhost:3000
- [ ] File muncul di Supabase Storage dashboard

**Time spent**: ~3-4 hours

---

## Day 5 - Thursday, 30 April (4-5 hours)
**Goal**: Koneksi simulasi sidang — buat session, kirim pesan, tampil di chat UI

### Tasks

#### 5.1 Implement `SessionController` di Laravel

Endpoints yang perlu:
- `POST /api/sessions` → buat session baru (input: `document_id`)
- `GET /api/sessions/{id}` → get session detail
- `GET /api/sessions/{id}/messages` → list pesan

```php
// Response POST /api/sessions:
{
  "success": true,
  "data": {
    "id": "uuid-session",
    "document_id": "uuid-doc",
    "status": "active",
    "total_turns": 0
  }
}
```

**Checkpoint**: ✅ Session bisa dibuat via API, tersimpan di Supabase

---

#### 5.2 Implement `MessageController::store()` di Laravel

- `POST /api/sessions/{id}/messages`
- Simpan pesan user ke tabel `messages`
- Untuk sekarang: return response placeholder dari AI (hardcoded "Coba jelaskan lebih detail...")
- Nanti di Day 8+ baru connect ke Python AI

```php
// Response:
{
  "success": true,
  "data": {
    "user_message": { "id": "...", "role": "user", "content": "..." },
    "ai_message": { "id": "...", "role": "ai", "content": "Coba jelaskan lebih detail..." }
  }
}
```

**Checkpoint**: ✅ Chat bisa kirim pesan, AI reply dengan placeholder

---

#### 5.3 Test Chat UI dari Browser

Buka `http://localhost:3000/documents` → klik tombol "Simulasi" di salah satu dokumen  
→ redirect ke `/sessions?doc=UUID`  
→ klik "Mulai Simulasi"  
→ kirim pesan  
→ AI reply dengan placeholder

**Checkpoint**: ✅ Chat flow end-to-end dari browser bekerja (walau AI masih hardcoded)

---

### Day 5 Summary Checklist
- [ ] `POST /api/sessions` → buat session
- [ ] `POST /api/sessions/{id}/messages` → kirim pesan
- [ ] `GET /api/sessions/{id}/messages` → list pesan
- [ ] Chat UI di browser bisa kirim & terima pesan
- [ ] Data tersimpan di Supabase (tabel `messages`)

**Time spent**: ~4-5 hours

---

## Day 6 - Friday, 1 May (3-4 hours)
**Goal**: Halaman analisa — trigger analisa, tampilkan skor placeholder

### Tasks

#### 6.1 Implement `AnalysisController` di Laravel

- `POST /api/documents/{id}/analyze` → buat record analysis (status: pending), return analysis id
- `GET /api/analyses` → list semua analyses user
- `GET /api/analyses/{id}` → detail satu analysis

Untuk sekarang: skor isi dengan dummy data (overall_score: 0, status: pending)  
Nanti di Week 2 baru connect ke Python AI.

**Checkpoint**: ✅ Analisa bisa di-trigger dari API, tersimpan di DB

---

#### 6.2 Test Analisa UI dari Browser

Buka `http://localhost:3000/documents` → klik tombol "Analisa" di dokumen  
→ redirect ke `/analysis?doc=UUID`  
→ klik tombol "Analisa Dokumen"  
→ tampil skor 0 / status pending

**Checkpoint**: ✅ Flow analisa bekerja dari browser, walau skor masih 0

---

#### 6.3 Polish UI

- Tambah loading spinner saat upload / send message / analisa
- Tambah toast notifikasi (berhasil / gagal) — bisa pakai simple state, tidak perlu library dulu
- Pastikan UI responsif di mobile

**Checkpoint**: ✅ UX terasa lebih smooth

---

### Day 6 Summary Checklist
- [ ] `POST /api/documents/{id}/analyze` → buat analysis record
- [ ] `GET /api/analyses` → list analyses
- [ ] Analisa bisa di-trigger dari UI
- [ ] Loading state & error state di semua form
- [ ] Tampilan responsif di mobile

**Time spent**: ~3-4 hours

---

## Day 7 - Saturday, 2 May (Buffer / Catch-up)
**Goal**: Fix bug, test semua flow, siap untuk Week 2 (AI integration)

### Checklist End of Week 1

**UI/Frontend** (selesai semua):
- [ ] Landing page
- [ ] Halaman Upload dokumen
- [ ] Halaman Chat/Simulasi
- [ ] Halaman Analisa
- [ ] Form Login & Register

**Backend/Laravel** (endpoints selesai):
- [ ] `POST /api/auth/register` & `/login`
- [ ] `GET/POST /api/documents`
- [ ] `POST/GET /api/sessions` & `/messages`
- [ ] `POST /api/documents/{id}/analyze`
- [ ] `GET /api/analyses`

**Database**:
- [ ] Semua data tersimpan ke Supabase dengan benar
- [ ] Supabase Storage bucket "documents" ada & berfungsi

**Yang belum (dikerjakan Week 2)**:
- ❌ AI tidak menjawab dengan sebenarnya (masih placeholder)
- ❌ Parsing PDF/PPT belum diimplementasi
- ❌ Embedding & vector search belum jalan
- ❌ Auth login/register belum terhubung penuh ke session

---

# WEEK 2: AI Integration & Polish

## Day 8 - Sunday, 3 May (4-5 hours)
**Goal**: Setup Python FastAPI + parsing PDF/PPT

### Tasks

#### 8.1 Jalankan Python AI Service

```bash
cd /Users/alfarizy/Desktop/Project/TemanSkripsi/ai-service

# Install dependencies
pip install -r requirements.txt

# Jalankan server
uvicorn main:app --reload --port 8001

# Test:
curl http://localhost:8001/health
# Expected: {"status": "ok", "service": "ai-service"}
```

**Checkpoint**: ✅ FastAPI jalan di port 8001, docs di http://localhost:8001/docs

---

#### 8.2 Implement Endpoint `POST /parse`

File: `ai-service/routers/documents.py`

Logic:
1. Terima file (multipart upload)
2. Jika PDF → parse dengan `pdfplumber`
3. Jika PPT/PPTX → parse dengan `python-pptx`
4. Split teks menjadi chunks (1000 chars, overlap 200)
5. Return: `{ chunks: [...], chunk_count: 42 }`

```bash
# Test:
curl -X POST http://localhost:8001/parse \
  -F "file=@skripsi.pdf" \
  -F "document_id=uuid-123"

# Expected:
# {"chunks": ["...", "..."], "chunk_count": 42}
```

**Checkpoint**: ✅ PDF & PPT bisa diparse, chunks keluar

---

#### 8.3 Hubungkan Laravel ke Python: `ProcessDocumentJob`

Buat `backend/app/Jobs/ProcessDocumentJob.php`:
1. Ambil file dari Supabase Storage
2. Kirim ke `POST http://localhost:8001/parse`
3. Simpan chunks ke tabel `document_chunks`
4. Update `documents.parse_status` → `done`

Dispatch job saat upload selesai di `DocumentController::store()`.

**Checkpoint**: ✅ Upload → parse otomatis, `parse_status` berubah dari `pending` ke `done`

---

### Day 8 Summary Checklist
- [ ] Python ai-service jalan di port 8001
- [ ] `POST /parse` endpoint bisa parse PDF & PPT
- [ ] `ProcessDocumentJob` dibuat di Laravel
- [ ] Upload trigger parsing job
- [ ] Document chunks tersimpan di Supabase
- [ ] `parse_status` berubah ke `done` setelah parsing

**Time spent**: ~4-5 hours

---

## Day 9 - Monday, 4 May (4-5 hours)
**Goal**: Implement embedding + vector search (RAG pipeline)

### Tasks

#### 9.1 Implement `POST /embed` di Python

1. Terima: `document_id`, `chunks[]`
2. Kirim chunks ke Gemini Embedding API
3. Simpan ke Supabase `document_chunks` dengan kolom `embedding`
4. Return: `{ stored_count: 42, tokens_used: 1234 }`

> **Catatan**: Kita pakai **Google Gemini** (bukan OpenAI) sesuai file `.env` root.  
> Model embedding: `models/text-embedding-004`  
> Library: `langchain-google-genai`

**Checkpoint**: ✅ Chunks ter-embed dan tersimpan di Supabase dengan vector

---

#### 9.2 Test Vector Search

Di Supabase SQL Editor, test query:
```sql
SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
FROM document_chunks
WHERE document_id = 'uuid-test'
ORDER BY similarity DESC
LIMIT 5;
```

**Checkpoint**: ✅ Vector search return hasil relevan

---

### Day 9 Summary Checklist
- [ ] `POST /embed` endpoint implemented (Gemini embedding)
- [ ] Embeddings tersimpan di `document_chunks`
- [ ] Vector search di Supabase berfungsi
- [ ] `ProcessDocumentJob` diperluas: parse → embed → done

**Time spent**: ~4-5 hours

---

## Day 10 - Tuesday, 5 May (4-5 hours)
**Goal**: Implement AI chat (Gemini + RAG) — replace placeholder response

### Tasks

#### 10.1 Implement `POST /chat` di Python

File: `ai-service/routers/chat.py`

Logic:
1. Terima: `session_id`, `message`, `document_id`, `chat_history[]`
2. Embed pertanyaan user (Gemini embedding)
3. Vector search → retrieve 5 chunks paling relevan
4. Bangun system prompt "dosen penguji" + context chunks + history
5. Call Gemini (`gemini-2.0-flash-preview` atau sesuai `.env`)
6. Return: `{ message: "...", is_followup: false, tokens_used: 123 }`

**System Prompt**:
```
Kamu adalah dosen penguji skripsi yang kritis.
Tugasmu: ajukan satu pertanyaan mendalam tentang skripsi ini.
Jika jawaban mahasiswa lemah, gali lebih dalam.
Jangan langsung memberi jawaban — biarkan mahasiswa berpikir.

Konteks skripsi:
{context}

Riwayat percakapan:
{history}
```

**Checkpoint**: ✅ Chat endpoint reply dengan pertanyaan AI yang relevan dari isi skripsi

---

#### 10.2 Hubungkan Laravel ke Python Chat

Edit `backend/app/Http/Controllers/MessageController.php`:
- Setelah simpan pesan user, call `http://ai-service:8001/chat` (via `AIService.php`)
- Simpan response AI ke tabel `messages`
- Return ke frontend

**Checkpoint**: ✅ Chat di browser kini dibalas AI yang beneran, bukan placeholder

---

### Day 10 Summary Checklist
- [ ] `POST /chat` endpoint (Gemini + RAG) implemented
- [ ] AI reply berdasarkan isi dokumen yang diupload
- [ ] Laravel `MessageController` call Python service
- [ ] Chat di browser end-to-end dengan AI asli

**Time spent**: ~4-5 hours

---

## Day 11 - Wednesday, 6 May (4 hours)
**Goal**: Implement analisa skripsi dengan AI (replace skor placeholder)

### Tasks

#### 11.1 Implement `POST /analyze` di Python

7 aspek penilaian:
| Aspek | Bobot |
|-------|-------|
| Latar Belakang | 15% |
| Rumusan Masalah & Tujuan | 15% |
| Metodologi | 20% |
| Analisis & Pembahasan | 20% |
| Konsistensi | 10% |
| Kesimpulan | 10% |
| Referensi | 10% |

Logic:
1. Retrieve semua chunks dokumen
2. Per aspek: prompt Gemini untuk beri skor 0-100 + feedback
3. Hitung `overall_score` (weighted average)
4. Return structured JSON (Pydantic schema)

**Checkpoint**: ✅ Analisa return skor yang meaningful dari isi skripsi

---

#### 11.2 Hubungkan Laravel ke Python Analyze

Edit `backend/app/Http/Controllers/AnalysisController.php`:
- Call `http://ai-service:8001/analyze`
- Simpan hasil ke tabel `analyses` + `analysis_scores`
- Update status → `done`

**Checkpoint**: ✅ Skor tampil di halaman Analisa browser

---

### Day 11 Summary Checklist
- [ ] `POST /analyze` endpoint implemented
- [ ] 7 aspek di-score dengan Gemini
- [ ] Hasil tersimpan di DB
- [ ] Skor tampil di UI dengan benar

**Time spent**: ~4 hours

---

## Day 12-13 - Thursday-Friday, 7-8 May (6 hours total)
**Goal**: Auth penuh + bug fixing + polish

### Tasks

#### 12.1 Selesaikan Auth Flow

- Register: buat user di Supabase Auth + Sanctum token
- Login: verifikasi via Supabase Auth → return Sanctum token
- Frontend: simpan token di localStorage → kirim di setiap request
- Guard halaman: redirect ke `/auth/login` kalau belum login

**Checkpoint**: ✅ Register → login → akses halaman → logout berjalan mulus

---

#### 12.2 Bug Fixing

Cek semua flow:
- [ ] Upload file besar (>10MB)
- [ ] File PPT (bukan hanya PDF)
- [ ] Chat dengan banyak pesan (>20 turns)
- [ ] Analisa dokumen pendek
- [ ] Error saat AI service mati

---

#### 12.3 UI Polish

- Tambah animasi smooth (Framer Motion) di landing page
- Tambah skeleton loading saat data dimuat
- Error message yang ramah user (bukan raw JSON)

---

### Day 12-13 Summary Checklist
- [ ] Auth flow selesai end-to-end
- [ ] Semua edge case di-test
- [ ] UI terasa polished & profesional

**Time spent**: ~6 hours

---

## Day 14 - Saturday, 9 May (4 hours)
**Goal**: Docker Compose + final testing + siap deploy

### Tasks

#### 14.1 Test Docker Compose

```bash
cd /Users/alfarizy/Desktop/Project/TemanSkripsi

# Jalankan semua service sekaligus
docker compose up --build

# Test semua service:
curl http://localhost:3000          # Frontend
curl http://localhost:8000/api/health  # Laravel
curl http://localhost:8001/health      # Python AI
```

**Checkpoint**: ✅ Semua service jalan via Docker, tidak ada error

---

#### 14.2 Final E2E Test

1. Register akun baru
2. Login
3. Upload PDF skripsi
4. Tunggu `parse_status: done`
5. Klik Simulasi → chat 5 pertanyaan dengan AI
6. Klik Analisa → lihat skor per aspek

**Checkpoint**: ✅ Semua fitur MVP berjalan dari awal sampai akhir

---

#### 14.3 Deployment (Opsional untuk MVP)

| Service | Platform |
|---------|----------|
| Frontend (Next.js) | Vercel |
| Backend (Laravel) | Railway |
| AI Service (Python) | Railway |

```bash
# Frontend
cd frontend && vercel deploy

# Backend & AI: push ke Railway via GitHub
```

---

### Day 14 Summary Checklist
- [ ] Docker Compose semua service berjalan
- [ ] E2E test complete (register → upload → chat → analisa)
- [ ] (Opsional) Deploy ke Vercel + Railway

**Time spent**: ~4 hours

---

## 🏁 Definisi MVP Selesai

Aplikasi dianggap MVP ketika user bisa:
1. ✅ Buka website dan melihat tampilan
2. ✅ Register & login
3. ✅ Upload dokumen skripsi (PDF/PPT)
4. ✅ Mulai simulasi sidang dan chat dengan AI dosen penguji
5. ✅ Lihat analisa & skor skripsi dari AI

---

## ⚠️ Catatan Penting

### .env Files
| File | Dipakai oleh | Isi |
|------|-------------|-----|
| `root/.env` | Python AI Service | `LLM_API_KEY`, `SUPABASE_*`, `LLM_MODEL` |
| `backend/.env` | Laravel | `APP_KEY`, `DB_*`, `SUPABASE_*` |
| `frontend/.env.local` | Next.js | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_*` |

### Port Services
| Service | Port |
|---------|------|
| Next.js Frontend | 3000 |
| Laravel Backend | 8000 |
| Python AI Service | 8001 |

### Jangan Commit
- Semua file `.env` (sudah ada di `.gitignore`)
- `node_modules/`
- `vendor/`

```bash
cd /Users/alfarizy/Desktop/Project/TemanSkripsi

# Create python project folder
mkdir -p ai-service
cd ai-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Expected:
# (venv) $ (prompt should have venv prefix)

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi
uvicorn
python-dotenv
langchain
langchain-openai
supabase
pydantic
pydantic-settings
pdfplumber
PyMuPDF
python-pptx
openai
python-multipart
EOF

# Install dependencies
pip install -r requirements.txt

# Expected:
# Successfully installed fastapi-0.104.1 uvicorn-0.24.0 ...
```

**Expected time**: 5 min
**Checkpoint**: ✅ Python venv setup + requirements installed

---

#### 3.2 Create .env File (Python)
```bash
# Dari ai-service/ folder

cat > .env << 'EOF'
OPENAI_API_KEY=<SECRET_PLACEHOLDER>
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4o

SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<ANON_KEY>

UVICORN_HOST=0.0.0.0
UVICORN_PORT=8001
UVICORN_RELOAD=true
EOF

# Expected: .env file dibuat dengan placeholder
```

**Expected time**: 1 min
**Checkpoint**: ✅ .env created with placeholders

---

#### 3.3 Create FastAPI App Skeleton
```bash
# Create main app structure
mkdir -p app/services
mkdir -p app/schemas
mkdir -p tests

# Create app/__init__.py
touch app/__init__.py

# Create main.py (FastAPI entry point)
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="TemanSkripsi AI Service",
    description="RAG + LLM backend untuk simulasi sidang & analisa skripsi",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

# Import routes later
# from app.routes import chat, analyze
EOF

# Create main entry point main.py di root
cat > main.py << 'EOF'
from app.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
EOF

# Expected: FastAPI app structure created
```

**Expected time**: 2 min
**Checkpoint**: ✅ FastAPI app created

---

#### 3.4 Create LangChain RAG Service Skeleton
```bash
# Create RAG service
cat > app/services/rag_service.py << 'EOF'
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from supabase import create_client
import os

class RAGService:
    def __init__(self):
        self.supabase = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_KEY")
        )
        self.embeddings = OpenAIEmbeddings(
            model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
        )
        self.llm = ChatOpenAI(
            model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o"),
            temperature=0.7
        )
    
    def parse_pdf(self, file_path: str) -> list[str]:
        """Parse PDF dan return list of text chunks"""
        # TODO: Implementasi parsing
        pass
    
    def embed_and_store_chunks(self, document_id: str, chunks: list[str]) -> bool:
        """Generate embeddings & store di Supabase"""
        # TODO: Implementasi embedding & storage
        pass
    
    def retrieve_context(self, document_id: str, query: str, k: int = 5) -> list[str]:
        """Retrieve top-k relevant chunks menggunakan similarity search"""
        # TODO: Implementasi retrieval
        pass
    
    def generate_response(self, context: str, query: str, chat_history: list) -> str:
        """Generate LLM response dengan context & history"""
        # TODO: Implementasi LLM call
        pass

# Create instance
rag_service = RAGService()
EOF

# Expected: RAG service skeleton created
```

**Expected time**: 2 min
**Checkpoint**: ✅ RAG service skeleton created

---

#### 3.5 Create Pydantic Schemas
```bash
# Create schemas
cat > app/schemas/chat.py << 'EOF'
from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    session_id: str
    message: str
    document_id: str

class ChatResponse(BaseModel):
    message: str
    turn_index: int
    is_followup: bool
    tokens_used: int
    context_chunks: Optional[List[str]] = None

class AnalysisRequest(BaseModel):
    document_id: str

class AspectScore(BaseModel):
    aspect: str
    score: float
    notes: str

class AnalysisResponse(BaseModel):
    overall_score: float
    summary: str
    weaknesses: List[str]
    suggestions: List[str]
    potential_questions: List[str]
    aspect_scores: List[AspectScore]
EOF

# Expected: Schemas created
```

**Expected time**: 2 min
**Checkpoint**: ✅ Pydantic schemas created

---

#### 3.6 Create API Routes (Placeholder)
```bash
# Create chat routes
mkdir -p app/routes
cat > app/routes/chat.py << 'EOF'
from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Chat endpoint untuk simulasi sidang
    TODO: Implementasi dengan RAG service
    """
    return ChatResponse(
        message="Placeholder response",
        turn_index=1,
        is_followup=False,
        tokens_used=0
    )

@router.post("/analyze", response_model=dict)
async def analyze_document(document_id: str):
    """
    Analyze endpoint untuk skripsi analysis
    TODO: Implementasi dengan RAG + scoring
    """
    return {"status": "analyzing", "document_id": document_id}
EOF

# Import routes di main.py
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.routes import chat

load_dotenv()

app = FastAPI(
    title="TemanSkripsi AI Service",
    description="RAG + LLM backend untuk simulasi sidang & analisa skripsi",
    version="0.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

# Include routes
app.include_router(chat.router)
EOF

# Expected: Routes created & included
```

**Expected time**: 2 min
**Checkpoint**: ✅ Routes created

---

#### 3.7 Test FastAPI Server
```bash
# Dari ai-service/ folder, venv active

python main.py

# Expected:
# INFO:     Uvicorn running on http://0.0.0.0:8001
# INFO:     Application startup complete

# Di terminal baru:
curl http://localhost:8001/health

# Expected:
# {"status":"ok","service":"ai-service"}

# Coba docs:
# Buka browser: http://localhost:8001/docs

# Expected: Swagger UI muncul dengan endpoints listed

# Stop server (Ctrl+C)
```

**Expected time**: 2 min
**Checkpoint**: ✅ FastAPI server running, Swagger docs accessible

---

### Day 3 Summary Checklist
- [ ] Python venv setup
- [ ] FastAPI project created
- [ ] LangChain RAG service skeleton
- [ ] Pydantic schemas defined
- [ ] API routes created
- [ ] FastAPI server running
- [ ] Swagger docs accessible

**Time spent**: ~20 min (dari planned 4-5 hours)

