from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.database import get_db
from services.cache import get_cache, set_cache
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class InfrastructureItem(BaseModel):
    name: str
    type: str
    distanceKm: float
    latitude: float
    longitude: float
    metadata: dict = {}

class NearbyAmenitiesResponse(BaseModel):
    schools: List[InfrastructureItem]
    hospitals: List[InfrastructureItem]
    parks: List[InfrastructureItem]
    transit: List[InfrastructureItem]
    restaurants: List[InfrastructureItem]

@router.get("/nearby")
async def get_nearby_amenities(
    latitude: float,
    longitude: float,
    radius_km: float = 2.0,
    db: Session = Depends(get_db),
):
    """Get nearby amenities and infrastructure"""
    cache_key = f"amenities:{latitude}:{longitude}:{radius_km}"
    
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    try:
        amenities = {}
        types = ["school", "hospital", "park", "metro", "restaurant"]
        
        for amenity_type in types:
            query = text("""
                SELECT 
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
                WHERE type = :type
                AND ST_DistanceSphere(
                    location,
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                ) <= :radius * 1000
                ORDER BY ST_Distance(
                    location,
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                )
                LIMIT 10
            """)
            
            result = db.execute(
                query,
                {
                    "lat": latitude,
                    "lon": longitude,
                    "radius": radius_km,
                    "type": amenity_type,
                }
            )
            
            items = []
            for row in result:
                items.append(InfrastructureItem(
                    name=row[0],
                    type=row[1],
                    latitude=float(row[2]),
                    longitude=float(row[3]),
                    distanceKm=float(row[4]),
                    metadata=row[5] or {},
                ))
            
            amenities[amenity_type + "s"] = items
        
        response = NearbyAmenitiesResponse(
            schools=amenities.get("schools", []),
            hospitals=amenities.get("hospitals", []),
            parks=amenities.get("parks", []),
            transit=amenities.get("metros", []),
            restaurants=amenities.get("restaurants", []),
        )
        
        await set_cache(cache_key, response.dict(), ttl=7200)
        return response
        
    except Exception as e:
        logger.error(f"Amenities lookup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/walkability-score")
async def calculate_walkability_score(
    latitude: float,
    longitude: float,
    radius_km: float = 1.0,
    db: Session = Depends(get_db),
):
    """
    Calculate walkability score based on nearby amenities.
    Score 0-100 based on density and types of amenities.
    """
    cache_key = f"walkability:{latitude}:{longitude}:{radius_km}"
    
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    try:
        query = text("""
            SELECT 
                type,
                COUNT(*) as count
            FROM infrastructure_points
            WHERE ST_DistanceSphere(
                location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= :radius * 1000
            GROUP BY type
        """)
        
        result = db.execute(
            query,
            {
                "lat": latitude,
                "lon": longitude,
                "radius": radius_km,
            }
        )
        
        amenity_counts = {}
        for row in result:
            amenity_counts[row[0]] = row[1]
        
        # Calculate walkability score based on amenities
        score = 0
        weights = {
            "school": 20,
            "hospital": 15,
            "park": 15,
            "restaurant": 15,
            "metro": 20,
            "library": 10,
        }
        
        for amenity_type, weight in weights.items():
            count = amenity_counts.get(amenity_type, 0)
            # Each amenity contributes to score
            score += min(count * 2, weight)
        
        score = min(score, 100)  # Cap at 100
        
        response = {
            "score": score,
            "latitude": latitude,
            "longitude": longitude,
            "radiusKm": radius_km,
            "amenityCount": sum(amenity_counts.values()),
            "amenityBreakdown": amenity_counts,
            "description": _get_walkability_description(score),
        }
        
        await set_cache(cache_key, response, ttl=86400)
        return response
        
    except Exception as e:
        logger.error(f"Walkability score error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _get_walkability_description(score: float) -> str:
    """Get walkability description based on score"""
    if score >= 90:
        return "Walker's Paradise"
    elif score >= 70:
        return "Very Walkable"
    elif score >= 50:
        return "Somewhat Walkable"
    elif score >= 25:
        return "Car-Dependent"
    else:
        return "Driving Only"
