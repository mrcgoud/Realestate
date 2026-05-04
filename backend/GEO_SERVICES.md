# Python Geospatial Microservice

Core geospatial intelligence engine built with FastAPI, GeoPandas, and OpenRouteService.

## Architecture

```
Python Geo Service (Port 8001)
├── FastAPI Server
├── PostGIS Connection (read-only)
├── OpenRouteService Client
├── ML Models (price prediction, locality scoring)
├── Caching (Redis)
└── Async Tasks (Celery)
```

## Project Structure

```
geo-services/
├── main.py                      # FastAPI app
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
│
├── app/
│   ├── __init__.py
│   ├── config.py               # Configuration
│   ├── database.py             # PostGIS connection
│   ├── cache.py                # Redis caching
│   │
│   ├── routers/               # API endpoints
│   │   ├── __init__.py
│   │   ├── isochrone.py       # Commute time analysis
│   │   ├── heatmap.py         # Price/demand heatmaps
│   │   ├── flood.py           # Flood risk queries
│   │   ├── infrastructure.py  # Nearby amenities
│   │   ├── satellite.py       # Satellite imagery
│   │   └── analytics.py       # Spatial analytics
│   │
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── geospatial.py      # GeoPandas operations
│   │   ├── openroute.py       # OpenRouteService client
│   │   ├── heatmap_gen.py     # Heatmap generation
│   │   ├── ml_models.py       # ML predictions
│   │   └── satellite_data.py  # Satellite processing
│   │
│   ├── models/                # Data models
│   │   ├── __init__.py
│   │   ├── geo.py             # Pydantic geo models
│   │   ├── response.py        # Response models
│   │   └── ml.py              # ML model schemas
│   │
│   ├── ml/                    # Machine learning
│   │   ├── __init__.py
│   │   ├── price_predictor.py
│   │   ├── fraud_detector.py
│   │   ├── locality_scorer.py
│   │   └── models/            # Trained models (joblib)
│   │       ├── price_xgb.pkl
│   │       ├── fraud_clf.pkl
│   │       └── locality_model.pkl
│   │
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── logger.py          # Logging
│       ├── validators.py      # Input validation
│       └── constants.py       # Constants
│
├── tests/
│   ├── test_isochrone.py
│   ├── test_heatmap.py
│   └── test_ml_models.py
│
└── notebooks/                # Jupyter notebooks
    ├── data_exploration.ipynb
    ├── model_training.ipynb
    └── feature_engineering.ipynb
```

## Dependencies

```txt
# Web framework
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0

# Geospatial
geopandas==0.14.0
shapely==2.0.2
fiona==1.9.6
pyproj==3.6.1
rtree==1.0.1

# Database
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
geoalchemy2==0.14.1

# ML & Data
scikit-learn==1.3.2
xgboost==2.0.3
numpy==1.24.3
pandas==2.1.3
joblib==1.3.2

# APIs & HTTP
requests==2.31.0
aiohttp==3.9.1
httpx==0.25.2

# Caching & Tasks
redis==5.0.1
celery==5.3.4

# Utilities
python-dotenv==1.0.0
python-multipart==0.0.6
pytz==2023.3

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.0
ruff==0.1.8
```

## Sample Endpoints

### Isochrone (Commute Time Analysis)

```python
# app/routers/isochrone.py
from fastapi import APIRouter, Query, HTTPException
from app.services.openroute import openroute_client
from app.models.geo import IsochroneRequest

router = APIRouter(prefix="/isochrone", tags=["isochrone"])

@router.post("/")
async def calculate_isochrone(request: IsochroneRequest):
    """
    Calculate commute-time polygon from a point.
    
    Args:
        center: [lon, lat]
        minutes: 15, 30, 45, 60
        transit_type: car, public_transport, walk, bike
    """
    try:
        isochrone = await openroute_client.get_isochrone(
            location=request.center,
            range=request.minutes * 60,  # Convert to seconds
            range_type="time",
            location_type=request.transit_type.upper(),
        )
        return isochrone
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/properties")
async def properties_within_isochrone(
    lat: float = Query(...),
    lon: float = Query(...),
    minutes: int = Query(30),
    transit_type: str = Query("public_transport"),
):
    """Find properties within commute time"""
    from app.database import get_session
    
    # Get isochrone polygon
    isochrone = await openroute_client.get_isochrone(...)
    
    session = get_session()
    query = f"""
        SELECT id, title, price, geom
        FROM properties
        WHERE ST_Contains(
            ST_GeomFromGeoJSON('{isochrone}'),
            geom
        )
        ORDER BY price ASC
    """
    results = session.execute(query)
    return results.fetchall()
```

### Heatmap Generation

```python
# app/routers/heatmap.py
from fastapi import APIRouter, Query
import geopandas as gpd
from app.services.heatmap_gen import HeatmapGenerator

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

@router.get("/price")
async def price_heatmap(
    min_lat: float = Query(...),
    max_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lon: float = Query(...),
    zoom: int = Query(14),
):
    """Generate price heatmap for area"""
    bounds = {
        'minx': min_lon,
        'miny': min_lat,
        'maxx': max_lon,
        'maxy': max_lat,
    }
    
    generator = HeatmapGenerator()
    heatmap = await generator.generate_price_heatmap(bounds, zoom_level=zoom)
    return heatmap

@router.get("/demand")
async def demand_heatmap(
    min_lat: float = Query(...),
    max_lat: float = Query(...),
    min_lon: float = Query(...),
    max_lon: float = Query(...),
):
    """Generate demand density heatmap"""
    bounds = {...}
    generator = HeatmapGenerator()
    heatmap = await generator.generate_demand_heatmap(bounds)
    return heatmap
```

### ML Models

```python
# app/ml/price_predictor.py
import joblib
import numpy as np
from typing import Dict

class PricePredictor:
    def __init__(self):
        self.model = joblib.load('models/price_xgb.pkl')
        self.scaler = joblib.load('models/scaler.pkl')

    def predict(self, property_data: Dict) -> float:
        """
        Predict property price
        
        Features:
        - bhk, bathrooms, area
        - location (lat/lon → locality features)
        - amenities
        - age
        """
        features = self._extract_features(property_data)
        features_scaled = self.scaler.transform([features])
        price = self.model.predict(features_scaled)[0]
        return float(price)

    def _extract_features(self, data: Dict) -> np.ndarray:
        # Transform raw data to model features
        return np.array([
            data['bhk'],
            data['bathrooms'],
            data['total_area'],
            data['latitude'],
            data['longitude'],
            data['connectivity_score'],
            data['safety_score'],
            # ... more features
        ])

# app/routers/ai.py
@router.post("/price-estimate")
async def estimate_price(property_data: PropertyInput):
    predictor = PricePredictor()
    price = predictor.predict(property_data.dict())
    confidence = calculate_confidence(...)
    
    return {
        "estimated_price": price,
        "confidence": confidence,
        "model": "xgboost_v1",
        "factors": [...]
    }
```

### Locality Scoring

```python
# app/ml/locality_scorer.py
class LocalityScorer:
    def __init__(self):
        self.model = joblib.load('models/locality_model.pkl')

    def score(self, latitude: float, longitude: float) -> Dict:
        """
        Score locality on multiple dimensions:
        - Safety (crime data, police stations)
        - Connectivity (public transport, roads)
        - Livability (schools, hospitals, parks)
        - Investment potential (ROI, growth trends)
        """
        features = self._compute_features(latitude, longitude)
        scores = self.model.predict(features)
        
        return {
            "overall": float(scores[0]),
            "safety": float(scores[1]),
            "connectivity": float(scores[2]),
            "livability": float(scores[3]),
            "roi_potential": float(scores[4]),
        }
```

## Running Locally

```bash
cd geo-services

# Install dependencies
pip install -r requirements.txt

# Run server
python main.py

# Run with Uvicorn (production)
uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Run tests
pytest

# Format code
black .
```

## Docker

```bash
docker build -t realestate-geo-service .
docker run -p 8001:8001 --env-file .env realestate-geo-service
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/realestate_db

# APIs
OPENROUTE_API_KEY=your_key
ISRO_BHUVAN_KEY=your_key

# Caching
REDIS_URL=redis://localhost:6379/0

# Service
SERVICE_HOST=0.0.0.0
SERVICE_PORT=8001
LOG_LEVEL=info

# ML
MODEL_PATH=./app/ml/models
CONFIDENCE_THRESHOLD=0.7
```

## Performance Optimization

- Cache isochrones for hot locations (Redis)
- Pre-generate heatmap tiles (background jobs)
- Use spatial indexes in PostGIS
- Async processing with FastAPI
- Batch processing for bulk operations

## Integration with NestJS Backend

```typescript
// In NestJS service
const response = await axios.post('http://localhost:8001/isochrone', {
  center: [73.8567, 18.5204],
  minutes: 30,
  transit_type: 'public_transport',
});
```
