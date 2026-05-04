'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Property } from '@/types'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

interface Geofence {
  id: string
  propertyId: string
  latitude: number
  longitude: number
  radius: number // in meters
  trigger: 'enter' | 'exit' | 'dwell'
  dwellTime?: number // in minutes
  message: string
  enabled: boolean
}

interface NotificationSettings {
  geofencing: boolean
  priceAlerts: boolean
  newListings: boolean
  marketUpdates: boolean
  savedSearches: boolean
  vibration: boolean
  sound: boolean
}

interface SmartNotificationsProps {
  userLocation?: { latitude: number; longitude: number }
  savedProperties: Property[]
  onNotification?: (notification: any) => void
}

interface NotificationState {
  geofences: Geofence[]
  settings: NotificationSettings
  activeGeofences: Set<string>
  lastLocation: { latitude: number; longitude: number } | null
  watchId: number | null
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  userLocation,
  savedProperties,
  onNotification
}) => {
  const [state, setState] = useState<NotificationState>({
    geofences: [],
    settings: {
      geofencing: true,
      priceAlerts: true,
      newListings: true,
      marketUpdates: false,
      savedSearches: true,
      vibration: true,
      sound: true
    },
    activeGeofences: new Set(),
    lastLocation: null,
    watchId: null
  })

  const notificationQueueRef = useRef<any[]>([])
  const geofenceCheckIntervalRef = useRef<NodeJS.Timeout>()

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }, [])

  // Check if user is within geofence
  const isWithinGeofence = useCallback((userLat: number, userLon: number, geofence: Geofence) => {
    const distance = calculateDistance(userLat, userLon, geofence.latitude, geofence.longitude)
    return distance <= geofence.radius
  }, [calculateDistance])

  // Create geofences for saved properties
  const createGeofences = useCallback(() => {
    const geofences: Geofence[] = savedProperties.map(property => ({
      id: `property-${property.id}`,
      propertyId: property.id,
      latitude: property.latitude,
      longitude: property.longitude,
      radius: 500, // 500 meters
      trigger: 'enter',
      message: `You're near ${property.title}! Would you like to schedule a viewing?`,
      enabled: true
    }))

    setState(prev => ({ ...prev, geofences }))
  }, [savedProperties])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false

    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }, [])

  // Show notification
  const showNotification = useCallback(async (title: string, body: string, options?: any) => {
    if (!state.settings.sound && !state.settings.vibration) return

    // Browser notification
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000)
    }

    // Haptic feedback
    if (state.settings.vibration) {
      triggerHapticFeedback('medium')
    }

    // Callback
    onNotification?.({
      title,
      body,
      timestamp: Date.now(),
      ...options
    })
  }, [state.settings, onNotification])

  // Check geofence triggers
  const checkGeofenceTriggers = useCallback(() => {
    if (!userLocation || !state.settings.geofencing) return

    const { latitude, longitude } = userLocation
    const newActiveGeofences = new Set<string>()

    state.geofences.forEach(geofence => {
      if (!geofence.enabled) return

      const isInside = isWithinGeofence(latitude, longitude, geofence)
      const wasInside = state.activeGeofences.has(geofence.id)

      if (isInside && !wasInside && geofence.trigger === 'enter') {
        // Entered geofence
        showNotification(
          'Property Nearby!',
          geofence.message,
          {
            tag: `geofence-${geofence.id}`,
            data: { propertyId: geofence.propertyId, type: 'geofence-enter' }
          }
        )
        newActiveGeofences.add(geofence.id)
      } else if (!isInside && wasInside && geofence.trigger === 'exit') {
        // Exited geofence
        showNotification(
          'Left Property Area',
          `You left the area around ${savedProperties.find(p => p.id === geofence.propertyId)?.title || 'a property'}`,
          {
            tag: `geofence-${geofence.id}`,
            data: { propertyId: geofence.propertyId, type: 'geofence-exit' }
          }
        )
      } else if (isInside) {
        newActiveGeofences.add(geofence.id)
      }
    })

    setState(prev => ({ ...prev, activeGeofences: newActiveGeofences }))
  }, [userLocation, state.settings.geofencing, state.geofences, state.activeGeofences, isWithinGeofence, showNotification, savedProperties])

  // Start location watching
  const startLocationWatching = useCallback(async () => {
    if (!isMobileDevice() || !navigator.geolocation) return

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setState(prev => ({
            ...prev,
            lastLocation: { latitude, longitude }
          }))
        },
        (error) => {
          console.error('Location watch error:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      )

      setState(prev => ({ ...prev, watchId }))
    } catch (error) {
      console.error('Failed to start location watching:', error)
    }
  }, [])

  // Stop location watching
  const stopLocationWatching = useCallback(() => {
    if (state.watchId) {
      navigator.geolocation.clearWatch(state.watchId)
      setState(prev => ({ ...prev, watchId: null }))
    }
  }, [state.watchId])

  // Update notification settings
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }))
  }, [])

  // Send price alert notification
  const sendPriceAlert = useCallback((property: Property, oldPrice: number, newPrice: number) => {
    if (!state.settings.priceAlerts) return

    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100
    const message = `Price ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange).toFixed(1)}%`

    showNotification(
      'Price Change Alert',
      `${property.title}: ${message}`,
      {
        tag: `price-${property.id}`,
        data: { propertyId: property.id, type: 'price-alert', priceChange }
      }
    )
  }, [state.settings.priceAlerts, showNotification])

  // Send new listing notification
  const sendNewListingAlert = useCallback((property: Property) => {
    if (!state.settings.newListings) return

    showNotification(
      'New Property Listed',
      `${property.title} - ${property.price?.toLocaleString() || 'Price TBD'}`,
      {
        tag: `new-listing-${property.id}`,
        data: { propertyId: property.id, type: 'new-listing' }
      }
    )
  }, [state.settings.newListings, showNotification])

  // Initialize
  useEffect(() => {
    createGeofences()
    requestNotificationPermission()

    if (state.settings.geofencing) {
      startLocationWatching()
    }

    return () => {
      stopLocationWatching()
      if (geofenceCheckIntervalRef.current) {
        clearInterval(geofenceCheckIntervalRef.current)
      }
    }
  }, [createGeofences, requestNotificationPermission, state.settings.geofencing, startLocationWatching, stopLocationWatching])

  // Check geofences when location changes
  useEffect(() => {
    if (userLocation) {
      checkGeofenceTriggers()
    }
  }, [userLocation, checkGeofenceTriggers])

  // Periodic geofence checking
  useEffect(() => {
    if (state.settings.geofencing && state.geofences.length > 0) {
      geofenceCheckIntervalRef.current = setInterval(() => {
        if (state.lastLocation) {
          checkGeofenceTriggers()
        }
      }, 30000) // Check every 30 seconds
    }

    return () => {
      if (geofenceCheckIntervalRef.current) {
        clearInterval(geofenceCheckIntervalRef.current)
      }
    }
  }, [state.settings.geofencing, state.geofences.length, state.lastLocation, checkGeofenceTriggers])

  // Expose methods for external use
  useEffect(() => {
    (window as any).smartNotifications = {
      sendPriceAlert,
      sendNewListingAlert,
      updateSettings,
      getActiveGeofences: () => Array.from(state.activeGeofences)
    }
  }, [sendPriceAlert, sendNewListingAlert, updateSettings, state.activeGeofences])

  return null // This component doesn't render anything visible
}

export default SmartNotifications