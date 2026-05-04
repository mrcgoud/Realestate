from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.database import get_db
from services.cache import get_cache, set_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class HeatmapRequest(BaseModel):
    min_latitude: float
    max_latitude: float
    min_longitude: float
    max_longitude: float
    zoom_level: int = 12
    metric: str = "price"  # price, demand, supply, density

class HeatmapPoint(BaseModel):
    latitude: float
    longitude: float
    value: float
    count: int

class HeatmapResponse(BaseModel):
    points: List[HeatmapPoint]
    min_value: float
    max_value: float
    avg_value: float

@router.post("/generate", response_model=HeatmapResponse)
async def generate_heatmap(
    request: HeatmapRequest,
    db: Session = Depends(get_db),
):
    """
    Generate heatmap data for visualization.
    Uses H3 hexagonal binning for efficient spatial aggregation.
    """
    cache_key = f"heatmap:{request.min_lat}:{request.max_lat}:{request.min_lon}:{request.max_lon}:{request.zoom_level}:{request.metric}"
    
    # Check cache
    cached = await get_cache(cache_key)
    if cached:
        return HeatmapResponse(**cached)
    
    try:
        if request.metric == "price":
            response = await _generate_price_heatmap(request, db)
        elif request.metric == "demand":
            response = await _generate_demand_heatmap(request, db)
        elif request.metric == "density":
            response = await _generate_density_heatmap(request, db)
        else:
            raise HTTPException(status_code=400, detail="Invalid metric")
        
        # Cache result
        response_dict = {
            "points": [p.dict() for p in response.points],
            "min_value": response.min_value,
            "max_value": response.max_value,
            "avg_value": response.avg_value,
        }
        await set_cache(cache_key, response_dict, ttl=3600)
        
        return response
        
    except Exception as e:
        logger.error(f"Heatmap generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _generate_price_heatmap(request: HeatmapRequest, db: Session) -> HeatmapResponse:
    """Generate price heatmap using grid aggregation"""
    query = text("""
        WITH grid AS (
            SELECT 
                (FLOOR((p.latitude - :min_lat) / 0.01) * 0.01 + :min_lat) as lat,
                (FLOOR((p.longitude - :min_lon) / 0.01) * 0.01 + :min_lon) as lon,
                AVG(p.price) as avg_price,
                COUNT(*) as count
            FROM properties p
            WHERE p.latitude BETWEEN :min_lat AND :max_lat
            AND p.longitude BETWEEN :min_lon AND :max_lon
            AND p.status = 'available'
            GROUP BY 
                FLOOR((p.latitude - :min_lat) / 0.01),
                FLOOR((p.longitude - :min_lon) / 0.01)
        )
        SELECT lat, lon, avg_price, count FROM grid
        ORDER BY avg_price DESC
    """)
    
    result = db.execute(
        query,
        {
            "min_lat": request.min_latitude,
            "max_lat": request.max_latitude,
            "min_lon": request.min_longitude,
            "max_lon": request.max_longitude,
        }
    )
    
    points = []
    values = []
    
    for row in result:
        point = HeatmapPoint(
            latitude=float(row[0]),
            longitude=float(row[1]),
            value=float(row[2]),
            count=int(row[3]),
        )
        points.append(point)
        values.append(point.value)
    
    return HeatmapResponse(
        points=points,
        min_value=min(values) if values else 0,
        max_value=max(values) if values else 0,
        avg_value=sum(values) / len(values) if values else 0,
    )

async def _generate_demand_heatmap(request: HeatmapRequest, db: Session) -> HeatmapResponse:
    """Generate demand heatmap based on views"""
    query = text("""
        WITH grid AS (
            SELECT 
                (FLOOR((p.latitude - :min_lat) / 0.01) * 0.01 + :min_lat) as lat,
                (FLOOR((p.longitude - :min_lon) / 0.01) * 0.01 + :min_lon) as lon,
                SUM(p.views) as total_views,
                COUNT(*) as count
            FROM properties p
            WHERE p.latitude BETWEEN :min_lat AND :max_lat
            AND p.longitude BETWEEN :min_lon AND :max_lon
            AND p.status = 'available'
            GROUP BY 
                FLOOR((p.latitude - :min_lat) / 0.01),
                FLOOR((p.longitude - :min_lon) / 0.01)
        )
        SELECT lat, lon, total_views, count FROM grid
        ORDER BY total_views DESC
    """)
    
    result = db.execute(
        query,
        {
            "min_lat": request.min_latitude,
            "max_lat": request.max_latitude,
            "min_lon": request.min_longitude,
            "max_lon": request.max_longitude,
        }
    )
    
    points = []
    values = []
    
    for row in result:
        point = HeatmapPoint(
            latitude=float(row[0]),
            longitude=float(row[1]),
            value=float(row[2]),
            count=int(row[3]),
        )
        points.append(point)
        values.append(point.value)
    
    return HeatmapResponse(
        points=points,
        min_value=min(values) if values else 0,
        max_value=max(values) if values else 0,
        avg_value=sum(values) / len(values) if values else 0,
    )

async def _generate_density_heatmap(request: HeatmapRequest, db: Session) -> HeatmapResponse:
    """Generate density heatmap based on property count"""
    query = text("""
        WITH grid AS (
            SELECT 
                (FLOOR((p.latitude - :min_lat) / 0.01) * 0.01 + :min_lat) as lat,
                (FLOOR((p.longitude - :min_lon) / 0.01) * 0.01 + :min_lon) as lon,
                COUNT(*) as count
            FROM properties p
            WHERE p.latitude BETWEEN :min_lat AND :max_lat
            AND p.longitude BETWEEN :min_lon AND :max_lon
            AND p.status = 'available'
            GROUP BY 
                FLOOR((p.latitude - :min_lat) / 0.01),
                FLOOR((p.longitude - :min_lon) / 0.01)
        )
        SELECT lat, lon, count::float, count FROM grid
        ORDER BY count DESC
    """)
    
    result = db.execute(
        query,
        {
            "min_lat": request.min_latitude,
            "max_lat": request.max_latitude,
            "min_lon": request.min_longitude,
            "max_lon": request.max_longitude,
        }
    )
    
    points = []
    values = []
    
    for row in result:
        point = HeatmapPoint(
            latitude=float(row[0]),
            longitude=float(row[1]),
            value=float(row[2]),
            count=int(row[3]),
        )
        points.append(point)
        values.append(point.value)
    
    return HeatmapResponse(
        points=points,
        min_value=min(values) if values else 0,
        max_value=max(values) if values else 0,
        avg_value=sum(values) / len(values) if values else 0,
    )
