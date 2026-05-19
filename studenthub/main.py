
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .routes import auth, posts
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()

frontend_origins = os.getenv("FRONTEND_URLS", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if frontend_origins:
    origins.extend([origin.strip() for origin in frontend_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(posts.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
