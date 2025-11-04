from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, profile, financial_data
from app.routes import ai_assistant


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version
)

origins = [o.strip() for o in settings.allowed_origins.split(",") if o]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(profile.router, tags=["Profile"])
app.include_router(financial_data.router,prefix="/financial", tags=["Financial"])
app.include_router(ai_assistant.router)
