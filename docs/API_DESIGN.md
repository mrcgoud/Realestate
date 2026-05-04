# API Design - GraphQL + REST

This document outlines the API architecture combining GraphQL (primary) and REST (secondary) endpoints.

## API Layer Architecture

```
┌─────────────────────────────┐
│     API Gateway (Nginx)     │
├──────────────┬──────────────┤
│   GraphQL    │   REST API   │
│   Endpoint   │   Endpoints  │
├──────────────┴──────────────┤
│   NestJS Core API           │
│   (Auth, Business Logic)    │
└─────────────────────────────┘
```

---

## 1. GraphQL API

### Endpoint: `/graphql`

### Primary Types

```graphql
# ============ USER TYPES ============

enum UserRole {
  BUYER
  SELLER
  BUILDER
  ADMIN
}

enum KYCStatus {
  PENDING
  VERIFIED
  REJECTED
}

type User {
  id: ID!
  email: String!
  phone: String
  firstName: String
  lastName: String
  fullName: String
  role: UserRole!
  kycStatus: KYCStatus!
  avatar: String
  bio: String
  createdAt: DateTime!
  updatedAt: DateTime!
  
  # Relations
  properties: [Property!]
  savedProperties: [Property!]
  conversations: [Conversation!]
  inquiries: [Inquiry!]
}

# ============ PROPERTY TYPES ============

enum PropertyType {
  RESIDENTIAL
  COMMERCIAL
  LAND
  INDUSTRIAL
}

enum TransactionType {
  BUY
  RENT
  BOTH
}

enum PropertyStatus {
  ACTIVE
  SOLD
  RENTED
  EXPIRED
  INACTIVE
}

enum FurnishedStatus {
  FURNISHED
  SEMI_FURNISHED
  UNFURNISHED
}

type PropertyDimensions {
  bhk: Int
  bathrooms: Int
  totalArea: Float!
  carpetArea: Float
  floorNumber: Int
  totalFloors: Int
}

type PropertyPrice {
  amount: Decimal!
  perSqft: Decimal
  maintenance: Decimal
  maintenancePeriod: String
  currency: String!
}

type PropertyLocation {
  address: String!
  city: String!
  state: String!
  postalCode: String
  country: String!
  latitude: Float!
  longitude: Float!
  polygon: Polygon  # GeoJSON
}

type PropertyAmenity {
  id: Int!
  name: String!
  category: String!
  icon: String
}

type Property {
  id: ID!
  title: String!
  description: String
  type: PropertyType!
  transactionType: TransactionType!
  status: PropertyStatus!
  
  # Location & Geo
  location: PropertyLocation!
  geom: Point!  # GeoJSON Point
  
  # Details
  dimensions: PropertyDimensions!
  price: PropertyPrice!
  age: Int
  furnishedStatus: FurnishedStatus
  parking: Int
  hasBalcony: Boolean
  hasTerrasse: Boolean
  amenities: [PropertyAmenity!]
  
  # Media
  featuredImage: String
  images: [String!]
  videUrl: String
  tour360Url: String
  bimModelUrl: String
  
  # AI & Analytics
  aiDescription: String
  estimatedPrice: Decimal
  priceConfidence: Float  # 0-1
  localityScore: Float    # 0-100
  fraudScore: Float       # 0-100
  
  # Engagement
  viewCount: Int!
  savedCount: Int!
  inquiryCount: Int!
  isPremium: Boolean!
  isFeatured: Boolean!
  
  # Metadata
  owner: User!
  createdAt: DateTime!
  updatedAt: DateTime!
  expiresAt: DateTime
  
  # Relations
  inquiries: [Inquiry!]
  visits: [Visit!]
  nearbyInfrastructure: [Infrastructure!]
  floodRisk: FloodRisk
  isochrones: [Isochrone!]
}

# ============ GEO TYPES ============

type Point {
  type: String!  # "Point"
  coordinates: [Float!]!  # [longitude, latitude]
}

type Polygon {
  type: String!  # "Polygon"
  coordinates: [[[Float!]!]!]!
}

type MultiPolygon {
  type: String!  # "MultiPolygon"
  coordinates: [[[[Float!]!]!]!]!
}

# ============ GEOSPATIAL TYPES ============

enum FloodRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

type FloodRisk {
  level: FloodRiskLevel!
  geom: MultiPolygon!
  dataSource: String!
  sourceYear: Int!
}

enum InfrastructureType {
  SCHOOL
  HOSPITAL
  METRO_STATION
  MARKET
  PARK
  POLICE_STATION
  FIRE_STATION
}

type Infrastructure {
  id: ID!
  type: InfrastructureType!
  name: String!
  location: Point!
  radius: Int
  info: JSON
  distanceFromProperty: Float  # in meters
}

type Isochrone {
  minutes: Int!
  transitType: String!  # car, public_transport, walk, bike
  geom: MultiPolygon!
  properties: [Property!]
}

# ============ HEATMAP TYPES ============

enum HeatmapMetric {
  AVG_PRICE
  DEMAND_DENSITY
  SALES_COUNT
}

type HeatmapTile {
  z: Int!
  x: Int!
  y: Int!
  metric: HeatmapMetric!
  value: Float!
  minPrice: Decimal
  maxPrice: Decimal
  propertyCount: Int
  geom: Polygon!
}

type Heatmap {
  metric: HeatmapMetric!
  tiles: [HeatmapTile!]!
  bounds: Polygon!
  zoomLevel: Int!
}

# ============ SEARCH TYPES ============

type PropertyConnection {
  edges: [PropertyEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PropertyEdge {
  node: Property!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

# ============ COMMUNICATION TYPES ============

type Conversation {
  id: ID!
  participants: [User!]!
  property: Property
  messages: [Message!]!
  lastMessage: Message
  lastMessageAt: DateTime
  createdAt: DateTime!
}

type Message {
  id: ID!
  conversation: Conversation!
  sender: User!
  content: String!
  isRead: Boolean!
  readAt: DateTime
  createdAt: DateTime!
}

type Inquiry {
  id: ID!
  property: Property!
  buyer: User!
  seller: User!
  status: String!  -- pending, accepted, rejected, closed
  message: String
  phoneSharedMasked: String
  emailShared: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Visit {
  id: ID!
  property: Property!
  buyer: User!
  seller: User!
  scheduledAt: DateTime!
  status: String!  -- scheduled, completed, cancelled
  notes: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

# ============ AI/ML TYPES ============

type PriceEstimate {
  estimatedPrice: Decimal!
  confidence: Float!  -- 0-1
  model: String!
  comparables: [Property!]
  factors: [PriceFactor!]
}

type PriceFactor {
  name: String!
  impact: Float!  -- -X% to +X%
}

type LocalityScore {
  overall: Float!  -- 0-100
  safety: Float!
  connectivity: Float!
  livability: Float!
  roiPotential: Float!
  explanation: String
}

type InvestmentHotspot {
  area: String!
  expectedROI: Float!
  priceGrowthYearly: Float!
  demandGrowth: Float!
  riskLevel: String!  -- low, medium, high
}

# ============ ANALYTICS TYPES ============

type AnalyticsDashboard {
  listings: ListingStats!
  inquiries: InquiryStats!
  conversion: ConversionStats!
}

type ListingStats {
  active: Int!
  expired: Int!
  sold: Int!
  totalViews: Int!
  averageTimeToSell: Int!  -- days
}

type InquiryStats {
  total: Int!
  pending: Int!
  accepted: Int!
  conversionRate: Float!
}

type ConversionStats {
  viewToInquiryRate: Float!
  inquiryToSaleRate: Float!
  averageSalePrice: Decimal!
}

# ============ INPUT TYPES ============

input SignupInput {
  email: String!
  phone: String
  firstName: String!
  lastName: String!
  password: String!
  role: UserRole!
}

input LoginInput {
  email: String
  phone: String
  password: String
  otp: String
}

input CreatePropertyInput {
  title: String!
  description: String
  type: PropertyType!
  transactionType: TransactionType!
  
  # Location
  address: String!
  city: String!
  state: String!
  postalCode: String
  latitude: Float!
  longitude: Float!
  
  # Details
  bhk: Int
  bathrooms: Int
  totalArea: Float!
  carpetArea: Float
  floorNumber: Int
  totalFloors: Int
  age: Int
  furnishedStatus: FurnishedStatus
  parking: Int
  amenityIds: [Int!]
  
  # Pricing
  price: Decimal!
  maintenanceCost: Decimal
  maintenancePeriod: String
}

input UpdatePropertyInput {
  title: String
  description: String
  price: Decimal
  status: PropertyStatus
  # ... other fields
}

input PropertyFilterInput {
  city: String
  priceMin: Decimal
  priceMax: Decimal
  bhk: [Int!]
  propertyType: [PropertyType!]
  transactionType: [TransactionType!]
  amenities: [Int!]
  radiusKm: Float
  floodRiskLevel: [FloodRiskLevel!]
}

input BoundsInput {
  minLatitude: Float!
  maxLatitude: Float!
  minLongitude: Float!
  maxLongitude: Float!
}

input PointInput {
  latitude: Float!
  longitude: Float!
}

input PaginationInput {
  first: Int
  after: String
  last: Int
  before: String
}

input SortInput {
  field: String!
  direction: SortDirection!
}

enum SortDirection {
  ASC
  DESC
}

# ============ QUERIES ============

type Query {
  # User
  me: User
  user(id: ID!): User
  users(filter: JSON, pagination: PaginationInput): [User!]
  
  # Properties
  property(id: ID!): Property
  properties(
    filter: PropertyFilterInput
    pagination: PaginationInput
    sort: SortInput
  ): PropertyConnection!
  
  searchByMap(
    bounds: BoundsInput!
    filter: PropertyFilterInput
    pagination: PaginationInput
  ): [Property!]!
  
  myProperties(pagination: PaginationInput): [Property!]!
  savedProperties(pagination: PaginationInput): [Property!]!
  
  searchNearby(
    point: PointInput!
    radiusMeters: Int!
    filter: PropertyFilterInput
  ): [Property!]!
  
  # Geospatial
  isochrone(
    center: PointInput!
    minutes: Int!
    transitType: String!
  ): Isochrone
  
  floodRiskAt(point: PointInput!): FloodRisk
  
  infrastructureNear(
    point: PointInput!
    radiusMeters: Int!
    types: [InfrastructureType!]
  ): [Infrastructure!]!
  
  # Heatmaps
  priceHeatmap(bounds: BoundsInput!, zoomLevel: Int!): Heatmap!
  demandHeatmap(bounds: BoundsInput!, zoomLevel: Int!): Heatmap!
  
  # AI/ML
  priceEstimate(propertyInput: CreatePropertyInput!): PriceEstimate!
  localityScore(point: PointInput!): LocalityScore!
  investmentHotspots(city: String!): [InvestmentHotspot!]!
  
  # Communication
  conversations(pagination: PaginationInput): [Conversation!]!
  conversation(id: ID!): Conversation
  inquiries(propertyId: ID, pagination: PaginationInput): [Inquiry!]!
  visits(propertyId: ID, pagination: PaginationInput): [Visit!]!
  
  # Admin
  analytics: AnalyticsDashboard
  flaggedProperties(pagination: PaginationInput): [Property!]!
}

# ============ MUTATIONS ============

type Mutation {
  # Auth
  signup(input: SignupInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  sendOTP(phone: String!): Boolean!
  verifyOTP(phone: String!, otp: String!): AuthPayload!
  
  # User
  updateProfile(input: UpdateUserInput!): User!
  uploadAvatar(file: Upload!): String!
  verifyKYC(file: Upload!): KYCVerification!
  
  # Properties
  createProperty(input: CreatePropertyInput!): Property!
  updateProperty(id: ID!, input: UpdatePropertyInput!): Property!
  deleteProperty(id: ID!): Boolean!
  publishProperty(id: ID!): Property!
  archiveProperty(id: ID!): Property!
  
  # Media
  uploadImages(propertyId: ID!, files: [Upload!]!): [String!]!
  upload360Tour(propertyId: ID!, file: Upload!): String!
  uploadBIMModel(propertyId: ID!, file: Upload!): String!
  generateAIDescription(propertyId: ID!): String!
  
  # Engagement
  saveProperty(propertyId: ID!): Boolean!
  unsaveProperty(propertyId: ID!): Boolean!
  
  # Communication
  sendInquiry(propertyId: ID!, message: String!): Inquiry!
  replyToInquiry(inquiryId: ID!, message: String!): Message!
  
  sendMessage(
    conversationId: ID!
    content: String!
  ): Message!
  
  scheduleVisit(
    propertyId: ID!
    scheduledAt: DateTime!
    notes: String
  ): Visit!
  
  cancelVisit(visitId: ID!): Boolean!
  
  # Admin
  flagProperty(propertyId: ID!, reason: String!): Boolean!
  unflagProperty(propertyId: ID!): Boolean!
  approveProperty(propertyId: ID!): Property!
  rejectProperty(propertyId: ID!, reason: String!): Property!
  suspendUser(userId: ID!, reason: String!): Boolean!
}

type Subscription {
  propertyUpdated(id: ID!): Property!
  messageReceived(conversationId: ID!): Message!
  priceChanged(propertyId: ID!): PriceUpdate!
}

# ============ PAYLOADS ============

type AuthPayload {
  token: String!
  refreshToken: String!
  user: User!
}

type KYCVerification {
  status: KYCStatus!
  verifiedAt: DateTime
  rejectionReason: String
}

type PriceUpdate {
  propertyId: ID!
  oldPrice: Decimal!
  newPrice: Decimal!
  updatedAt: DateTime!
}
```

---

## 2. REST API Endpoints

### Authentication

```
POST   /api/v1/auth/signup
       {email, phone, firstName, lastName, password, role}
       
POST   /api/v1/auth/login
       {email/phone, password} or {phone, otp}
       
POST   /api/v1/auth/send-otp
       {phone}
       
POST   /api/v1/auth/verify-otp
       {phone, otp}
       
POST   /api/v1/auth/logout
       
POST   /api/v1/auth/refresh-token
       {refreshToken}
```

### Users

```
GET    /api/v1/users/me                      -- Current user profile
PUT    /api/v1/users/me                      -- Update profile
POST   /api/v1/users/me/avatar               -- Upload avatar
POST   /api/v1/users/me/kyc                  -- Submit KYC
GET    /api/v1/users/me/properties           -- User's properties
GET    /api/v1/users/me/saved                -- Saved properties
GET    /api/v1/users/:id                     -- User public profile
```

### Properties

```
GET    /api/v1/properties                    -- List (paginated)
POST   /api/v1/properties                    -- Create
GET    /api/v1/properties/:id                -- Get detail
PUT    /api/v1/properties/:id                -- Update
DELETE /api/v1/properties/:id                -- Delete
POST   /api/v1/properties/:id/publish        -- Publish listing
POST   /api/v1/properties/:id/archive        -- Archive listing

GET    /api/v1/properties/search/map         -- Search by bounds
GET    /api/v1/properties/search/nearby      -- Search nearby
GET    /api/v1/properties/:id/similar        -- Similar properties
```

### Media

```
POST   /api/v1/properties/:id/images         -- Upload images
POST   /api/v1/properties/:id/tour-360       -- Upload 360 tour
POST   /api/v1/properties/:id/bim            -- Upload BIM model
POST   /api/v1/properties/:id/generate-ai    -- Generate AI description
```

### Geospatial

```
GET    /api/v1/geo/isochrone
       ?lat=18.5&lon=73.8&minutes=30&type=public_transport
       
GET    /api/v1/geo/flood-risk
       ?lat=18.5&lon=73.8
       
GET    /api/v1/geo/infrastructure
       ?lat=18.5&lon=73.8&radius=1500&types=school,hospital
       
GET    /api/v1/geo/heatmap
       ?minLat=18.4&maxLat=18.6&minLon=73.7&maxLon=73.9
       &metric=avg_price&zoom=14
```

### Search & Discovery

```
GET    /api/v1/search/properties
       ?city=Mumbai&bhk=2&priceMin=5000000&priceMax=10000000
       &amenities=gym,pool&sortBy=price&order=asc
       
GET    /api/v1/search/investment-hotspots
       ?city=Mumbai&investmentType=residential
       
GET    /api/v1/search/suggest
       ?q=Bandra
```

### Communication

```
GET    /api/v1/conversations                 -- List conversations
POST   /api/v1/conversations                 -- Start conversation
GET    /api/v1/conversations/:id             -- Get conversation
POST   /api/v1/conversations/:id/messages    -- Send message
GET    /api/v1/conversations/:id/messages    -- Get messages

POST   /api/v1/inquiries                     -- Send inquiry
PUT    /api/v1/inquiries/:id                 -- Respond to inquiry

POST   /api/v1/visits/schedule               -- Schedule visit
PUT    /api/v1/visits/:id                    -- Update visit status
```

### Engagement

```
POST   /api/v1/saved-properties              -- Save property
DELETE /api/v1/saved-properties/:id          -- Unsave property
GET    /api/v1/saved-properties              -- Get saved list
```

### Analytics

```
GET    /api/v1/analytics/dashboard           -- Dashboard data (admin)
GET    /api/v1/analytics/properties          -- Property analytics (seller)
GET    /api/v1/analytics/events/track        -- Track event
```

### Admin

```
GET    /api/v1/admin/dashboard               -- Admin overview
GET    /api/v1/admin/properties/flagged      -- Flagged properties
POST   /api/v1/admin/properties/:id/approve  -- Approve listing
POST   /api/v1/admin/properties/:id/reject   -- Reject listing
POST   /api/v1/admin/users/:id/suspend       -- Suspend user
```

---

## 3. API Response Format

### Standard Response

```json
{
  "success": true,
  "data": { /* ... */ },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  },
  "meta": {
    "requestId": "abc-123",
    "processingTime": 45  // ms
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "Property with ID 'xyz' not found",
    "details": {
      "propertyId": "xyz"
    }
  },
  "meta": {
    "requestId": "abc-123",
    "timestamp": "2024-03-22T10:00:00Z"
  }
}
```

---

## 4. Rate Limiting

```
Global Rate Limit:     1000 requests/minute per IP
Authenticated User:    5000 requests/minute
Admin:                 10000 requests/minute
Search Endpoints:      100 requests/minute per IP
Upload Endpoints:      50 requests/minute per user
```

---

## 5. Authentication & Security

All endpoints require:

```
Authorization: Bearer {jwt_token}
X-Request-ID: {unique_id}
X-API-Version: 1.0
```

JWT includes:
- `sub`: User ID
- `role`: User role
- `email`: User email
- `iat`: Issued at
- `exp`: Expiration (24 hours)
- `aud`: Audience

---

## 6. Pagination

All list endpoints support:

```
?page=1&limit=20&sort=-createdAt&fields=id,title,price
```

---

## 7. Webhooks (for real-time integrations)

```
POST   /webhooks/property.created
POST   /webhooks/property.updated
POST   /webhooks/inquiry.received
POST   /webhooks/visit.scheduled
```

---

## 8. File Upload Specifications

### Images
```
Max Size:     10MB
Formats:      JPG, PNG, WebP
Dimensions:   Min 1200x900, Max 4000x3000
Compression:  Auto-optimized to 85% quality
```

### 360° Tours
```
Max Size:     100MB
Formats:      Equirectangular JPG/EXR
Resolution:   Min 4096x2048
```

### BIM Models
```
Max Size:     500MB
Formats:      IFC 2x3, IFC 4
Validation:   Schema validation
```

---

## 9. API Documentation

Live docs available at:
- GraphQL: `/graphql` (Apollo Sandbox)
- REST: `/api/docs` (Swagger UI)
- OpenAPI: `/api/openapi.json`

