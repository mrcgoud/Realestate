import { create } from 'zustand'
import { Property, PropertyFilter, SearchResult } from '@/types'
import { apiClient } from '@/lib/api-client'

interface VoiceSearchResult {
  query: string
  confidence: number
  intent: 'search' | 'navigate' | 'filter' | 'show_property'
  entities: {
    location?: string
    price?: { min?: number; max?: number }
    propertyType?: string
    bedrooms?: number
    bathrooms?: number
  }
}

interface SearchSuggestion {
  id: string
  text: string
  type: 'location' | 'property_type' | 'price_range' | 'feature'
  category: string
  popularity: number
}

interface SearchStore {
  // State
  query: string
  filters: PropertyFilter
  results: Property[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  error: string | null
  hasMore: boolean

  // Voice Search State
  voiceActive: boolean
  voiceResults: VoiceSearchResult[]
  voiceHistory: string[]

  // Smart Search State
  suggestions: SearchSuggestion[]
  recentSearches: string[]
  popularSearches: string[]
  searchAnalytics: {
    averageResponseTime: number
    totalSearches: number
    successfulSearches: number
  }

  // Offline Search State
  offlineMode: boolean
  cachedResults: Map<string, Property[]>
  offlineSearchIndex: Map<string, string[]>

  // Advanced Features
  smartFilters: boolean
  autoComplete: boolean
  locationBasedSearch: boolean
  userLocation: { latitude: number; longitude: number } | null

  // Actions
  setQuery: (query: string) => void
  setFilters: (filters: PropertyFilter) => void
  updateFilter: (key: keyof PropertyFilter, value: unknown) => void
  search: () => Promise<void>
  loadMore: () => Promise<void>
  resetSearch: () => void
  clearError: () => void
  setPage: (page: number) => void

  // Voice Search Actions
  startVoiceSearch: () => void
  stopVoiceSearch: () => void
  processVoiceResult: (result: VoiceSearchResult) => void
  addVoiceHistory: (query: string) => void
  clearVoiceHistory: () => void

  // Smart Search Actions
  loadSuggestions: (query: string) => Promise<void>
  addRecentSearch: (query: string) => void
  removeRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  updateSearchAnalytics: (responseTime: number, success: boolean) => void

  // Offline Search Actions
  setOfflineMode: (enabled: boolean) => void
  cacheSearchResults: (query: string, results: Property[]) => void
  getCachedResults: (query: string) => Property[] | null
  buildOfflineIndex: (properties: Property[]) => void
  searchOffline: (query: string) => Property[]

  // Advanced Feature Actions
  setSmartFilters: (enabled: boolean) => void
  setAutoComplete: (enabled: boolean) => void
  setLocationBasedSearch: (enabled: boolean) => void
  updateUserLocation: (location: { latitude: number; longitude: number }) => void
  applySmartFilters: () => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  filters: {},
  results: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,
  hasMore: false,

  // Voice Search defaults
  voiceActive: false,
  voiceResults: [],
  voiceHistory: [],

  // Smart Search defaults
  suggestions: [],
  recentSearches: [],
  popularSearches: [
    '2 bedroom apartment downtown',
    'condo under $500K',
    'house with garage',
    'pet friendly rentals'
  ],
  searchAnalytics: {
    averageResponseTime: 0,
    totalSearches: 0,
    successfulSearches: 0
  },

  // Offline Search defaults
  offlineMode: false,
  cachedResults: new Map(),
  offlineSearchIndex: new Map(),

  // Advanced Features defaults
  smartFilters: true,
  autoComplete: true,
  locationBasedSearch: false,
  userLocation: null,

  setQuery: (query: string) => set({ query, page: 1 }),

  setFilters: (filters: PropertyFilter) => set({ filters, page: 1 }),

  updateFilter: (key: keyof PropertyFilter, value: unknown) => {
    const state = get()
    set({
      filters: { ...state.filters, [key]: value },
      page: 1,
    })
  },

  search: async () => {
    set({ isLoading: true, error: null })
    try {
      const state = get()
      const response = await apiClient.searchProperties(state.query, {
        ...state.filters,
        page: state.page,
        limit: state.pageSize,
      })

      set({
        results: response.properties || [],
        total: response.total || 0,
        hasMore: response.hasMore || false,
        isLoading: false,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Search failed'
      set({ error: message, isLoading: false })
    }
  },

  loadMore: async () => {
    const state = get()
    set({ isLoading: true, page: state.page + 1 })
    await state.search()
  },

  resetSearch: () =>
    set({
      query: '',
      filters: {},
      results: [],
      total: 0,
      page: 1,
      error: null,
      hasMore: false,
    }),

  clearError: () => set({ error: null }),

  setPage: (page: number) => set({ page }),

  // Voice Search Actions
  startVoiceSearch: () => set({ voiceActive: true }),

  stopVoiceSearch: () => set({ voiceActive: false }),

  processVoiceResult: (result: VoiceSearchResult) => {
    set((state) => ({
      voiceResults: [...state.voiceResults.slice(-4), result] // Keep last 5 results
    }))

    // Apply voice search results to main search
    if (result.intent === 'search') {
      get().setQuery(result.query)
      get().search()
    } else if (result.intent === 'filter' && result.entities) {
      const newFilters: PropertyFilter = {}

      if (result.entities.price) {
        if (result.entities.price.min) newFilters.minPrice = result.entities.price.min
        if (result.entities.price.max) newFilters.maxPrice = result.entities.price.max
      }

      if (result.entities.propertyType) {
        newFilters.propertyType = result.entities.propertyType
      }

      if (result.entities.bedrooms) {
        newFilters.bedrooms = result.entities.bedrooms
      }

      if (result.entities.bathrooms) {
        newFilters.bathrooms = result.entities.bathrooms
      }

      get().setFilters({ ...get().filters, ...newFilters })
      get().search()
    }
  },

  addVoiceHistory: (query: string) =>
    set((state) => ({
      voiceHistory: [query, ...state.voiceHistory.slice(0, 9)] // Keep last 10
    })),

  clearVoiceHistory: () => set({ voiceHistory: [] }),

  // Smart Search Actions
  loadSuggestions: async (query: string) => {
    if (!query || query.length < 2) {
      set({ suggestions: [] })
      return
    }

    try {
      // Simulate API call for suggestions
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          text: `${query} apartments`,
          type: 'property_type',
          category: 'Housing',
          popularity: 0.8
        },
        {
          id: '2',
          text: `${query} condos`,
          type: 'property_type',
          category: 'Housing',
          popularity: 0.6
        },
        {
          id: '3',
          text: `${query} houses`,
          type: 'property_type',
          category: 'Housing',
          popularity: 0.7
        }
      ]

      set({ suggestions: mockSuggestions })
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  },

  addRecentSearch: (query: string) =>
    set((state) => ({
      recentSearches: [query, ...state.recentSearches.filter(s => s !== query).slice(0, 9)]
    })),

  removeRecentSearch: (query: string) =>
    set((state) => ({
      recentSearches: state.recentSearches.filter(s => s !== query)
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),

  updateSearchAnalytics: (responseTime: number, success: boolean) => {
    set((state) => {
      const newTotal = state.searchAnalytics.totalSearches + 1
      const newSuccessful = state.searchAnalytics.successfulSearches + (success ? 1 : 0)
      const newAvgTime = (
        (state.searchAnalytics.averageResponseTime * state.searchAnalytics.totalSearches) + responseTime
      ) / newTotal

      return {
        searchAnalytics: {
          averageResponseTime: newAvgTime,
          totalSearches: newTotal,
          successfulSearches: newSuccessful
        }
      }
    })
  },

  // Offline Search Actions
  setOfflineMode: (enabled: boolean) => set({ offlineMode: enabled }),

  cacheSearchResults: (query: string, results: Property[]) =>
    set((state) => {
      const newCache = new Map(state.cachedResults)
      newCache.set(query.toLowerCase(), results)
      return { cachedResults: newCache }
    }),

  getCachedResults: (query: string) => {
    const state = get()
    return state.cachedResults.get(query.toLowerCase()) || null
  },

  buildOfflineIndex: (properties: Property[]) => {
    const index = new Map<string, string[]>()

    properties.forEach(property => {
      const searchableText = [
        property.title,
        property.description,
        property.address,
        property.city,
        property.state,
        property.propertyType,
        property.neighborhood
      ].join(' ').toLowerCase()

      // Create index entries for each word
      const words = searchableText.split(/\s+/).filter(word => word.length > 2)
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, [])
        }
        index.get(word)!.push(property.id)
      })
    })

    set({ offlineSearchIndex: index })
  },

  searchOffline: (query: string) => {
    const state = get()
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2)

    if (queryWords.length === 0) return []

    // Find property IDs that match any query word
    const matchingIds = new Set<string>()
    queryWords.forEach(word => {
      const ids = state.offlineSearchIndex.get(word) || []
      ids.forEach(id => matchingIds.add(id))
    })

    // Get all cached properties and filter by matching IDs
    const allCachedProperties: Property[] = []
    state.cachedResults.forEach(results => {
      allCachedProperties.push(...results)
    })

    return allCachedProperties.filter(property =>
      matchingIds.has(property.id)
    ).slice(0, 50) // Limit results
  },

  // Advanced Feature Actions
  setSmartFilters: (enabled: boolean) => set({ smartFilters: enabled }),

  setAutoComplete: (enabled: boolean) => set({ autoComplete: enabled }),

  setLocationBasedSearch: (enabled: boolean) => set({ locationBasedSearch: enabled }),

  updateUserLocation: (location: { latitude: number; longitude: number }) =>
    set({ userLocation: location }),

  applySmartFilters: () => {
    const state = get()
    if (!state.smartFilters || !state.userLocation) return

    // Apply location-based smart filters
    const smartFilters: PropertyFilter = {
      ...state.filters,
      // Add smart defaults based on user location and preferences
      maxDistance: 10, // 10km radius
      sortBy: 'distance'
    }

    set({ filters: smartFilters })
  },
}))
