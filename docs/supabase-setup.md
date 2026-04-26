# 🔐 Cara Mendapatkan Supabase Credentials

## Step 1: Buka Supabase Dashboard

Kunjungi: https://app.supabase.com

Login dengan akun Anda.

---

## Step 2: Pilih Project "TemanSkripsi"

Di sidebar kiri, pilih project yang sudah Anda buat.

---

## Step 3: Dapatkan URL & API Key

1. Klik **Settings** (⚙️ icon di sidebar)
2. Pilih **API**
3. Di bagian **Project URL** → Copy full URL
   - Contoh: `https://xxxxx.supabase.co`
4. Di bagian **Project API Keys**:
   - Cari **anon public** → Copy key ini untuk `SUPABASE_ANON_KEY`
   - Cari **service_role secret** → Copy key ini untuk `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4: Edit .env File

```bash
# Dari /Users/alfarizy/Desktop/Project/TemanSkripsi/

# Edit .env (bukan .env.example!)
nano .env

# Atau buka di VS Code
code .env
```

Paste credentials yang sudah di-copy:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

LLM_MODEL=gemini-3-flash-preview
LLM_API_KEY=AIzaSyBg6GoODTIKW7J5UzrajCnA9QBec51rrlI
LLM_TEMPERATURE=0.7
LLM_MAX_TOKEN=2000

FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
FASTAPI_RELOAD=true

DEBUG=true
ENVIRONMENT=development
```

Save file (Ctrl+S di VS Code, atau Ctrl+X → Y di nano).

---

## ⚠️ Penting!

- **JANGAN** commit `.env` ke Git (sudah ada di `.gitignore`)
- `.env.example` boleh di-commit (untuk referensi)
- Keep credentials aman!

---

## ✅ Verify Connection

Setelah .env terisi, test connection:

```bash
python3 -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')

supabase = create_client(url, key)

# Test connection
response = supabase.table('profiles').select('*').limit(1).execute()
print('✅ Supabase connection successful!')
print(f'Response: {response}')
"
```

Expected output:
```
✅ Supabase connection successful!
Response: PostgrestAPIResponse(...)
```

Jika error, check credentials di .env.
