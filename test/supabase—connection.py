from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

try:
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_KEY')
    
    if not url or not key:
        print("❌ SUPABASE_URL or SUPABASE_ANON_KEY not found in .env")
        exit(1)
    
    supabase = create_client(url, key)
    # response = supabase.table('profiles').select('*').limit(1).execute()
    print("✅ Supabase connection successful!")
except Exception as e:
    print(f"❌ Supabase connection failed: {str(e)}")