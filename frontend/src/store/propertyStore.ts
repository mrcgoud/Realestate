import { create } from 'zustand'
import { Property } from '@/types'
import { apiClient } from '@/lib/api-client'

interface PropertyStore {
  // Current property being viewed
  currentProperty: Property | null
  
  // Favorites
  favorites: Set<string>
  favoritesLoading: boolean
  
  // Recent views
  recentViews: Property[]
  
  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  setCurrentProperty: (property: Property | null) => void
  fetchProperty: (id: string) => Promise<void>
  
  // Favorites
  addFavorite: (propertyId: string) => Promise<void>
  removeFavorite: (propertyId: string) => Promise<void>
  isFavorite: (propertyId: string) => boolean
  fetchFavorites: () => Promise<void>
  
  // Recent views
  addToRecentViews: (property: Property) => void
  clearRecentViews: () => void
  
  // Utility
  clearError: () => void
  clearCurrentProperty: () => void
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  currentProperty: null,
  favorites: new Set(),
  favoritesLoading: false,
  recentViews: [],
  isLoading: false,
  error: null,

  setCurrentProperty: (property: Property | null) => {
    set({ currentProperty: property })
    if (property) {
      get().addToRecentViews(property)
    }
  },

  fetchProperty: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const property = await apiClient.getPropertyById(id)
      set({ currentProperty: property, isLoading: false })
      get().addToRecentViews(property)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch property'
      set({ error: message, isLoading: false })
    }
  },

  addFavorite: async (propertyId: string) => {
    try {
      await apiClient.addFavorite(propertyId)
      set((state) => ({
        favorites: new Set([...state.favorites, propertyId]),
      }))
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add favorite'
      set({ error: message })
    }
  },

  removeFavorite: async (propertyId: string) => {
    try {
      await apiClient.removeFavorite(propertyId)
      set((state) => {
        const newFavorites = new Set(state.favorites)
        newFavorites.delete(propertyId)
        return { favorites: newFavorites }
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove favorite'
      set({ error: message })
    }
  },

  isFavorite: (propertyId: string) => {
    return get().favorites.has(propertyId)
  },

  fetchFavorites: async () => {
    set({ favoritesLoading: true })
    try {
      const response = await apiClient.getFavorites()
      const favoriteIds = new Set(response.properties?.map((p: Property) => p.id) || [])
      set({ favorites: favoriteIds, favoritesLoading: false })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch favorites'
      set({ error: message, favoritesLoading: false })
    }
  },

  addToRecentViews: (property: Property) => {
    set((state) => {
      const views = state.recentViews.filter((p) => p.id !== property.id)
      return {
        recentViews: [property, ...views].slice(0, 10),
      }
    })
  },

  clearRecentViews: () => set({ recentViews: [] }),

  clearError: () => set({ error: null }),

  clearCurrentProperty: () => set({ currentProperty: null }),
}))
