'use client'

import { useState, useEffect, useCallback } from 'react'
import { Property } from '@/types'
import { useMapStore } from '@/stores/mapStore'
import { useSearchStore } from '@/stores/searchStore'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

// Import advanced mobile components
import OfflineMapManager from './OfflineMapManager'
import PWAManager from './PWAManager'
import VoiceAssistant from './VoiceAssistant'
import ARPropertyViewer from './ARPropertyViewer'
import BiometricAuth from './BiometricAuth'
import AdvancedGestures from './AdvancedGestures'
import SmartNotifications from './SmartNotifications'

interface AdvancedMobileInterfaceProps {
  children: React.ReactNode
  userLocation?: { latitude: number; longitude: number }
  savedProperties: Property[]
  onPropertySelect?: (property: Property) => void
}

interface MobileState {
  isOfflineMode: boolean
  isVoiceActive: boolean
  isARActive: boolean
  selectedProperty: Property | null
  gestureMode: boolean
  biometricEnabled: boolean
}

const AdvancedMobileInterface: React.FC<AdvancedMobileInterfaceProps> = ({
  children,
  userLocation,
  savedProperties,
  onPropertySelect
}) => {
  const [mobileState, setMobileState] = useState<MobileState>({
    isOfflineMode: false,
    isVoiceActive: false,
    isARActive: false,
    selectedProperty: null,
    gestureMode: false,
    biometricEnabled: false
  })

  const mapStore = useMapStore()
  const searchStore = useSearchStore()

  // Handle offline mode toggle
  const toggleOfflineMode = useCallback(() => {
    setMobileState(prev => ({ ...prev, isOfflineMode: !prev.isOfflineMode }))
    triggerHapticFeedback('light')
  }, [])

  // Handle voice assistant toggle
  const toggleVoiceAssistant = useCallback(() => {
    setMobileState(prev => ({ ...prev, isVoiceActive: !prev.isVoiceActive }))
    triggerHapticFeedback('light')
  }, [])

  // Handle AR viewer
  const openARViewer = useCallback((property: Property) => {
    setMobileState(prev => ({
      ...prev,
      selectedProperty: property,
      isARActive: true
    }))
    triggerHapticFeedback('medium')
  }, [])

  const closeARViewer = useCallback(() => {
    setMobileState(prev => ({
      ...prev,
      isARActive: false,
      selectedProperty: null
    }))
  }, [])

  // Handle gesture events
  const handleGesture = useCallback((gesture: any) => {
    switch (gesture.type) {
      case 'pinch':
        // Handle zoom gestures
        if (gesture.scale > 1) {
          mapStore.setZoom(mapStore.zoom + 0.5)
        } else {
          mapStore.setZoom(mapStore.zoom - 0.5)
        }
        break

      case 'pan':
        // Handle pan gestures for map movement
        if (Math.abs(gesture.deltaX) > 50 || Math.abs(gesture.deltaY) > 50) {
          // Convert screen coordinates to map coordinates
          // This would need actual map coordinate conversion
          console.log('Pan gesture:', gesture)
        }
        break

      case 'swipe':
        // Handle swipe gestures
        if (gesture.direction === 'left' || gesture.direction === 'right') {
          // Navigate between properties or views
          console.log('Swipe gesture:', gesture.direction)
        }
        break

      case 'double-tap':
        // Handle double tap for zoom in
        mapStore.setZoom(mapStore.zoom + 1)
        triggerHapticFeedback('light')
        break

      case 'long-press':
        // Handle long press for context menu
        setMobileState(prev => ({ ...prev, gestureMode: true }))
        triggerHapticFeedback('medium')
        break
    }
  }, [mapStore])

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: any) => {
    switch (command.action) {
      case 'search':
        searchStore.setQuery(command.query)
        searchStore.search()
        break

      case 'navigate':
        if (command.location) {
          mapStore.setCenter([command.location.lng, command.location.lat])
        }
        break

      case 'zoom':
        if (command.level) {
          mapStore.setZoom(command.level)
        }
        break

      case 'show_property':
        if (command.propertyId) {
          const property = savedProperties.find(p => p.id === command.propertyId)
          if (property) {
            onPropertySelect?.(property)
          }
        }
        break

      case 'ar_view':
        if (command.propertyId) {
          const property = savedProperties.find(p => p.id === command.propertyId)
          if (property) {
            openARViewer(property)
          }
        }
        break
    }
  }, [searchStore, mapStore, savedProperties, onPropertySelect, openARViewer])

  // Handle biometric authentication
  const handleBiometricSuccess = useCallback((credential: any) => {
    setMobileState(prev => ({ ...prev, biometricEnabled: true }))
    console.log('Biometric authentication successful:', credential)
  }, [])

  const handleBiometricError = useCallback((error: string) => {
    console.error('Biometric authentication failed:', error)
  }, [])

  // Handle notifications
  const handleNotification = useCallback((notification: any) => {
    // Handle different types of notifications
    console.log('Smart notification:', notification)

    // Could show in-app notification, update UI, etc.
  }, [])

  // Only render advanced features on mobile devices
  if (!isMobileDevice()) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full h-full">
      {/* Advanced Mobile Components */}
      <OfflineMapManager
        isEnabled={mobileState.isOfflineMode}
        userLocation={userLocation}
      />

      <PWAManager />

      <SmartNotifications
        userLocation={userLocation}
        savedProperties={savedProperties}
        onNotification={handleNotification}
      />

      {/* Voice Assistant */}
      {mobileState.isVoiceActive && (
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          onClose={() => setMobileState(prev => ({ ...prev, isVoiceActive: false }))}
        />
      )}

      {/* AR Property Viewer */}
      {mobileState.isARActive && mobileState.selectedProperty && (
        <ARPropertyViewer
          property={mobileState.selectedProperty}
          onClose={closeARViewer}
        />
      )}

      {/* Biometric Authentication Modal */}
      {!mobileState.biometricEnabled && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <BiometricAuth
            mode="register"
            onSuccess={handleBiometricSuccess}
            onError={handleBiometricError}
          />
        </div>
      )}

      {/* Gesture-enabled wrapper */}
      <AdvancedGestures
        onGesture={handleGesture}
        enablePinch={true}
        enableRotate={false}
        enablePan={true}
        enableSwipe={true}
        enableMultiTouch={true}
      >
        {children}
      </AdvancedGestures>

      {/* Mobile Control Panel */}
      <div className="fixed bottom-4 left-4 right-4 z-30">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 flex justify-around items-center">
          {/* Offline Mode Toggle */}
          <button
            onClick={toggleOfflineMode}
            className={`p-2 rounded-full transition-colors ${
              mobileState.isOfflineMode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            📱
          </button>

          {/* Voice Assistant Toggle */}
          <button
            onClick={toggleVoiceAssistant}
            className={`p-2 rounded-full transition-colors ${
              mobileState.isVoiceActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            🎤
          </button>

          {/* AR Toggle (when property selected) */}
          {mobileState.selectedProperty && (
            <button
              onClick={() => openARViewer(mobileState.selectedProperty!)}
              className="p-2 rounded-full bg-purple-500 text-white transition-colors"
            >
              📹
            </button>
          )}

          {/* Gesture Mode Indicator */}
          {mobileState.gestureMode && (
            <button
              onClick={() => setMobileState(prev => ({ ...prev, gestureMode: false }))}
              className="p-2 rounded-full bg-orange-500 text-white transition-colors"
            >
              👆
            </button>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="fixed top-4 right-4 z-30 space-y-2">
        {mobileState.isOfflineMode && (
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Offline Mode
          </div>
        )}

        {mobileState.biometricEnabled && (
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            🔐 Biometric
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedMobileInterface