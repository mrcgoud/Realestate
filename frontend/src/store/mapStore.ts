import { create } from 'zustand'
import { ViewportState, MapLayerConfig, Property } from '@/types'

interface MapStore {
  // Map viewport state
  viewport: ViewportState

  // Layer visibility - objects for easier toggle tracking
  visibleLayers: Record<string, boolean>
  layers: Map<string, MapLayerConfig>

  // Heatmap state
  heatmapType: 'price' | 'demand' | 'density'

  // Isochrone state
  isochroneMode: boolean
  isochroneTime: number

  // Transit state
  transitType: 'all' | 'bus' | 'subway' | 'train'
  showTransitDistance: boolean

  // Advanced Analytics state
  analyticsType: 'walkability' | 'pricePrediction' | 'marketTrends' | 'neighborhood'
  analyticsOpacity: number // 0-1
  showAnalyticsLabels: boolean

  // Amenities/Infrastructure
  selectedAmenities: string[]

  // Enhanced Mobile-specific state
  isMobile: boolean
  bottomSheetOpen: boolean
  bottomSheetHeight: number
  hapticFeedback: boolean

  // Advanced Mobile Features
  offlineMode: boolean
  offlineTiles: Set<string>
  offlineRegions: Array<{
    id: string
    bounds: [[number, number], [number, number]]
    downloaded: boolean
    lastUpdated: number
  }>

  // Voice & Gesture State
  voiceActive: boolean
  gestureMode: boolean
  gestureHistory: Array<{
    type: string
    timestamp: number
    data: any
  }>

  // AR State
  arMode: boolean
  arProperty: Property | null
  arMeasurements: {
    width: number
    height: number
    area: number
  }

  // Biometric State
  biometricEnabled: boolean
  biometricCredentials: any[]

  // Smart Features
  geofencingEnabled: boolean
  activeGeofences: Set<string>
  smartNotifications: Array<{
    id: string
    type: 'geofence' | 'price' | 'new-listing'
    message: string
    timestamp: number
    data: any
  }>

  // PWA State
  pwaInstalled: boolean
  backgroundSyncEnabled: boolean
  pushNotificationsEnabled: boolean

  // Performance & Caching
  mapCache: Map<string, any>
  lastLocation: { latitude: number; longitude: number } | null
  locationTracking: boolean

  // Actions
  setViewport: (viewport: Partial<ViewportState>) => void
  toggleLayer: (layerId: string) => void
  setLayerVisibility: (layerId: string, visible: boolean) => void
  addLayer: (layer: MapLayerConfig) => void
  removeLayer: (layerId: string) => void
  setHeatmapType: (type: 'price' | 'demand' | 'density') => void
  toggleHeatmap: () => void
  setIsochrone: (enabled: boolean, time: number) => void
  toggleIsochrone: () => void
  toggleAmenities: () => void
  updateSelectedAmenities: (amenities: string[]) => void
  setTransitType: (type: 'all' | 'bus' | 'subway' | 'train') => void
  toggleTransitDistance: () => void
  setAnalyticsType: (type: 'walkability' | 'pricePrediction' | 'marketTrends' | 'neighborhood') => void
  setAnalyticsOpacity: (opacity: number) => void
  toggleAnalyticsLabels: () => void
  resetMap: () => void
  fitBounds: (minLat: number, maxLat: number, minLon: number, maxLon: number) => void

  // Enhanced Mobile Actions
  setMobileMode: (isMobile: boolean) => void
  setBottomSheetState: (open: boolean, height?: number) => void
  toggleHapticFeedback: () => void

  // Advanced Mobile Actions
  setOfflineMode: (enabled: boolean) => void
  addOfflineTile: (tileId: string) => void
  removeOfflineTile: (tileId: string) => void
  addOfflineRegion: (region: { id: string; bounds: [[number, number], [number, number]] }) => void
  updateOfflineRegion: (id: string, downloaded: boolean) => void
  clearOfflineData: () => void

  setVoiceActive: (active: boolean) => void
  setGestureMode: (enabled: boolean) => void
  addGestureEvent: (gesture: { type: string; data: any }) => void
  clearGestureHistory: () => void

  setARMode: (enabled: boolean, property?: Property) => void
  updateARMeasurements: (measurements: { width: number; height: number; area: number }) => void

  setBiometricEnabled: (enabled: boolean) => void
  addBiometricCredential: (credential: any) => void
  clearBiometricCredentials: () => void

  setGeofencingEnabled: (enabled: boolean) => void
  addActiveGeofence: (geofenceId: string) => void
  removeActiveGeofence: (geofenceId: string) => void
  addSmartNotification: (notification: { type: string; message: string; data: any }) => void
  clearSmartNotifications: () => void

  setPWAInstalled: (installed: boolean) => void
  setBackgroundSync: (enabled: boolean) => void
  setPushNotifications: (enabled: boolean) => void

  updateLocation: (location: { latitude: number; longitude: number }) => void
  setLocationTracking: (enabled: boolean) => void
  cacheMapData: (key: string, data: any) => void
  getCachedMapData: (key: string) => any
  clearMapCache: () => void

  // Voice Command Actions
  executeVoiceCommand: (command: {
    action: string
    query?: string
    location?: { lat: number; lng: number }
    level?: number
    propertyId?: string
  }) => void

  // Gesture Actions
  handleGesture: (gesture: {
    type: 'pinch' | 'rotate' | 'pan' | 'swipe' | 'tap' | 'double-tap' | 'long-press'
    scale?: number
    rotation?: number
    deltaX?: number
    deltaY?: number
    velocityX?: number
    velocityY?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    fingers?: number
  }) => void
}

const defaultViewport: ViewportState = {
  latitude: 40.7128, // NYC center
  longitude: -74.006,
  zoom: 12,
  bearing: 0,
  pitch: 0,
  width: 1000,
  height: 600,
}

export const useMapStore = create<MapStore>((set, get) => ({
  viewport: defaultViewport,
  visibleLayers: { properties: true },
  layers: new Map(),
  heatmapType: 'price',
  isochroneMode: false,
  isochroneTime: 30,
  transitType: 'all',
  showTransitDistance: true,
  analyticsType: 'walkability',
  analyticsOpacity: 0.7,
  showAnalyticsLabels: true,
  selectedAmenities: [],

  // Enhanced Mobile defaults
  isMobile: false,
  bottomSheetOpen: false,
  bottomSheetHeight: 120,
  hapticFeedback: true,

  // Advanced Mobile Features defaults
  offlineMode: false,
  offlineTiles: new Set(),
  offlineRegions: [],

  voiceActive: false,
  gestureMode: false,
  gestureHistory: [],

  arMode: false,
  arProperty: null,
  arMeasurements: { width: 0, height: 0, area: 0 },

  biometricEnabled: false,
  biometricCredentials: [],

  geofencingEnabled: true,
  activeGeofences: new Set(),
  smartNotifications: [],

  pwaInstalled: false,
  backgroundSyncEnabled: false,
  pushNotificationsEnabled: false,

  mapCache: new Map(),
  lastLocation: null,
  locationTracking: false,

  setViewport: (viewport: Partial<ViewportState>) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),

  toggleLayer: (layerId: string) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: !state.visibleLayers[layerId],
      },
    })),

  setLayerVisibility: (layerId: string, visible: boolean) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layerId]: visible,
      },
    })),

  addLayer: (layer: MapLayerConfig) =>
    set((state) => {
      const newLayers = new Map(state.layers)
      newLayers.set(layer.id, layer)
      return { layers: newLayers }
    }),

  removeLayer: (layerId: string) =>
    set((state) => {
      const newLayers = new Map(state.layers)
      newLayers.delete(layerId)
      const { [layerId]: _, ...rest } = state.visibleLayers
      return { layers: newLayers, visibleLayers: rest }
    }),

  setHeatmapType: (type: 'price' | 'demand' | 'density') =>
    set({ heatmapType: type }),

  toggleHeatmap: () =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        heatmap: !state.visibleLayers.heatmap,
      },
    })),

  setIsochrone: (enabled: boolean, time: number) =>
    set({ isochroneMode: enabled, isochroneTime: time }),

  toggleIsochrone: () =>
    set((state) => ({
      isochroneMode: !state.isochroneMode,
    })),

  toggleAmenities: () =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        amenities: !state.visibleLayers.amenities,
      },
    })),

  updateSelectedAmenities: (amenities: string[]) =>
    set({ selectedAmenities: amenities }),

  setTransitType: (type: 'all' | 'bus' | 'subway' | 'train') =>
    set({ transitType: type }),

  toggleTransitDistance: () =>
    set((state) => ({
      showTransitDistance: !state.showTransitDistance,
    })),

  setAnalyticsType: (type: 'walkability' | 'pricePrediction' | 'marketTrends' | 'neighborhood') =>
    set({ analyticsType: type }),

  setAnalyticsOpacity: (opacity: number) =>
    set({ analyticsOpacity: Math.min(1, Math.max(0, opacity)) }),

  toggleAnalyticsLabels: () =>
    set((state) => ({
      showAnalyticsLabels: !state.showAnalyticsLabels,
    })),

  resetMap: () =>
    set({
      viewport: defaultViewport,
      visibleLayers: { properties: true },
      heatmapType: 'price',
      isochroneMode: false,
      isochroneTime: 30,
      transitType: 'all',
      showTransitDistance: true,
      analyticsType: 'walkability',
      analyticsOpacity: 0.7,
      showAnalyticsLabels: true,
      selectedAmenities: [],
    }),

  fitBounds: (minLat: number, maxLat: number, minLon: number, maxLon: number) =>
    set({
      viewport: {
        ...defaultViewport,
        latitude: (minLat + maxLat) / 2,
        longitude: (minLon + maxLon) / 2,
        zoom: Math.floor(Math.log2(360 / Math.max(maxLat - minLat, maxLon - minLon))),
      },
    }),

  // Mobile-specific actions
  setMobileMode: (isMobile: boolean) =>
    set({ isMobile }),

  setBottomSheetState: (open: boolean, height: number = 120) =>
    set({ bottomSheetOpen: open, bottomSheetHeight: height }),

  toggleHapticFeedback: () =>
    set((state) => ({
      hapticFeedback: !state.hapticFeedback,
    })),

  // Advanced Mobile Actions
  setOfflineMode: (enabled: boolean) =>
    set({ offlineMode: enabled }),

  addOfflineTile: (tileId: string) =>
    set((state) => ({
      offlineTiles: new Set([...state.offlineTiles, tileId])
    })),

  removeOfflineTile: (tileId: string) =>
    set((state) => {
      const newTiles = new Set(state.offlineTiles)
      newTiles.delete(tileId)
      return { offlineTiles: newTiles }
    }),

  addOfflineRegion: (region: { id: string; bounds: [[number, number], [number, number]] }) =>
    set((state) => ({
      offlineRegions: [...state.offlineRegions, {
        ...region,
        downloaded: false,
        lastUpdated: Date.now()
      }]
    })),

  updateOfflineRegion: (id: string, downloaded: boolean) =>
    set((state) => ({
      offlineRegions: state.offlineRegions.map(region =>
        region.id === id
          ? { ...region, downloaded, lastUpdated: Date.now() }
          : region
      )
    })),

  clearOfflineData: () =>
    set({
      offlineTiles: new Set(),
      offlineRegions: []
    }),

  setVoiceActive: (active: boolean) =>
    set({ voiceActive: active }),

  setGestureMode: (enabled: boolean) =>
    set({ gestureMode: enabled }),

  addGestureEvent: (gesture: { type: string; data: any }) =>
    set((state) => ({
      gestureHistory: [
        ...state.gestureHistory.slice(-9), // Keep last 10 gestures
        { ...gesture, timestamp: Date.now() }
      ]
    })),

  clearGestureHistory: () =>
    set({ gestureHistory: [] }),

  setARMode: (enabled: boolean, property?: Property) =>
    set({
      arMode: enabled,
      arProperty: property || null
    }),

  updateARMeasurements: (measurements: { width: number; height: number; area: number }) =>
    set({ arMeasurements: measurements }),

  setBiometricEnabled: (enabled: boolean) =>
    set({ biometricEnabled: enabled }),

  addBiometricCredential: (credential: any) =>
    set((state) => ({
      biometricCredentials: [...state.biometricCredentials, credential]
    })),

  clearBiometricCredentials: () =>
    set({ biometricCredentials: [] }),

  setGeofencingEnabled: (enabled: boolean) =>
    set({ geofencingEnabled: enabled }),

  addActiveGeofence: (geofenceId: string) =>
    set((state) => ({
      activeGeofences: new Set([...state.activeGeofences, geofenceId])
    })),

  removeActiveGeofence: (geofenceId: string) =>
    set((state) => {
      const newGeofences = new Set(state.activeGeofences)
      newGeofences.delete(geofenceId)
      return { activeGeofences: newGeofences }
    }),

  addSmartNotification: (notification: { type: string; message: string; data: any }) =>
    set((state) => ({
      smartNotifications: [
        ...state.smartNotifications.slice(-19), // Keep last 20 notifications
        { ...notification, id: Date.now().toString(), timestamp: Date.now() }
      ]
    })),

  clearSmartNotifications: () =>
    set({ smartNotifications: [] }),

  setPWAInstalled: (installed: boolean) =>
    set({ pwaInstalled: installed }),

  setBackgroundSync: (enabled: boolean) =>
    set({ backgroundSyncEnabled: enabled }),

  setPushNotifications: (enabled: boolean) =>
    set({ pushNotificationsEnabled: enabled }),

  updateLocation: (location: { latitude: number; longitude: number }) =>
    set({ lastLocation: location }),

  setLocationTracking: (enabled: boolean) =>
    set({ locationTracking: enabled }),

  cacheMapData: (key: string, data: any) =>
    set((state) => {
      const newCache = new Map(state.mapCache)
      newCache.set(key, { data, timestamp: Date.now() })
      return { mapCache: newCache }
    }),

  getCachedMapData: (key: string) => {
    const state = get()
    return state.mapCache.get(key)?.data
  },

  clearMapCache: () =>
    set({ mapCache: new Map() }),

  // Voice Command Actions
  executeVoiceCommand: (command: {
    action: string
    query?: string
    location?: { lat: number; lng: number }
    level?: number
    propertyId?: string
  }) => {
    const { action, query, location, level, propertyId } = command

    switch (action) {
      case 'search':
        if (query) {
          // This would integrate with search store
          console.log('Voice search:', query)
        }
        break

      case 'navigate':
        if (location) {
          get().setViewport({
            latitude: location.lat,
            longitude: location.lng,
            zoom: 16
          })
        }
        break

      case 'zoom':
        if (level) {
          get().setViewport({ zoom: level })
        }
        break

      case 'show_property':
        if (propertyId) {
          // This would highlight a specific property
          console.log('Show property:', propertyId)
        }
        break

      default:
        console.log('Unknown voice command:', action)
    }
  },

  // Gesture Actions
  handleGesture: (gesture: {
    type: 'pinch' | 'rotate' | 'pan' | 'swipe' | 'tap' | 'double-tap' | 'long-press'
    scale?: number
    rotation?: number
    deltaX?: number
    deltaY?: number
    velocityX?: number
    velocityY?: number
    direction?: 'up' | 'down' | 'left' | 'right'
    fingers?: number
  }) => {
    const currentViewport = get().viewport

    switch (gesture.type) {
      case 'pinch':
        if (gesture.scale) {
          const newZoom = Math.max(1, Math.min(20, currentViewport.zoom * gesture.scale))
          get().setViewport({ zoom: newZoom })
        }
        break

      case 'pan':
        if (gesture.deltaX !== undefined && gesture.deltaY !== undefined) {
          // Convert pixel deltas to coordinate deltas (simplified)
          const zoom = currentViewport.zoom
          const deltaLat = gesture.deltaY / (256 * Math.pow(2, zoom)) * 360
          const deltaLng = gesture.deltaX / (256 * Math.pow(2, zoom)) * 360

          get().setViewport({
            latitude: currentViewport.latitude + deltaLat,
            longitude: currentViewport.longitude + deltaLng
          })
        }
        break

      case 'swipe':
        if (gesture.direction && gesture.velocityX !== undefined && gesture.velocityY !== undefined) {
          // Handle swipe navigation
          const velocity = Math.sqrt(gesture.velocityX ** 2 + gesture.velocityY ** 2)
          if (velocity > 0.5) { // Threshold for significant swipe
            console.log('Swipe navigation:', gesture.direction)
          }
        }
        break

      case 'double-tap':
        // Zoom in on double tap
        get().setViewport({ zoom: Math.min(20, currentViewport.zoom + 1) })
        break

      case 'long-press':
        // Enable gesture mode for advanced interactions
        get().setGestureMode(true)
        break

      default:
        // Log other gestures for debugging
        get().addGestureEvent(gesture)
    }
  },
}))
