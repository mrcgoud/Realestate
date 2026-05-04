'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Property } from '@/types'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

interface ARPropertyViewerProps {
  property: Property
  onClose?: () => void
  onScreenshot?: (imageData: string) => void
}

interface ARState {
  isSupported: boolean
  isActive: boolean
  isInitialized: boolean
  error: string | null
}

const ARPropertyViewer: React.FC<ARPropertyViewerProps> = ({
  property,
  onClose,
  onScreenshot
}) => {
  const [arState, setArState] = useState<ARState>({
    isSupported: false,
    isActive: false,
    isInitialized: false,
    error: null
  })

  const [measurements, setMeasurements] = useState({
    width: 0,
    height: 0,
    area: 0
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)

  // Check AR support
  const checkARSupport = useCallback(async () => {
    if (!isMobileDevice()) {
      setArState(prev => ({ ...prev, error: 'AR requires a mobile device' }))
      return
    }

    if (!('xr' in navigator)) {
      setArState(prev => ({ ...prev, error: 'WebXR not supported' }))
      return
    }

    try {
      const supported = await (navigator as any).xr.isSessionSupported('immersive-ar')
      setArState(prev => ({
        ...prev,
        isSupported: supported,
        error: supported ? null : 'AR not supported on this device'
      }))
    } catch (error) {
      setArState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Failed to check AR support'
      }))
    }
  }, [])

  // Initialize AR session
  const initializeAR = useCallback(async () => {
    if (!arState.isSupported) return

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test', 'dom-overlay'],
        domOverlay: { root: document.body }
      })

      // Set up rendering
      const canvas = canvasRef.current
      if (!canvas) return

      const gl = canvas.getContext('webgl', { xrCompatible: true })
      if (!gl) {
        throw new Error('WebGL not supported')
      }

      // Create Three.js scene (would need three.js dependency)
      // This is a simplified version - in production you'd use Three.js or Babylon.js

      session.addEventListener('end', () => {
        setArState(prev => ({ ...prev, isActive: false }))
      })

      setArState(prev => ({
        ...prev,
        isActive: true,
        isInitialized: true
      }))

      triggerHapticFeedback('medium')

    } catch (error) {
      console.error('Failed to initialize AR:', error)
      setArState(prev => ({
        ...prev,
        error: 'Failed to start AR session'
      }))
    }
  }, [arState.isSupported])

  // Start AR session
  const startAR = useCallback(async () => {
    await initializeAR()
  }, [initializeAR])

  // Stop AR session
  const stopAR = useCallback(() => {
    setArState(prev => ({ ...prev, isActive: false }))
    onClose?.()
  }, [onClose])

  // Take screenshot
  const takeScreenshot = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const imageData = canvas.toDataURL('image/png')
      onScreenshot?.(imageData)
      triggerHapticFeedback('success')
    } catch (error) {
      console.error('Failed to take screenshot:', error)
    }
  }, [onScreenshot])

  // Add measurement point
  const addMeasurementPoint = useCallback((x: number, y: number) => {
    // In a real implementation, this would add points to the AR scene
    // and calculate distances/areas
    console.log('Adding measurement point at:', x, y)
    triggerHapticFeedback('light')
  }, [])

  // Handle canvas click for measurements
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!arState.isActive) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    addMeasurementPoint(x, y)
  }, [arState.isActive, addMeasurementPoint])

  // Load property model (placeholder)
  const loadPropertyModel = useCallback(async () => {
    // In production, this would load a 3D model (GLTF/GLB)
    // For now, we'll create a simple representation
    console.log('Loading 3D model for property:', property.id)

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Set basic measurements
    setMeasurements({
      width: property.area ? Math.sqrt(property.area) * 10 : 100, // Rough estimate
      height: 30, // Standard 3-story building
      area: property.area || 2000
    })
  }, [property])

  // Initialize on mount
  useEffect(() => {
    checkARSupport()
    loadPropertyModel()
  }, [checkARSupport, loadPropertyModel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sceneRef.current) {
        // Cleanup Three.js scene
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* AR Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onClick={handleCanvasClick}
      />

      {/* Camera Feed (fallback for non-AR devices) */}
      {!arState.isActive && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Property Overlay */}
      {arState.isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Property bounding box */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 rounded-lg"
               style={{
                 width: `${measurements.width}px`,
                 height: `${measurements.height}px`
               }}>
            <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
              {property.title}
            </div>
          </div>

          {/* Measurements */}
          <div className="absolute bottom-20 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
            <div>Width: {measurements.width.toFixed(1)} ft</div>
            <div>Height: {measurements.height.toFixed(1)} ft</div>
            <div>Area: {measurements.area.toFixed(0)} sqft</div>
          </div>
        </div>
      )}

      {/* UI Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Close Button */}
        <button
          onClick={stopAR}
          className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
        >
          ✕
        </button>

        {/* Status */}
        <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
          {arState.error ? (
            <span className="text-red-400">{arState.error}</span>
          ) : arState.isActive ? (
            <span className="text-green-400">AR Active</span>
          ) : (
            <span>Tap to start AR</span>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        {/* Measurements Toggle */}
        <button
          className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-colors"
          onClick={() => triggerHapticFeedback('light')}
        >
          📏
        </button>

        {/* Screenshot */}
        <button
          onClick={takeScreenshot}
          className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors"
        >
          📸
        </button>

        {/* Info */}
        <button
          className="bg-purple-500 text-white p-3 rounded-full hover:bg-purple-600 transition-colors"
        >
          ℹ️
        </button>
      </div>

      {/* Start AR Button (if not active) */}
      {!arState.isActive && arState.isSupported && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={startAR}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start AR View
          </button>
        </div>
      )}

      {/* Error Message */}
      {arState.error && !arState.isSupported && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="bg-white p-6 rounded-lg max-w-sm text-center">
            <div className="text-4xl mb-4">😔</div>
            <h3 className="text-lg font-semibold mb-2">AR Not Available</h3>
            <p className="text-gray-600 mb-4">{arState.error}</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ARPropertyViewer