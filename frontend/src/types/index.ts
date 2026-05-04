export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  avatar?: string
  role: 'user' | 'agent' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: string
  type: 'apartment' | 'house' | 'plot' | 'commercial'
  status: 'available' | 'sold' | 'rented' | 'under-offer'
  
  // Location
  address: string
  city: string
  state: string
  postalCode: string
  zipCode?: string // alternative field name
  country: string
  latitude: number
  longitude: number
  
  // Details
  bedrooms: number
  bathrooms: number
  area: number // in sqft
  lotArea?: number // lot size in sqft
  yearBuilt?: number
  amenities: string[]
  
  // Images
  images: string[]
  thumbnail: string
  
  // Metadata
  ownerId: string
  views: number
  favorites: number
  createdAt: string
  updatedAt: string
}

export interface PropertyFilter {
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minArea?: number
  maxArea?: number
  propertyTypes?: string[]
  status?: string[]
  amenities?: string[]
  radiusKm?: number
  
  // Geospatial
  centerLat?: number
  centerLon?: number
  isochrone?: {
    maxTimeMinutes: number
    mode: 'driving' | 'transit' | 'walking'
  }
}

export interface SearchResult {
  properties: Property[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface IsochroneResponse {
  properties: Property[]
  avgCommute: number
  boundingBox: {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  }
  nearbyTransit: TransitStation[]
}

export interface TransitStation {
  id: string
  name: string
  type: 'metro' | 'bus' | 'train'
  distance: number
  latitude: number
  longitude: number
}

export interface HeatmapData {
  type: 'price' | 'demand' | 'density'
  points: HeatmapPoint[]
  minValue: number
  maxValue: number
  avgValue: number
}

export interface HeatmapPoint {
  latitude: number
  longitude: number
  value: number
  count?: number
}

export interface InfrastructureResponse {
  walkabilityScore: number
  description: string
  amenities: AmenityCategory[]
  breakdown: Record<string, number>
}

export interface AmenityCategory {
  type: string
  count: number
  distance: number
  items: Amenity[]
}

export interface Amenity {
  id: string
  name: string
  type: string
  distance: number
  latitude: number
  longitude: number
  rating?: number
}

export interface PricePredictionResponse {
  predictedPrice: number
  priceRange: {
    min: number
    max: number
  }
  confidence: number
  comparables: Property[]
  pricePerSqft: number
}

export interface LocalityScoringResponse {
  score: number
  description: string
  metrics: {
    appreciationRate: number
    marketHealth: number
    amenityDensity: number
    walkability: number
    investmentPotential: number
  }
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: User
}

export interface ApiError {
  message: string
  code: string
  status: number
  details?: Record<string, string>
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MapLayerConfig {
  id: string
  name: string
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap'
  source: {
    type: 'geojson' | 'vector' | 'raster' | 'video' | 'image'
    data?: GeoJSON.FeatureCollection
    url?: string
  }
  paint?: Record<string, unknown>
  layout?: Record<string, unknown>
  visible: boolean
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint'
    coordinates: number[] | number[][] | number[][][]
  }
  properties: Record<string, unknown>
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface ViewportState {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
  width: number
  height: number
}

export namespace GeoJSON {
  interface FeatureCollection {
    type: 'FeatureCollection'
    features: Feature[]
  }

  interface Feature {
    type: 'Feature'
    geometry: Geometry
    properties: Record<string, unknown>
  }

  interface Geometry {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
    coordinates: unknown
  }
}
