import os

from dotenv import load_dotenv
from supabase import create_client, Client

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL is missing from .env")


if not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_KEY is missing from .env")


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


print("Supabase client initialized successfully.")