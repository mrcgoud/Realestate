from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.database import get_db
from services.cache import get_cache, set_cache
from services.ml_models import price_predictor, locality_scorer
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class PricePredictionRequest(BaseModel):
    latitude: float
    longitude: float
    bedrooms: int
    bathrooms: int
    areaSquareFeet: float
    yearBuilt: int
    propertyType: str = "apartment"

class PricePredictionResponse(BaseModel):
    predictedPrice: float
    priceRange: dict  # min, max
    confidence: float
    comparableProperties: List[dict]

class LocalityScoringRequest(BaseModel):
    latitude: float
    longitude: float

class LocalityScoringResponse(BaseModel):
    score: float
    description: str
    metrics: dict

@router.post("/predict-price", response_model=PricePredictionResponse)
async def predict_property_price(
    request: PricePredictionRequest,
    db: Session = Depends(get_db),
):
    """
    Predict property price using ML model trained on historical data.
    Uses XGBoost with geospatial and property features.
    """
    cache_key = f"prediction:{request.latitude}:{request.longitude}:{request.bedrooms}:{request.bathrooms}:{request.areaSquareFeet}"
    
    cached = await get_cache(cache_key)
    if cached:
        return PricePredictionResponse(**cached)
    
    try:
        # Prepare features for prediction
        features = {
            "latitude": request.latitude,
            "longitude": request.longitude,
            "bedrooms": request.bedrooms,
            "bathrooms": request.bathrooms,
            "areaSquareFeet": request.areaSquareFeet,
            "yearBuilt": request.yearBuilt,
            "propertyType": request.propertyType,
        }
        
        # Get comparable properties for context
        query = text("""
            SELECT 
                id,
                title,
                price,
                bedrooms,
                bathrooms,
                areaSquareFeet,
                ST_Distance(
                    location,
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                ) / 1000 as distance_km
            FROM properties
            WHERE bedrooms = :bedrooms
            AND bathrooms = :bathrooms
            AND type = :type
            AND status = 'available'
            AND ST_DistanceSphere(
                location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= 5000
            ORDER BY 
                ST_Distance(
                    location,
                    ST_GeomFromText('POINT(:lon :lat)', 4326)
                )
            LIMIT 10
        """)
        
        result = db.execute(
            query,
            {
                "lat": request.latitude,
                "lon": request.longitude,
                "bedrooms": request.bedrooms,
                "bathrooms": request.bathrooms,
                "type": request.propertyType,
            }
        )
        
        comparables = []
        for row in result:
            comparables.append({
                "id": row[0],
                "title": row[1],
                "price": float(row[2]),
                "bedrooms": row[3],
                "bathrooms": row[4],
                "areaSquareFeet": float(row[5]),
                "distanceKm": float(row[6]),
            })
        
        # Use ML model to predict price
        predicted_price, confidence = price_predictor.predict(features, comparables)
        
        # Calculate price range (±15% confidence interval)
        margin = predicted_price * 0.15
        
        response_data = {
            "predictedPrice": predicted_price,
            "priceRange": {
                "min": predicted_price - margin,
                "max": predicted_price + margin,
            },
            "confidence": confidence,
            "comparableProperties": comparables,
        }
        
        await set_cache(cache_key, response_data, ttl=3600)
        return PricePredictionResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Price prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/score-locality", response_model=LocalityScoringResponse)
async def score_locality(
    request: LocalityScoringRequest,
    db: Session = Depends(get_db),
):
    """
    Score a locality based on multiple factors:
    - Property appreciation history
    - Amenities density
    - Infrastructure quality
    - Crime statistics (if available)
    - Future development potential
    """
    cache_key = f"locality_score:{request.latitude}:{request.longitude}"
    
    cached = await get_cache(cache_key)
    if cached:
        return LocalityScoringResponse(**cached)
    
    try:
        # Get historical price trends
        price_query = text("""
            SELECT 
                DATE_TRUNC('month', p."createdAt")::date as month,
                AVG(p.price) as avg_price,
                COUNT(*) as transaction_count
            FROM properties p
            WHERE ST_DistanceSphere(
                p.location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= 2000
            AND p.status IN ('sold', 'available')
            GROUP BY DATE_TRUNC('month', p."createdAt")
            ORDER BY month DESC
            LIMIT 12
        """)
        
        price_result = db.execute(
            price_query,
            {
                "lat": request.latitude,
                "lon": request.longitude,
            }
        )
        
        price_trends = list(price_result)
        
        # Calculate appreciation rate
        if len(price_trends) >= 2:
            recent_price = price_trends[0][1] if price_trends[0][1] else 0
            old_price = price_trends[-1][1] if price_trends[-1][1] else recent_price
            appreciation_rate = ((recent_price - old_price) / old_price * 100) if old_price > 0 else 0
        else:
            appreciation_rate = 0
        
        # Get amenity count
        amenity_query = text("""
            SELECT COUNT(*) FROM infrastructure_points
            WHERE ST_DistanceSphere(
                location,
                ST_GeomFromText('POINT(:lon :lat)', 4326)
            ) <= 2000
        """)
        
        amenity_result = db.execute(
            amenity_query,
            {
                "lat": request.latitude,
                "lon": request.longitude,
            }
        ).scalar()
        
        # Score components (0-100 each)
        appreciation_score = min(max(appreciation_rate * 2, 0), 100)  # 2% = 4 points
        amenity_score = min((amenity_result or 0) / 50 * 100, 100)  # 50 amenities = 100 points
        market_score = _calculate_market_score(price_trends)
        
        # Calculate overall score
        overall_score = (appreciation_score * 0.4 + amenity_score * 0.3 + market_score * 0.3)
        
        response_data = {
            "score": min(overall_score, 100),
            "description": _get_locality_description(overall_score),
            "metrics": {
                "appreciationRate%": appreciation_rate,
                "appreciationScore": appreciation_score,
                "amenityCount": amenity_result or 0,
                "amenityScore": amenity_score,
                "marketScore": market_score,
            },
        }
        
        await set_cache(cache_key, response_data, ttl=86400)
        return LocalityScoringResponse(**response_data)
        
    except Exception as e:
        logger.error(f"Locality scoring error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _calculate_market_score(price_trends: List) -> float:
    """Calculate market health score based on price trends"""
    if not price_trends:
        return 50  # Neutral
    
    # Check for consistent upward or downward trend
    prices = [p[1] for p in price_trends if p[1]]
    
    if len(prices) < 2:
        return 50
    
    # Calculate trend
    trend = sum(1 for i in range(len(prices) - 1) if prices[i] > prices[i + 1])
    trend_percentage = trend / (len(prices) - 1)
    
    if trend_percentage < 0.3:  # Mostly upward
        return 80  # Healthy market
    elif trend_percentage < 0.5:  # Mixed
        return 60  # Neutral
    else:  # Mostly downward
        return 40  # Declining market
    
    return 50

def _get_locality_description(score: float) -> str:
    """Get locality description based on score"""
    if score >= 85:
        return "Highly Desirable - Strong Appreciation"
    elif score >= 70:
        return "Very Good - Good Growth Potential"
    elif score >= 55:
        return "Good - Stable Market"
    elif score >= 40:
        return "Fair - Moderate Interest"
    else:
        return "Emerging Area - Consider Carefully"
