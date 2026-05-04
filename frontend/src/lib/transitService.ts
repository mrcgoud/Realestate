/**
 * Transit Station API Service
 * Handles fetching and processing transit station data
 */

export interface TransitStation {
  id: string
  name: string
  type: 'bus' | 'subway' | 'train'
  latitude: number
  longitude: number
  routes?: string[]
  distance?: number // Distance to reference point in meters
  walkTime?: number // Time to walk to station in minutes
}

export interface TransitFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: {
    id: string
    name: string
    type: 'bus' | 'subway' | 'train'
    routes?: string[]
    distance?: number
    walkTime?: number
  }
}

export interface TransitFeatureCollection {
  type: 'FeatureCollection'
  features: TransitFeature[]
}

/**
 * Generate mock transit stations for the given bounds
 * In production, this would call a real API
 */
export function generateMockTransitStations(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  type: 'all' | 'bus' | 'subway' | 'train' = 'all',
  referencePoint?: { lat: number; lon: number }
): TransitFeature[] {
  // Mock transit stations
  const allStations: TransitStation[] = [
    // NYC Subway Stations (Central Area)
    {
      id: 'subway-001',
      name: 'Times Square Station',
      type: 'subway',
      latitude: 40.7577,
      longitude: -73.9855,
      routes: ['A', 'C', 'E', '1', '2', '3'],
    },
    {
      id: 'subway-002',
      name: 'Penn Station',
      type: 'subway',
      latitude: 40.7505,
      longitude: -73.9933,
      routes: ['A', 'C', 'E'],
    },
    {
      id: 'subway-003',
      name: 'Grand Central Terminal',
      type: 'subway',
      latitude: 40.7527,
      longitude: -73.9772,
      routes: ['4', '5', '6', '7'],
    },
    {
      id: 'subway-004',
      name: 'Union Square Station',
      type: 'subway',
      latitude: 40.7354,
      longitude: -73.9912,
      routes: ['L', 'N', 'Q', 'R', 'W', '4', '5', '6'],
    },
    {
      id: 'subway-005',
      name: 'Herald Square Station',
      type: 'subway',
      latitude: 40.7488,
      longitude: -73.9871,
      routes: ['A', 'C', 'E', 'F', 'M', 'N', 'Q', 'R', 'W', '1', '2', '3'],
    },

    // Bus Route Stations
    {
      id: 'bus-001',
      name: '42nd St & 5th Ave Bus Stop',
      type: 'bus',
      latitude: 40.7539,
      longitude: -73.9841,
      routes: ['M1', 'M2', 'M3', 'M4', 'M5'],
    },
    {
      id: 'bus-002',
      name: '34th St & Madison Ave Bus Stop',
      type: 'bus',
      latitude: 40.7485,
      longitude: -73.9857,
      routes: ['M1', 'M2', 'M3'],
    },
    {
      id: 'bus-003',
      name: 'Broadway & 23rd St Bus Stop',
      type: 'bus',
      latitude: 40.7411,
      longitude: -73.9897,
      routes: ['M23', 'M6'],
    },
    {
      id: 'bus-004',
      name: 'Park Ave & 59th St Bus Stop',
      type: 'bus',
      latitude: 40.7659,
      longitude: -73.9776,
      routes: ['M1', 'M2', 'M4'],
    },
    {
      id: 'bus-005',
      name: 'Central Park South Bus Stop',
      type: 'bus',
      latitude: 40.7702,
      longitude: -73.9864,
      routes: ['M10', 'M20', 'M31'],
    },

    // Train Stations (LIRR/NJ Transit)
    {
      id: 'train-001',
      name: 'Penn Station (LIRR/NJ Transit)',
      type: 'train',
      latitude: 40.7505,
      longitude: -73.9933,
      routes: ['LIRR', 'NJ Transit'],
    },
    {
      id: 'train-002',
      name: 'Grand Central (Metro-North)',
      type: 'train',
      latitude: 40.7527,
      longitude: -73.9772,
      routes: ['Metro-North'],
    },
    {
      id: 'train-003',
      name: '125th Street Station',
      type: 'subway',
      latitude: 40.8133,
      longitude: -73.9582,
      routes: ['Harlem-125th'],
    },
  ]

  // Filter by type
  let stations = allStations
  if (type !== 'all') {
    stations = allStations.filter((s) => s.type === type)
  }

  // Filter by bounds
  stations = stations.filter((s) => {
    const inLatBounds = s.latitude >= minLat && s.latitude <= maxLat
    const inLonBounds = s.longitude >= minLon && s.longitude <= maxLon
    return inLatBounds && inLonBounds
  })

  // Calculate distance to reference point if provided
  if (referencePoint) {
    stations = stations.map((s) => ({
      ...s,
      distance: calculateDistance(
        referencePoint.lat,
        referencePoint.lon,
        s.latitude,
        s.longitude
      ),
      walkTime: calculateWalkTime(
        referencePoint.lat,
        referencePoint.lon,
        s.latitude,
        s.longitude
      ),
    }))
  }

  // Convert to GeoJSON features
  return stations.map((station) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [station.longitude, station.latitude],
    },
    properties: {
      id: station.id,
      name: station.name,
      type: station.type,
      routes: station.routes,
      distance: station.distance,
      walkTime: station.walkTime,
    },
  }))
}

/**
 * Fetch transit stations from API
 * Currently returns mock data, can be replaced with real API call
 */
export async function fetchTransitStations(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  type: 'all' | 'bus' | 'subway' | 'train' = 'all',
  referencePoint?: { lat: number; lon: number }
): Promise<TransitFeatureCollection> {
  try {
    // Import apiClient dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api-client')

    // Calculate center point for API call
    const centerLat = (minLat + maxLat) / 2
    const centerLon = (minLon + maxLon) / 2

    // Calculate radius based on bounds (approximate)
    const latDiff = maxLat - minLat
    const lonDiff = maxLon - minLon
    const radiusKm = Math.max(latDiff, lonDiff) * 111 // Rough km conversion

    // Call real API
    const stations = await apiClient.getNearbyTransit(centerLat, centerLon, radiusKm)

    // Filter by type if specified
    let filteredStations = stations
    if (type !== 'all') {
      filteredStations = stations.filter((station: any) => station.type === type)
    }

    // Filter by bounds
    filteredStations = filteredStations.filter((station: any) => {
      const inLatBounds = station.latitude >= minLat && station.latitude <= maxLat
      const inLonBounds = station.longitude >= minLon && station.longitude <= maxLon
      return inLatBounds && inLonBounds
    })

    // Calculate distance and walk time if reference point provided
    if (referencePoint) {
      filteredStations = filteredStations.map((station: any) => ({
        ...station,
        distance: calculateDistance(
          referencePoint.lat,
          referencePoint.lon,
          station.latitude,
          station.longitude
        ),
        walkTime: calculateWalkTime(
          referencePoint.lat,
          referencePoint.lon,
          station.latitude,
          station.longitude
        ),
      }))
    }

    // Convert to GeoJSON features
    const features: TransitFeature[] = filteredStations.map((station: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [station.longitude, station.latitude],
      },
      properties: {
        id: station.id,
        name: station.name,
        type: station.type,
        routes: station.routes,
        distance: station.distance,
        walkTime: station.walkTime,
      },
    }))

    return {
      type: 'FeatureCollection',
      features,
    }
  } catch (error) {
    console.error('Error fetching transit stations from API:', error)

    // Fallback to mock data if API fails
    console.warn('Falling back to mock transit data')
    const features = generateMockTransitStations(
      minLat,
      maxLat,
      minLon,
      maxLon,
      type,
      referencePoint
    )

    return {
      type: 'FeatureCollection',
      features,
    }
  }
}

/**
 * Calculate distance between two lat/lon points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate walking time in minutes
 * Assumes average walking speed of 1.4 m/s (3.1 mph)
 */
export function calculateWalkTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const distance = calculateDistance(lat1, lon1, lat2, lon2)
  const walkingSpeed = 1.4 // m/s
  const timeSeconds = distance / walkingSpeed
  return Math.round(timeSeconds / 60) // Convert to minutes
}

/**
 * Helper function to convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get transit type color for UI
 */
export function getTransitTypeColor(type: 'bus' | 'subway' | 'train'): string {
  switch (type) {
    case 'bus':
      return '#ef4444' // red
    case 'subway':
      return '#3b82f6' // blue
    case 'train':
      return '#8b5cf6' // purple
    default:
      return '#6b7280' // gray
  }
}

/**
 * Get transit type icon
 */
export function getTransitTypeIcon(type: 'bus' | 'subway' | 'train'): string {
  switch (type) {
    case 'bus':
      return '🚌'
    case 'subway':
      return '🚇'
    case 'train':
      return '🚆'
    default:
      return '📍'
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * Format walk time for display
 */
export function formatWalkTime(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min'
  }
  return `${Math.round(minutes)} min`
}
