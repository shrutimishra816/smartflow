from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users, logs, predictions, watch
from app.db.database import engine, Base
from app.core.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartFlow API",
    description="SmartFlow - Cycle Tracker API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(users.router,       prefix="/api/users",       tags=["Users"])
app.include_router(logs.router,        prefix="/api/logs",        tags=["Symptom Logs"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(watch.router,       prefix="/api/watch",       tags=["Watch Integration"])


@app.get("/")
def root():
    return {"message": "SmartFlow API is running 🌊"}


@app.get("/health")
def health():
    return {"status": "ok"}
