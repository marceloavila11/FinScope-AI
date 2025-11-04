# app/utils/db.py

from pymongo import MongoClient
from app.config import settings

client = MongoClient(settings.mongo_uri)
db = client["finscope"]

# Colecciones explícitas
user_collection = db["users"]
financial_collection = db["financial_data"]
ai_cache_collection = db["ai_cache"]  

def get_db():
    return db

def get_financial_collection():
    return db["financial_data"]

def get_ai_cache_collection():
    return db["ai_cache"]  

def invalidate_ai_cache_for_user(user_email: str):    
    result = ai_cache_collection.delete_many({"user_email": user_email})
    print(f"[CACHE] Invalidada IA para {user_email}: {result.deleted_count} documentos eliminados.")