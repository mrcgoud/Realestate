# Database Schema - PostgreSQL + PostGIS

This document defines the complete database schema for the RealEstate platform, with geospatial extensions.

## Installation & Extensions

```sql
-- Create database with UTF-8 encoding
CREATE DATABASE realestate_db
    ENCODING 'UTF8'
    LOCALE 'en_US.utf8'
    LC_COLLATE 'en_US.utf8'
    LC_CTYPE 'en_US.utf8';

-- Connect to database
\c realestate_db;

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable PostGIS Topology
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSON support
CREATE EXTENSION IF NOT EXISTS jsonb;

-- Enable TimescaleDB for time-series data (analytics)
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable Fuzzy String Matching (for search)
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;

-- Enable Trigram for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

## Core Tables

### 1. Users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    role VARCHAR(50) DEFAULT 'buyer',  -- buyer, seller, builder, admin
    kyc_status VARCHAR(50) DEFAULT 'pending',  -- pending, verified, rejected
    kyc_document_url TEXT,
    bio TEXT,
    verified_at TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Properties

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,  -- residential, commercial, land, etc.
    transaction_type VARCHAR(50) NOT NULL,  -- buy, rent, both
    status VARCHAR(50) DEFAULT 'active',  -- active, sold, expired, inactive
    
    -- Location
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'IN',
    geom GEOMETRY(Point, 4326) NOT NULL,  -- PostGIS point (lat/lon)
    geom_3d GEOMETRY(PointZ, 4326),  -- 3D coordinates
    polygon GEOMETRY(Polygon, 4326),  -- Property boundary
    
    -- Property Details
    bhk_count SMALLINT,
    bathroom_count SMALLINT,
    total_area FLOAT,  -- in sq ft
    carpet_area FLOAT,
    floor_number SMALLINT,
    total_floors SMALLINT,
    age_years SMALLINT,
    facing VARCHAR(50),  -- north, south, east, west
    
    -- Pricing
    price DECIMAL(15, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'INR',
    maintenance_cost DECIMAL(10, 2),
    maintenance_period VARCHAR(20),  -- monthly, yearly
    
    -- Amenities (JSON array)
    amenities JSONB DEFAULT '[]'::jsonb,  -- ["gym", "pool", "parking", "garden"]
    
    -- Features
    furnished_status VARCHAR(50),  -- furnished, semi-furnished, unfurnished
    parking_count SMALLINT,
    has_balcony BOOLEAN,
    has_terrace BOOLEAN,
    
    -- Media
    featured_image_url VARCHAR(500),
    images_count INTEGER DEFAULT 0,
    video_url VARCHAR(500),
    tour_360_url VARCHAR(500),
    bim_model_url VARCHAR(500),
    
    -- AI & Predictions
    ai_description TEXT,  -- Generated description
    estimated_price DECIMAL(15, 2),  -- ML prediction
    price_confidence FLOAT,  -- 0-1
    locality_score FLOAT,  -- 0-100 (safety, connectivity, livability)
    
    -- Meta
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    saved_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    fraud_score FLOAT DEFAULT 0,  -- 0-100 (higher = more suspicious)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Spatial indexes for fast geo queries
CREATE INDEX idx_properties_geom ON properties USING GIST(geom);
CREATE INDEX idx_properties_geom_3d ON properties USING GIST(geom_3d);
CREATE INDEX idx_properties_polygon ON properties USING GIST(polygon);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_transaction_type ON properties(transaction_type);

-- Full-text search index
CREATE INDEX idx_properties_title_fts ON properties USING GIN(to_tsvector('english', title));
CREATE INDEX idx_properties_description_fts ON properties USING GIN(to_tsvector('english', description));

-- BRIN index for time-series (created_at)
CREATE INDEX idx_properties_created_at_brin ON properties USING BRIN(created_at);
```

### 3. Property Amenities (Normalized)

```sql
CREATE TABLE amenity_types (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),  -- lifestyle, safety, convenience, etc.
    icon_url VARCHAR(500)
);

CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id SMALLINT NOT NULL REFERENCES amenity_types(id),
    PRIMARY KEY(property_id, amenity_id)
);

-- Seed common amenities
INSERT INTO amenity_types (id, name, category) VALUES
(1, 'Gym', 'lifestyle'),
(2, 'Swimming Pool', 'lifestyle'),
(3, 'Parking', 'convenience'),
(4, 'Garden', 'lifestyle'),
(5, 'Guard', 'safety'),
(6, 'CCTV', 'safety'),
(7, 'Lift', 'convenience'),
(8, 'Power Backup', 'convenience'),
(9, 'Playground', 'lifestyle'),
(10, 'Community Hall', 'lifestyle');
```

### 4. Geospatial Layers - Flood Risk

```sql
CREATE TABLE flood_risk_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,  -- low, medium, high, critical
    data_source VARCHAR(100),  -- ISRO, NCMRWF, etc.
    source_year INTEGER,
    metadata JSONB,  -- Additional info
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_flood_zones_geom ON flood_risk_zones USING GIST(geom);
CREATE INDEX idx_flood_zones_risk_level ON flood_risk_zones(risk_level);
```

### 5. Geospatial Layers - Infrastructure

```sql
CREATE TABLE infrastructure_types (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(100),  -- school, hospi tal, metro, market, park
    icon_url VARCHAR(500),
    color_code VARCHAR(7)
);

CREATE TABLE infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_id SMALLINT REFERENCES infrastructure_types(id),
    name VARCHAR(255) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    radius_meters INTEGER,  -- Service radius if applicable
    info JSONB,  -- Rating, classes, beds, etc.
    source VARCHAR(100),  -- OSM, custom, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_infrastructure_geom ON infrastructure USING GIST(geom);
CREATE INDEX idx_infrastructure_type_id ON infrastructure(type_id);

-- Seed infrastructure types
INSERT INTO infrastructure_types (id, name, color_code) VALUES
(1, 'School', '#4CAF50'),
(2, 'Hospital', '#FF6B6B'),
(3, 'Metro Station', '#2196F3'),
(4, 'Market', '#FF9800'),
(5, 'Park', '#009688'),
(6, 'Police Station', '#9C27B0'),
(7, 'Fire Station', '#F44336');
```

### 6. Geospatial Layers - Administrative Boundaries

```sql
CREATE TABLE administrative_boundaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(50),  -- state, city, municipality, ward
    name VARCHAR(255),
    code VARCHAR(50),
    parent_id UUID REFERENCES administrative_boundaries(id),
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    population INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_boundaries_geom ON administrative_boundaries USING GIST(geom);
CREATE INDEX idx_admin_boundaries_level ON administrative_boundaries(level);
```

### 7. Isochrone Cache (Commute Time Analysis)

```sql
CREATE TABLE isochrone_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_point GEOMETRY(Point, 4326) NOT NULL,
    minutes INTEGER NOT NULL,  -- 15, 30, 45, 60
    transit_type VARCHAR(50) NOT NULL,  -- car, public_transport, walk, bike
    geom GEOMETRY(MultiPolygon, 4326) NOT NULL,
    cached_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(center_point, minutes, transit_type)
);

CREATE INDEX idx_isochrone_center ON isochrone_cache USING GIST(center_point);
CREATE INDEX idx_isochrone_geom ON isochrone_cache USING GIST(geom);
```

### 8. Price Heatmap Tiles

```sql
CREATE TABLE heatmap_tiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    z SMALLINT NOT NULL,  -- zoom level (0-22)
    x INTEGER NOT NULL,   -- tile x coordinate
    y INTEGER NOT NULL,   -- tile y coordinate
    metric VARCHAR(50) NOT NULL,  -- avg_price, demand_density, sales_count
    value FLOAT NOT NULL,
    min_price DECIMAL(15, 2),
    max_price DECIMAL(15, 2),
    count_properties INTEGER,
    geom GEOMETRY(Polygon, 4326),  -- tile boundary
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(z, x, y, metric)
);

CREATE INDEX idx_heatmap_metric ON heatmap_tiles(metric);
CREATE INDEX idx_heatmap_geom ON heatmap_tiles USING GIST(geom);

-- Partition by zoom level for performance
CREATE TABLE heatmap_tiles_z0_5 PARTITION OF heatmap_tiles
    FOR VALUES FROM (0) TO (6);
CREATE TABLE heatmap_tiles_z6_12 PARTITION OF heatmap_tiles
    FOR VALUES FROM (6) TO (13);
CREATE TABLE heatmap_tiles_z13_18 PARTITION OF heatmap_tiles
    FOR VALUES FROM (13) TO (19);
```

### 9. Property Comparison & Favorites

```sql
CREATE TABLE saved_properties (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    PRIMARY KEY(user_id, property_id)
);

CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX idx_saved_properties_created_at ON saved_properties(saved_at DESC);

CREATE TABLE property_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    properties UUID[] NOT NULL,  -- Array of property IDs
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. Transactions & Inquiries

```sql
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, accepted, rejected, closed
    message TEXT,
    phone_masked VARCHAR(20),  -- Masked for privacy
    email_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_buyer_id ON inquiries(buyer_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

CREATE TABLE visits_scheduled (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, completed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visits_property_id ON visits_scheduled(property_id);
CREATE INDEX idx_visits_scheduled_at ON visits_scheduled(scheduled_at);
```

### 11. In-App Messaging

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(participant_1_id, participant_2_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1_id, participant_2_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

### 12. Analytics & Events

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,  -- property_viewed, property_saved, inquiry_sent, etc.
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    metadata JSONB,
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TimescaleDB hypertable for better analytics performance
SELECT create_hypertable('analytics_events', 'created_at', if_not_exists => TRUE);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_property_id ON analytics_events(property_id);
```

### 13. Audit Logs

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(50),  -- CREATE, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
```

### 14. AI/ML Models Training Data

```sql
CREATE TABLE property_historical_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    price DECIMAL(15, 2),
    date DATE NOT NULL,
    source VARCHAR(100),  -- sold, listed, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE price_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID UNIQUE NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    predicted_price DECIMAL(15, 2),
    confidence FLOAT,  -- 0-1
    model_version VARCHAR(50),
    predicted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fraud_detection_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID UNIQUE NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    fraud_score FLOAT,  -- 0-100
    risk_factors JSONB,  -- ["duplicate_listing", "suspicious_pricing", ...]
    flagged_at TIMESTAMPTZ,
    reviewed_by_admin_id UUID REFERENCES users(id),
    is_verified BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Useful Spatial Queries

```sql
-- Find properties within 2km of a point
SELECT id, title, price, ST_Distance(geom, ST_Point(73.8567, 18.5204)) as distance
FROM properties
WHERE ST_DWithin(geom, ST_Point(73.8567, 18.5204), 2000)
ORDER BY distance
LIMIT 20;

-- Find properties in flood zone
SELECT p.id, p.title, f.risk_level
FROM properties p
LEFT JOIN flood_risk_zones f ON ST_Intersects(p.geom, f.geom)
WHERE f.risk_level IS NOT NULL
ORDER BY f.risk_level DESC;

-- Count properties within each 500m grid cell (heatmap)
SELECT 
    ST_SquareGrid(500, ST_Extent(geom)) as cell,
    AVG(price) as avg_price,
    COUNT(*) as property_count
FROM properties
WHERE status = 'active'
GROUP BY cell
ORDER BY avg_price DESC
LIMIT 100;

-- Find all infrastructure within 1.5km radius of properties
SELECT 
    p.id,
    p.title,
    i.name as infrastructure_name,
    i.type_id,
    ST_Distance(p.geom, i.geom) as distance
FROM properties p
JOIN infrastructure i ON ST_DWithin(p.geom, i.geom, 1500)
WHERE p.status = 'active'
ORDER BY p.id, distance;

-- Properties within commute time
SELECT p.id, p.title, p.price
FROM properties p
WHERE ST_Contains(
    (SELECT geom FROM isochrone_cache 
     WHERE center_point = ST_Point(73.8567, 18.5204) 
     AND minutes = 30 
     AND transit_type = 'public_transport'),
    p.geom
)
AND p.status = 'active'
ORDER BY p.price ASC;

-- Nearest schools to a property
SELECT 
    i.name,
    i.info->'rating' as rating,
    ST_Distance(ST_Point(73.8567, 18.5204)::geography, i.geom::geography) / 1000 as distance_km
FROM infrastructure i
WHERE i.type_id = 1  -- School
ORDER BY distance_km
LIMIT 5;
```

---

## Migration Strategy

Use TypeORM migrations or Flyway:

```bash
# Create migration
npm run migration:create -- src/database/migrations/InitialSchema

# Run migrations
npm run migration:run

# Revert
npm run migration:revert
```

---

## Performance Optimization Checklist

- [x] Spatial indexes (GIST) on geometry columns
- [x] B-tree indexes on frequently filtered columns
- [x] BRIN indexes for time-series
- [x] Partitioning for large tables (heatmap_tiles)
- [x] Connection pooling (PgBouncer)
- [x] Query optimization (analyze slow queries)
- [x] Vacuum and analyze jobs (scheduled maintenance)
- [x] Read replicas for analytics
- [x] Redis caching for hot queries
