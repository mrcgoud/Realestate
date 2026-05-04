'use client'

import { useEffect, useState } from 'react'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

// Import all advanced mobile components
import AdvancedMobileInterface from './mobile/AdvancedMobileInterface'
import OfflineMapManager from './mobile/OfflineMapManager'
import PWAManager from './mobile/PWAManager'
import VoiceAssistant from './mobile/VoiceAssistant'
import ARPropertyViewer from './mobile/ARPropertyViewer'
import BiometricAuth from './mobile/BiometricAuth'
import AdvancedGestures from './mobile/AdvancedGestures'
import SmartNotifications from './mobile/SmartNotifications'

interface EnhancedMobileAppProps {
  children: React.ReactNode
  user?: {
    id: string
    name: string
    email: string
  }
  savedProperties?: any[]
  onPropertySelect?: (property: any) => void
  onSearch?: (query: string) => void
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void
}

const EnhancedMobileApp: React.FC<EnhancedMobileAppProps> = ({
  children,
  user,
  savedProperties = [],
  onPropertySelect,
  onSearch,
  onLocationUpdate
}) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  const mapStore = useMapStore()
  const searchStore = useSearchStore()

  // Initialize mobile features
  useEffect(() => {
    const initializeMobileFeatures = async () => {
      // Detect mobile device
      const isMobile = isMobileDevice()
      mapStore.setMobileMode(isMobile)

      if (isMobile) {
        // Request location permissions
        if ('geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
              })
            })

            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }

            setUserLocation(location)
            mapStore.updateLocation(location)
            searchStore.updateUserLocation(location)
            onLocationUpdate?.(location)

          } catch (error) {
            console.warn('Location access denied or unavailable:', error)
          }
        }

        // Enable haptic feedback
        mapStore.toggleHapticFeedback()

        // Initialize PWA features
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            console.log('Service Worker registered:', registration)
            mapStore.setBackgroundSync(true)
          } catch (error) {
            console.warn('Service Worker registration failed:', error)
          }
        }

        // Check for PWA installation
        if (window.matchMedia('(display-mode: standalone)').matches) {
          mapStore.setPWAInstalled(true)
        }

        // Initialize push notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          mapStore.setPushNotifications(true)
        }
      }

      setIsInitialized(true)
    }

    initializeMobileFeatures()
  }, [mapStore, searchStore, onLocationUpdate])

  // Handle voice commands
  const handleVoiceCommand = (command: any) => {
    console.log('Voice command received:', command)

    switch (command.action) {
      case 'search':
        searchStore.setQuery(command.query || '')
        searchStore.search()
        onSearch?.(command.query || '')
        break

      case 'navigate':
        if (command.location) {
          mapStore.setViewport({
            latitude: command.location.lat,
            longitude: command.location.lng,
            zoom: 16
          })
        }
        break

      case 'zoom':
        if (command.level) {
          mapStore.setViewport({ zoom: command.level })
        }
        break

      case 'show_property':
        if (command.propertyId && savedProperties) {
          const property = savedProperties.find(p => p.id === command.propertyId)
          if (property) {
            onPropertySelect?.(property)
          }
        }
        break

      case 'offline_mode':
        mapStore.setOfflineMode(!mapStore.offlineMode)
        break

      case 'ar_view':
        if (command.propertyId && savedProperties) {
          const property = savedProperties.find(p => p.id === command.propertyId)
          if (property) {
            mapStore.setARMode(true, property)
          }
        }
        break

      default:
        console.log('Unknown voice command:', command.action)
    }

    triggerHapticFeedback('light')
  }

  // Handle gesture events
  const handleGesture = (gesture: any) => {
    mapStore.handleGesture(gesture)
    mapStore.addGestureEvent(gesture)
  }

  // Handle smart notifications
  const handleNotification = (notification: any) => {
    console.log('Smart notification:', notification)

    // Add to notification history
    mapStore.addSmartNotification(notification)

    // Handle specific notification types
    switch (notification.type) {
      case 'geofence-enter':
        if (notification.data?.propertyId) {
          // Highlight property on map
          console.log('Geofence entered for property:', notification.data.propertyId)
        }
        break

      case 'price-alert':
        // Show price change notification
        console.log('Price alert:', notification)
        break

      case 'new-listing':
        // Show new listing notification
        console.log('New listing:', notification)
        break
    }
  }

  // Handle biometric authentication
  const handleBiometricSuccess = (credential: any) => {
    mapStore.setBiometricEnabled(true)
    mapStore.addBiometricCredential(credential)
    console.log('Biometric authentication successful')
  }

  const handleBiometricError = (error: string) => {
    console.error('Biometric authentication failed:', error)
  }

  // Only render enhanced features on mobile devices
  if (!isMobileDevice() || !isInitialized) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full h-full">
      {/* Core Mobile Components */}
      <OfflineMapManager
        isEnabled={mapStore.offlineMode}
        userLocation={userLocation || undefined}
      />

      <PWAManager />

      <SmartNotifications
        userLocation={userLocation || undefined}
        savedProperties={savedProperties}
        onNotification={handleNotification}
      />

      {/* Voice Assistant */}
      {mapStore.voiceActive && (
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          onClose={() => mapStore.setVoiceActive(false)}
        />
      )}

      {/* AR Property Viewer */}
      {mapStore.arMode && mapStore.arProperty && (
        <ARPropertyViewer
          property={mapStore.arProperty}
          onClose={() => mapStore.setARMode(false)}
        />
      )}

      {/* Biometric Authentication */}
      {!mapStore.biometricEnabled && user && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <BiometricAuth
            mode="register"
            userId={user.id}
            onSuccess={handleBiometricSuccess}
            onError={handleBiometricError}
          />
        </div>
      )}

      {/* Advanced Gesture Support */}
      <AdvancedGestures
        onGesture={handleGesture}
        enablePinch={true}
        enableRotate={true}
        enablePan={true}
        enableSwipe={true}
        enableMultiTouch={true}
      >
        {children}
      </AdvancedGestures>

      {/* Mobile Control Panel */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 flex justify-around items-center border border-gray-200">
          {/* Offline Mode Toggle */}
          <button
            onClick={() => {
              mapStore.setOfflineMode(!mapStore.offlineMode)
              triggerHapticFeedback('light')
            }}
            className={`p-3 rounded-full transition-all duration-200 ${
              mapStore.offlineMode
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📱
          </button>

          {/* Voice Assistant Toggle */}
          <button
            onClick={() => {
              mapStore.setVoiceActive(!mapStore.voiceActive)
              triggerHapticFeedback('light')
            }}
            className={`p-3 rounded-full transition-all duration-200 ${
              mapStore.voiceActive
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎤
          </button>

          {/* AR Toggle */}
          <button
            onClick={() => {
              if (mapStore.arProperty) {
                mapStore.setARMode(!mapStore.arMode)
              } else {
                // Show property selection for AR
                console.log('Select a property for AR view')
              }
              triggerHapticFeedback('light')
            }}
            className={`p-3 rounded-full transition-all duration-200 ${
              mapStore.arMode
                ? 'bg-purple-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            📹
          </button>

          {/* Gesture Mode Toggle */}
          <button
            onClick={() => {
              mapStore.setGestureMode(!mapStore.gestureMode)
              triggerHapticFeedback('light')
            }}
            className={`p-3 rounded-full transition-all duration-200 ${
              mapStore.gestureMode
                ? 'bg-orange-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            👆
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="fixed top-4 right-4 z-30 space-y-2">
        {/* Offline Mode Indicator */}
        {mapStore.offlineMode && (
          <div className="bg-orange-500 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg animate-pulse">
            📱 Offline Mode
          </div>
        )}

        {/* Voice Active Indicator */}
        {mapStore.voiceActive && (
          <div className="bg-green-500 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg animate-pulse">
            🎤 Listening...
          </div>
        )}

        {/* AR Active Indicator */}
        {mapStore.arMode && (
          <div className="bg-purple-500 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg">
            📹 AR Active
          </div>
        )}

        {/* Biometric Enabled Indicator */}
        {mapStore.biometricEnabled && (
          <div className="bg-blue-500 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg">
            🔐 Biometric
          </div>
        )}

        {/* PWA Installed Indicator */}
        {mapStore.pwaInstalled && (
          <div className="bg-indigo-500 text-white px-3 py-2 rounded-full text-xs font-medium shadow-lg">
            📲 PWA
          </div>
        )}
      </div>

      {/* Performance & Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-30 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs">
          <div>Mobile: {mapStore.isMobile ? '✅' : '❌'}</div>
          <div>Offline: {mapStore.offlineMode ? '✅' : '❌'}</div>
          <div>Voice: {mapStore.voiceActive ? '✅' : '❌'}</div>
          <div>AR: {mapStore.arMode ? '✅' : '❌'}</div>
          <div>Gestures: {mapStore.gestureMode ? '✅' : '❌'}</div>
          <div>Biometric: {mapStore.biometricEnabled ? '✅' : '❌'}</div>
          <div>PWA: {mapStore.pwaInstalled ? '✅' : '❌'}</div>
          {userLocation && (
            <div>Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedMobileApp