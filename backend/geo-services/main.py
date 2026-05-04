import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import isochrone, heatmap, infrastructure, analytics
from services.database import init_db
from services.cache import init_redis

# Life cycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Initializing Geospatial Service...")
    await init_db()
    await init_redis()
    yield
    # Shutdown
    print("🔌 Shutting down Geospatial Service...")

# Create FastAPI app
app = FastAPI(
    title="Real Estate Geospatial Service",
    description="ML-powered geospatial intelligence for real estate",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(isochrone.router, prefix="/api/isochrone", tags=["isochrone"])
app.include_router(heatmap.router, prefix="/api/heatmap", tags=["heatmap"])
app.include_router(infrastructure.router, prefix="/api/infrastructure", tags=["infrastructure"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {
        "service": "Real Estate Geospatial Intelligence",
        "version": "1.0.0",
        "status": "operational",
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "geospatial",
    }

@app.get("/docs")
async def docs():
    return {
        "swagger": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("ENV") == "development",
    )
