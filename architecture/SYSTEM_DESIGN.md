# System Architecture Design

## Overview

RealEstate Platform is a distributed, microservices-based real estate marketplace with geospatial intelligence as its core differentiator. The architecture is built for scalability, real-time performance, and battle-tested technologies.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                                  │
├─────────────────────┬───────────────────────┬──────────────────┤
│   Web App           │    Mobile App         │   Admin Portal   │
│ (Next.js)           │  (React Native)       │   (Next.js)      │
└─────────────────────┴───────────────────────┴──────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              API GATEWAY & ORCHESTRATION                         │
├──────────────────────────────────────────────────────────────────┤
│ Load Balancer (Nginx) → GraphQL Gateway + REST Router           │
│ Rate Limiting, CORS, Auth Middleware                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Core API    │  Geo Service │  3D Service  │   Notification    │
│  (NestJS)    │  (Python)    │  (Node/3JS)  │   (Queue)         │
│              │              │              │                    │
│ • Property   │ • Isochrone  │ • BIM Parser │ • Email           │
│ • User       │ • Flood Risk │ • Tours      │ • Push            │
│ • Search     │ • Heatmaps   │ • Rendering  │ • SMS             │
│ • Auth       │ • Analytics  │              │                    │
└──────────────┴──────────────┴──────────────┴────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
├──────────────────┬──────────────────┬──────────────────────────┤
│  PostgreSQL      │   TimescaleDB    │   Elasticsearch         │
│  + PostGIS       │   (Metrics)      │   (Search Index)        │
│                  │                  │                         │
│ • Properties     │ • Analytics      │ • Full-text search     │
│ • Users          │ • Price trends   │ • Listings index       │
│ • Geo layers     │ • Performance    │                         │
│ • Transactions   │                  │                         │
└──────────────────┴──────────────────┴──────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL INTEGRATIONS                           │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│ Martin Tile  │ OSM/CARTO    │ OpenRoute    │  Satellite Data    │
│ Server       │ Basemap      │  Service     │  (ISRO/Sentinel)   │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

## Layer 1: Geospatial Intelligence Engine (CORE)

### Components

#### 1.1 Spatial Database (PostgreSQL + PostGIS)

**Purpose**: Store and query geospatial data with sub-100ms response times

**Key Features**:
- Geometry/Geography types for properties, flood zones, infrastructure
- Spatial indexes (GIST, BRIN) for fast lookups
- PostGIS functions for distance calculations, polygons, heatmaps
- Time-series extension (TimescaleDB) for price/demand trends

**Key Tables**:
```sql
-- Core property geometry
CREATE TABLE property_geometries (
    property_id UUID PRIMARY KEY,
    geom GEOMETRY(Point, 4326),  -- WGS84 lat/lon
    geom_3d GEOMETRY(PointZ, 4326),  -- For 3D visualization
    polygon GEOMETRY(Polygon, 4326),  -- Property boundary
    created_at TIMESTAMPTZ
);

-- Flood risk zones
CREATE TABLE flood_risk_zones (
    id UUID PRIMARY KEY,
    geom GEOMETRY(MultiPolygon, 4326),
    risk_level TEXT,  -- low, medium, high, critical
    data_source TEXT,
    updated_at TIMESTAMPTZ
);

-- Commute analysis
CREATE TABLE isochrone_cache (
    id UUID PRIMARY KEY,
    center_point GEOMETRY(Point, 4326),
    minutes INTEGER,  -- 15, 30, 45, 60
    geom GEOMETRY(MultiPolygon, 4326),
    transit_type TEXT,  -- car, public, walk, bike
    cached_at TIMESTAMPTZ
);

-- Infrastructure
CREATE TABLE infrastructure (
    id UUID PRIMARY KEY,
    type TEXT,  -- school, hospital, metro, market, park
    name TEXT,
    geom GEOMETRY(Point, 4326),
    info JSONB,
    updated_at TIMESTAMPTZ
);

-- Heatmaps (price trends)
CREATE TABLE heatmap_tiles (
    id UUID PRIMARY KEY,
    z INTEGER,  -- zoom level
    x INTEGER,
    y INTEGER,
    metric TEXT,  -- avg_price, demand_density, sales_count
    value FLOAT,
    created_at TIMESTAMPTZ
);
```

#### 1.2 Tile Server (Martin - Rust)

**Purpose**: Serve vector tiles for map rendering at scale

**Features**:
- Auto-tier generation from PostGIS
- On-demand tile serving (no pre-generation)
- Sub-50ms tile response times
- Handles 1000+ concurrent requests

**Tile Sources**:
- Property listings (points)
- Flood zones (polygons)
- Infrastructure (points)
- Price heatmaps (rasters)

#### 1.3 Map Rendering Frontend (MapLibre GL JS)

**Purpose**: Client-side map visualization with layers

**Features**:
- Layer toggle system (flood, schools, hospitals, metro, parks)
- Property markers with clustering
- Polygon drawing tools (custom search areas)
- Real-time property updates

#### 1.4 Isochrone Engine (OpenRouteService)

**Purpose**: Calculate commute-time polygons for "search within X minutes"

**Features**:
- 15/30/45/60 minute isochrones
- Multiple transit types (car, public transport, walking, cycling)
- Cached results for hot areas
- Real-time calculation for custom points

#### 1.5 Satellite & Environmental Data

**Data Sources**:
1. **ISRO Bhuvan API**: Indian satellite imagery
2. **Sentinel-2 (ESA)**: Global satellite imagery, NDVI for vegetation
3. **OSM Data**: Roads, amenities, administrative boundaries
4. **Risk Datasets**: Flood maps, seismic zones, air quality

**Processing Pipeline**:
```
Raw Satellite Data → Tiling Service → Vector Tiles → Map Render
   (Sentinel-2)      (Martin)          (PostGIS)      (MapLibre)
```

### Key Queries

```sql
-- Find properties near a location with flood risk
SELECT p.*, f.risk_level
FROM properties p
LEFT JOIN flood_risk_zones f ON ST_Intersects(p.geom, f.geom)
WHERE ST_DWithin(p.geom, ST_Point(73.8567, 18.5204), 2000)
ORDER BY p.price ASC;

-- Properties within 30-minute commute of a point
SELECT p.*
FROM properties p
WHERE ST_Contains(
    (SELECT geom FROM isochrone_cache 
     WHERE center_point = ST_Point(73.8567, 18.5204) 
     AND minutes = 30),
    p.geom
)
ORDER BY p.price;

-- Heatmap: Average price by 500m grid
SELECT 
    ST_SquareGrid(500, ST_Extent(geom)) as cell,
    AVG(price) as avg_price,
    COUNT(*) as count
FROM properties
GROUP BY cell
ORDER BY avg_price DESC;
```

---

## Layer 2: Digital Twin & XR Experience

### 2.1 3D Visualization (Three.js + React Three Fiber)

**Purpose**: Interactive 3D property walkthroughs

**Components**:
- Floor plan 3D model rendering
- Interactive object highlighting
- Annotation system
- Measurement tools

### 2.2 BIM Integration (IFC.js)

**Purpose**: Display architectural floor plans and BIM models

**Features**:
- IFC file parser and renderer
- Layer-based visualization
- Property information extraction
- Cross-browser compatibility

### 2.3 Virtual Tours (Pannellum.js / Marzipano)

**Purpose**: 360° panoramic property tours

**Features**:
- Hotspot navigation
- Equirectangular image support
- Mobile responsive
- VR mode support

---

## Layer 3: Frontend Architecture

### 3.1 Web Application (Next.js)

**Stack**:
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS + ShadCN UI
- State: Zustand (recommended) + React Query
- Map: MapLibre GL JS
- 3D: Three.js / React Three Fiber

**Key Directories**:
```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (home)
│   ├── search/page.tsx
│   ├── property/[id]/page.tsx
│   ├── dashboard/
│   ├── admin/
│   └── auth/
├── components/
│   ├── Map/
│   ├── PropertyCard/
│   ├── NavBar/
│   ├── 3D/
│   └── common/
├── hooks/
├── lib/
│   ├── api.ts
│   ├── geospatial.ts
│   ├── maplibre.ts
│   └── utils.ts
├── store/
│   └── (Zustand stores)
├── types/
├── styles/
└── public/
```

**Key Pages**:
- **Home**: Map-first search interface
- **Search Results**: Listings grid/map hybrid view
- **Property Detail**: Full property info + 3D/tours
- **Compare**: Side-by-side property comparison
- **Dashboard**: User's saved properties, alerts, bookings
- **Admin**: Analytics, moderation, heatmaps

### 3.2 Mobile App (React Native + Expo)

**Stack**:
- Framework: React Native (Expo)
- Maps: MapLibre React Native
- State: Zustand + React Query
- 3D: Babylon Native (for 3D support)

**Key Screens**:
- Map View (primary interface)
- Property Details
- Compare Properties
- User Profile
- Saved Listings
- Search Filters

---

## Layer 4: Backend Architecture

### 4.1 Core API (NestJS)

**Stack**:
- Framework: NestJS
- API Style: GraphQL (primary) + REST (secondary)
- Auth: JWT + OAuth2
- Database: TypeORM with PostGIS

**Modules**:

```
backend/src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── oauth.strategy.ts
│   └── otp.service.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── dto/
│   └── entities/
├── properties/
│   ├── properties.controller.ts
│   ├── properties.service.ts
│   ├── properties.repository.ts
│   ├── dto/
│   └── entities/
├── search/
│   ├── search.service.ts
│   ├── search.controller.ts
│   └── search.repository.ts
├── geospatial/
│   ├── geospatial.service.ts (client for Python service)
│   └── geospatial.types.ts
├── notifications/
│   ├── notifications.service.ts
│   ├── email.service.ts
│   └── push.service.ts
├── analytics/
│   ├── analytics.service.ts
│   └── analytics.controller.ts
├── upload/
│   ├── upload.controller.ts
│   └── s3.service.ts
├── ai/
│   ├── ai.service.ts
│   ├── price-prediction.ts
│   └── fraud-detection.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   └── guards/
└── app.module.ts
```

**GraphQL Schema** (partial):

```graphql
type Query {
  # Properties
  property(id: ID!): Property
  properties(
    filter: PropertyFilter
    pagination: PaginationInput
    sort: SortInput
  ): PropertyConnection!
  searchByMap(
    bounds: BoundsInput!
    filters: PropertyFilter
  ): [Property!]!
  
  # Geospatial
  isochrone(
    center: PointInput!
    minutes: Int!
    transitType: TransitType!
  ): Polygon!
  
  floodRiskAt(point: PointInput!): FloodRisk
  infrastructureNear(
    point: PointInput!
    radius: Int!
    types: [InfrastructureType!]
  ): [Infrastructure!]!
  
  # Heatmaps
  priceHeatmap(bounds: BoundsInput!): Heatmap!
  demandHeatmap(bounds: BoundsInput!): Heatmap!
  
  # AI
  priceEstimate(input: PriceEstimateInput!): PriceEstimate!
  localityScore(point: PointInput!): LocalityScore!
  
  # User
  currentUser: User
  savedProperties: [Property!]!
  
  # Admin
  analytics: AnalyticsDashboard
}

type Mutation {
  # Auth
  signup(input: SignupInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  
  # Properties
  createProperty(input: CreatePropertyInput!): Property!
  updateProperty(id: ID!, input: UpdatePropertyInput!): Property!
  deleteProperty(id: ID!): Boolean!
  uploadImage(input: UploadInput!): Upload!
  
  # User
  saveProperty(propertyId: ID!): Boolean!
  unsaveProperty(propertyId: ID!): Boolean!
  scheduleVisit(input: ScheduleVisitInput!): Visit!
  
  # Analytics
  trackEvent(input: TrackEventInput!): Boolean!
}

type Subscription {
  propertyUpdated(id: ID!): Property!
  priceChanged(id: ID!): PriceUpdate!
  newListings(filters: PropertyFilter): Property!
}
```

### 4.2 Geospatial Microservice (Python)

**Stack**:
- Framework: FastAPI
- Spatial Libraries: GeoPandas, Shapely, Fiona
- Task Queue: Celery
- Caching: Redis

**Endpoints**:

```python
# FastAPI service for spatial operations
@app.post("/isochrone")
async def calculate_isochrone(
    center: Point,
    minutes: int,
    transit_type: str
) -> Polygon:
    """Call OpenRouteService, cache results"""

@app.post("/flood-risk")
async def get_flood_risk(point: Point) -> FloodRisk:
    """Query flood zone polygons, return risk level"""

@app.get("/heatmap")
async def generate_heatmap(
    bounds: Bounds,
    metric: str,
    resolution: int = 500
) -> GeoJSON:
    """Generate heatmap tiles from property data"""

@app.post("/analytics/locality-score")
async def locality_score(point: Point) -> LocalityScoreResponse:
    """ML model: safety, connectivity, livability, ROI"""

@app.post("/ai/price-prediction")
async def predict_price(property_data: PropertyInput) -> PricePrediction:
    """ML model: predict price based on location, amenities, comparables"""
```

**ML Models**:
- Price Prediction: XGBoost/LightGBM on historical sales
- Locality Scoring: Multi-factor scoring model
- Fraud Detection: Anomaly detection for suspicious listings

---

## Layer 5: Data Flow & Events

### 5.1 Real-Time Updates

**Event Bus**: RabbitMQ / Redis Pub-Sub

**Events**:
```json
{
  "type": "property.created|updated|deleted",
  "payload": { "propertyId": "...", "data": {} },
  "timestamp": "2024-03-22T10:00:00Z"
}
```

**Subscribers**:
- Map service (invalidate tiles)
- Search index (update Elasticsearch)
- Analytics (log events)
- Heatmap service (update metrics)

### 5.2 Background Jobs

**Queue System**: Bull/Celery

**Tasks**:
- Send email notifications
- Generate 3D thumbnails
- Update heatmaps
- Fraud detection checks
- Price prediction updates
- Satellite data ingestion

---

## Layer 6: Security & Auth

### 6.1 Authentication Flow

```
User Login (OTP/Social) 
    ↓
JWT Token Generation
    ↓
Token Validation (every request)
    ↓
Role-Based Access Control (RBAC)
    ↓
Resource Access
```

**Flows**:
1. **OTP Auth**: Phone number → OTP → JWT
2. **Social OAuth**: Google/Facebook → OAuth token → JWT
3. **Builder Auth**: Email + KYC verification → JWT with builder role

### 6.2 Data Security

- Passwords: bcrypt (salt rounds: 12)
- Sensitive data: encrypted at rest (AES-256)
- HTTPS/TLS for all communications
- API rate limiting & DDoS protection
- CORS configuration
- SQL injection prevention (parameterized queries)

---

## Layer 7: DevOps & Deployment

### 7.1 Containerization

**Docker Compose** for local development:
```yaml
services:
  postgres:
    image: postgis/postgis:16-3.4
  redis:
    image: redis:7-alpine
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
  backend:
    build: ./backend
    ports:
      - "3000:3000"
  tile-server:
    build: ./tile-server
    ports:
      - "8080:8080"
  frontend:
    build: ./frontend
    ports:
      - "3001:3000"
```

### 7.2 Kubernetes Deployment

**Microservices**:
- NestJS API (replicas: 3)
- Python Geo Service (replicas: 2)
- Tile Server Martin (replicas: 2)
- Nginx Ingress Controller
- PostgreSQL StatefulSet
- Redis (replica set)
- Elasticsearch (cluster)

### 7.3 CI/CD Pipeline (GitHub Actions)

**Stages**:
1. Code checkout & lint
2. Unit tests
3. Integration tests
4. Build Docker images
5. Push to registry
6. Deploy to staging
7. Smoke tests
8. Deploy to production

---

## Scalability Considerations

### 7.1 Database Optimization

- Spatial indexes on geometry columns
- Partitioning by location bbox
- Materialized views for heatmaps
- Read replicas for analytics queries
- Connection pooling (PgBouncer)

### 7.2 Caching Strategy

**Cache Layers**:
1. CDN: Static assets, images
2. Redis: API responses, user sessions
3. Memory: DataLoader for GraphQL N+1 avoidance
4. PostGIS: Spatial index caching

### 7.3 Search Optimization

- Elasticsearch for full-text property search
- Multiple analyzers for Indian languages
- Typo tolerance & fuzzy matching
- Real-time updates via event streaming

### 7.4 Tile Server Load Balancing

- Multi-instance Martin behind load balancer
- Geographic tile caching
- Coordinate-based request routing

---

## Performance Targets

| Operation | Target | Current |
|-----------|--------|---------|
| Property search | <200ms | TBD |
| Map tile load | <50ms | TBD |
| Isochrone generate | <500ms | TBD |
| Price prediction | <100ms | TBD |
| Heatmap render | <300ms | TBD |

---

## External APIs & Integrations

| Service | Purpose | Cost |
|---------|---------|------|
| OpenRouteService (self-hosted) | Isochrones | Free |
| OSM / CARTO | Basemap | Free |
| ISRO Bhuvan | Satellite imagery | Free |
| Sentinel Hub | Satellite data | Free tier |
| AWS S3 | Image CDN | Variable |
| SendGrid | Transactional email | Pay-as-you-go |
| Twilio | SMS & call masking | Pay-as-you-go |

---

## Next Steps

1. [Database Setup](../database/SCHEMA.md)
2. [API Design](./API_DESIGN.md)
3. [Backend Setup](../backend/README.md)
4. [Frontend Setup](../frontend/README.md)
5. [Deployment](../devops/DEPLOYMENT.md)
