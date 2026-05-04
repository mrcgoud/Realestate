import os
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from geoalchemy2 import Geometry
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Database URL
DATABASE_URL = f"postgresql://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'postgres')}@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', 5432)}/{os.getenv('DB_NAME', 'realestate_dev')}"

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("ENV") == "development",
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
)

# SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base for models
Base = declarative_base()

# Models for geospatial queries
class PropertyLocation(Base):
    __tablename__ = "properties"
    
    id = Column(String, primary_key=True)
    title = Column(String)
    price = Column(Float)
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geometry("POINT", srid=4326))
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    areaSquareFeet = Column(Float)
    type = Column(String)
    city = Column(String)
    state = Column(String)
    status = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)

class InfrastructurePoint(Base):
    __tablename__ = "infrastructure_points"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    type = Column(String)  # school, hospital, metro, park, etc
    latitude = Column(Float)
    longitude = Column(Float)
    location = Column(Geometry("POINT", srid=4326))
    metadata = Column(JSON, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)

async def init_db():
    """Initialize database connection"""
    try:
        logger.info("Initializing database connection...")
        # Create extension if not exists
        with engine.connect() as conn:
            conn.execute("CREATE EXTENSION IF NOT EXISTS postgis")
            conn.commit()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        raise

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
