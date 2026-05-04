import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const GEO_API_URL = process.env.NEXT_PUBLIC_GEO_API_URL || 'http://localhost:8000'

export interface ApiConfig {
  baseURL: string
  timeout: number
  withCredentials: boolean
}

class ApiClient {
  private client: AxiosInstance
  private geoClient: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true,
    })

    this.geoClient = axios.create({
      baseURL: GEO_API_URL,
      timeout: 15000,
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )

    // Geo client interceptors
    this.geoClient.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  // Auth endpoints
  async register(email: string, password: string, firstName: string, lastName: string) {
    const { data } = await this.client.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    })
    return data
  }

  async login(email: string, password: string) {
    const { data } = await this.client.post('/auth/login', { email, password })
    if (data.accessToken) {
      localStorage.setItem('auth_token', data.accessToken)
    }
    return data
  }

  async logout() {
    await this.client.post('/auth/logout')
    localStorage.removeItem('auth_token')
  }

  // User endpoints
  async getCurrentUser() {
    const { data } = await this.client.get('/users/me')
    return data
  }

  async updateUser(updates: Record<string, unknown>) {
    const { data } = await this.client.patch('/users/me', updates)
    return data
  }

  // Property endpoints
  async getProperties(filters?: Record<string, unknown>, page = 1, limit = 20) {
    const { data } = await this.client.get('/properties', {
      params: { ...filters, page, limit },
    })
    return data
  }

  async getPropertyById(id: string) {
    const { data } = await this.client.get(`/properties/${id}`)
    return data
  }

  async createProperty(propertyData: Record<string, unknown>) {
    const { data } = await this.client.post('/properties', propertyData)
    return data
  }

  async updateProperty(id: string, updates: Record<string, unknown>) {
    const { data } = await this.client.patch(`/properties/${id}`, updates)
    return data
  }

  async deleteProperty(id: string) {
    const { data } = await this.client.delete(`/properties/${id}`)
    return data
  }

  // Geospatial Service endpoints
  async calculateIsochrone(
    latitude: number,
    longitude: number,
    maxTimeMinutes: number,
    mode: 'driving' | 'transit' | 'walking' = 'driving'
  ) {
    const { data } = await this.geoClient.post('/api/isochrone/calculate', {
      latitude,
      longitude,
      max_time_minutes: maxTimeMinutes,
      mode,
    })
    return data
  }

  async getNearbyTransit(latitude: number, longitude: number, radiusKm = 5) {
    const { data } = await this.geoClient.get('/api/isochrone/nearby-transit', {
      params: { lat: latitude, lon: longitude, radius_km: radiusKm },
    })
    return data
  }

  async generateHeatmap(
    minLat: number,
    maxLat: number,
    minLon: number,
    maxLon: number,
    heatmapType: 'price' | 'demand' | 'density' = 'price'
  ) {
    const { data } = await this.geoClient.post('/api/heatmap/generate', {
      min_lat: minLat,
      max_lat: maxLat,
      min_lon: minLon,
      max_lon: maxLon,
      heatmap_type: heatmapType,
    })
    return data
  }

  async getNearbyInfrastructure(latitude: number, longitude: number, radiusKm = 2) {
    const { data } = await this.geoClient.get('/api/infrastructure/nearby', {
      params: { lat: latitude, lon: longitude, radius_km: radiusKm },
    })
    return data
  }

  async getWalkabilityScore(latitude: number, longitude: number) {
    const { data } = await this.geoClient.get('/api/infrastructure/walkability-score', {
      params: { lat: latitude, lon: longitude },
    })
    return data
  }

  async predictPrice(
    latitude: number,
    longitude: number,
    bedrooms: number,
    bathrooms: number,
    sqft: number,
    yearBuilt?: number,
    propertyType: string = 'apartment'
  ) {
    const { data } = await this.geoClient.post('/api/analytics/predict-price', {
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      sqft,
      year_built: yearBuilt,
      property_type: propertyType,
    })
    return data
  }

  async scoreLocality(latitude: number, longitude: number) {
    const { data } = await this.geoClient.post('/api/analytics/score-locality', {
      latitude,
      longitude,
    })
    return data
  }

  // Favorites/Bookmarks
  async addFavorite(propertyId: string) {
    const { data } = await this.client.post(`/favorites`, { propertyId })
    return data
  }

  async removeFavorite(propertyId: string) {
    const { data } = await this.client.delete(`/favorites/${propertyId}`)
    return data
  }

  async getFavorites() {
    const { data } = await this.client.get('/favorites')
    return data
  }

  // Search
  async searchProperties(query: string, filters?: Record<string, unknown>) {
    const { data } = await this.client.get('/search', {
      params: { q: query, ...filters },
    })
    return data
  }

  // Property Inquiries
  async sendPropertyInquiry(inquiryData: {
    propertyId: string
    name: string
    email: string
    phone?: string
    message: string
    type: 'message' | 'tour'
    tourDate?: string
    tourTime?: string
  }) {
    const { data } = await this.client.post(`/properties/${inquiryData.propertyId}/inquiries`, inquiryData)
    return data
  }

  // Related Properties
  async getRelatedProperties(propertyId: string, limit = 4) {
    const { data } = await this.client.get(`/properties/${propertyId}/related`, {
      params: { limit },
    })
    return data
  }
}

export const apiClient = new ApiClient()

export default apiClient
