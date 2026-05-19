import os

# API Base URL - switches between local and production
API_BASE_URL = os.getenv("VITE_API_URL", "http://127.0.0.1:8000")

print(f"DEBUG: API_BASE_URL = {API_BASE_URL}")
