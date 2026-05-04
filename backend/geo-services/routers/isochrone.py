from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.database import get_db, PropertyLocation
from services.cache import get_cache, set_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class IsochroneRequest(BaseModel):
    latitude: float
    longitude: float
    max_time_minutes: int = 30  # Commute time in minutes
    mode: str = "driving"  # driving, transit, walking, cycling

class IsochroneResponse(BaseModel):
    properties: List[dict]
    count: int
    avg_commute_time: float
    bounding_box: dict

@router.post("/calculate", response_model=IsochroneResponse)
async def calculate_isochrone(
    request: IsochroneRequest,
    db: Session = Depends(get_db),
):
    """
    Calculate properties within commute time from destination.
    Uses OpenRouteService for routing and PostGIS for spatial queries.
    """
    cache_key = f"isochrone:{request.latitude}:{request.longitude}:{request.max_time_minutes}:{request.mode}"
    
    # Check cache first
    cached = await get_cache(cache_key)
    if cached:
        return IsochroneResponse(**cached)
    
    try:
        # Query properties within reasonable distance (isochrone approximation)
        # In production, integrate with OpenRouteService for accurate isochrones
        query = text("""
            SELECT 
                p.id,
                p.title,
                p.price,
                p.latitude,
                p.longitude,
                p.bedrooms,
                p.bathrooms,
                p.areaSquareFeet,
                p.type,
                ST_Distance(
                    p.location, 
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                ) / 1000 as distance_km,
                ST_Distance(
                    p.location, 
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                ) / 1000 / 50 * 60 as estimated_commute_minutes
            FROM properties p
            WHERE p.status = 'available'
            AND ST_DistanceSphere(
                p.location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= :max_distance
            ORDER BY ST_Distance(
                p.location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            )
            LIMIT 100
        """)
        
        # Max distance approximation: 30 min * 50 km/h average = 25 km
        max_distance = (request.max_time_minutes / 60) * 50 * 1000
        
        result = db.execute(
            query,
            {
                "lat": request.latitude,
                "lon": request.longitude,
                "max_distance": max_distance,
            }
        )
        
        properties = []
        total_commute = 0
        min_lat, max_lat = float('inf'), float('-inf')
        min_lon, max_lon = float('inf'), float('-inf')
        
        for row in result:
            prop = {
                "id": row[0],
                "title": row[1],
                "price": float(row[2]),
                "latitude": float(row[3]),
                "longitude": float(row[4]),
                "bedrooms": row[5],
                "bathrooms": row[6],
                "areaSquareFeet": float(row[7]),
                "type": row[8],
                "distanceKm": float(row[9]),
                "estimatedCommuteMinutes": float(row[10]),
            }
            
            # Filter by estimated commute time
            if prop["estimatedCommuteMinutes"] <= request.max_time_minutes:
                properties.append(prop)
                total_commute += prop["estimatedCommuteMinutes"]
                
                # Update bounding box
                min_lat = min(min_lat, prop["latitude"])
                max_lat = max(max_lat, prop["latitude"])
                min_lon = min(min_lon, prop["longitude"])
                max_lon = max(max_lon, prop["longitude"])
        
        avg_commute = total_commute / len(properties) if properties else 0
        
        response_data = {
            "properties": properties,
            "count": len(properties),
            "avg_commute_time": avg_commute,
            "bounding_box": {
                "minLat": min_lat,
                "maxLat": max_lat,
                "minLon": min_lon,
                "maxLon": max_lon,
            },
        }
        
        # Cache result
        await set_cache(cache_key, response_data, ttl=3600)
        
        return IsochroneResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Isochrone calculation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nearby-transit")
async def get_nearby_transit(
    latitude: float,
    longitude: float,
    radius_km: float = 2.0,
    db: Session = Depends(get_db),
):
    """Get nearby infrastructure (metro, bus, train stations)"""
    cache_key = f"transit:{latitude}:{longitude}:{radius_km}"
    
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    try:
        query = text("""
            SELECT 
                id,
                name,
                type,
                latitude,
                longitude,
                ST_Distance(
                    location,
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                ) / 1000 as distance_km,
                metadata
            FROM infrastructure_points
            WHERE type IN ('metro', 'bus_station', 'train_station')
            AND ST_DistanceSphere(
                location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= :radius * 1000
            ORDER BY ST_Distance(
                location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            )
        """)
        
        result = db.execute(
            query,
            {
                "lat": latitude,
                "lon": longitude,
                "radius": radius_km,
            }
        )
        
        transit_points = []
        for row in result:
            transit_points.append({
                "id": row[0],
                "name": row[1],
                "type": row[2],
                "latitude": float(row[3]),
                "longitude": float(row[4]),
                "distanceKm": float(row[5]),
                "metadata": row[6],
            })
        
        response = {
            "transitPoints": transit_points,
            "count": len(transit_points),
        }
        
        await set_cache(cache_key, response, ttl=7200)
        return response
        
    except Exception as e:
        logger.error(f"Transit lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
