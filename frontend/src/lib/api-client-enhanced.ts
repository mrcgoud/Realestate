import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios'

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
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
  }

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
    const requestInterceptor = (config: any) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    }

    // Response interceptor for error handling and retries
    const responseInterceptor = (response: AxiosResponse) => response

    const errorInterceptor = async (error: AxiosError) => {
      const config = error.config as any

      if (!config) {
        return Promise.reject(error)
      }

      // Handle 401 errors (token refresh/redirect)
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Implement retry logic for certain errors
      if (this.shouldRetry(error) && config._retryCount < this.retryConfig.maxRetries) {
        config._retryCount = (config._retryCount || 0) + 1

        const delay = this.calculateDelay(config._retryCount)
        console.warn(`Retrying request (${config._retryCount}/${this.retryConfig.maxRetries}) after ${delay}ms:`, error.message)

        await this.delay(delay)
        return this.client.request(config)
      }

      return Promise.reject(error)
    }

    this.client.interceptors.request.use(requestInterceptor)
    this.client.interceptors.response.use(responseInterceptor, errorInterceptor)

    // Geo client interceptors (same logic)
    this.geoClient.interceptors.request.use(requestInterceptor)
    this.geoClient.interceptors.response.use(responseInterceptor, async (error: AxiosError) => {
      const config = error.config as any

      if (!config) {
        return Promise.reject(error)
      }

      // Handle 401 errors for geo API
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      // Implement retry logic for geo API
      if (this.shouldRetry(error) && config._retryCount < this.retryConfig.maxRetries) {
        config._retryCount = (config._retryCount || 0) + 1

        const delay = this.calculateDelay(config._retryCount)
        console.warn(`Retrying geo request (${config._retryCount}/${this.retryConfig.maxRetries}) after ${delay}ms:`, error.message)

        await this.delay(delay)
        return this.geoClient.request(config)
      }

      return Promise.reject(error)
    })
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors, 5xx server errors, and specific 4xx errors
    if (!error.response) {
      // Network error
      return true
    }

    const status = error.response.status
    return status >= 500 || status === 429 || status === 408 || status === 504
  }

  private calculateDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.retryConfig.baseDelay * Math.pow(2, retryCount - 1),
      this.retryConfig.maxDelay
    )
    const jitter = Math.random() * 0.1 * exponentialDelay
    return exponentialDelay + jitter
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
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