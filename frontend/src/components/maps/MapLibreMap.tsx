'use client'

import { useEffect, useRef, useState } from 'react'
import { useMapStore } from '@/store/mapStore'

interface MapLibreMapProps {
  properties?: any[]
  center?: [number, number]
  zoom?: number
  onPropertyClick?: (propertyId: string) => void
}

/**
 * MapLibre GL JS Integration Component
 * 
 * Note: This is a placeholder implementation. Full integration requires:
 * 1. npm install maplibre-gl @react-map-gl/maplibre
 * 2. Mapbox/MapLibre style URL configured
 * 3. GeoJSON data from API for property markers
 * 
 * This component will be enhanced to include:
 * - Property markers with custom styling
 * - Heatmap layer (price, demand, density)
 * - Isochrone visualization (commute times)
 * - Transit station overlay
 * - Search results filtering
 * - Layer toggle controls
 */
export function MapLibreMap({
  properties = [],
  center = [-74.006, 40.7128], // NYC default
  zoom = 12,
  onPropertyClick,
}: MapLibreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const { viewport, setViewport, visibleLayers, heatmapType } = useMapStore()

  useEffect(() => {
    // MapLibre GL initialization would go here
    // This is currently a placeholder with a mock map interface
    setMapLoaded(true)

    return () => {
      // Cleanup would go here
    }
  }, [])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-96 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 rounded-lg overflow-hidden relative border border-gray-200"
    >
      {/* Map Container - MapLibre GL would render here */}
      <MapMockOverlay
        properties={properties}
        center={center}
        zoom={zoom}
      />

      {/* Map Controls */}
      <MapControls
        mapContainer={mapContainer}
        onZoomIn={() => setViewport({ ...viewport, zoom: (viewport.zoom || zoom) + 1 })}
        onZoomOut={() => setViewport({ ...viewport, zoom: (viewport.zoom || zoom) - 1 })}
      />

      {/* Layer Toggle */}
      <LayerToggle />

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function MapMockOverlay({
  properties,
  center,
  zoom,
}: {
  properties: any[]
  center: [number, number]
  zoom: number
}) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
      {/* Map Title */}
      <div className="absolute top-6 left-6 bg-white rounded-lg shadow p-3 z-10">
        <h3 className="font-semibold text-gray-900 text-sm">Map View</h3>
        <p className="text-xs text-gray-600 mt-1">
          Location: {center[1].toFixed(4)}, {center[0].toFixed(4)}
        </p>
        <p className="text-xs text-gray-600">Zoom: {zoom}</p>
      </div>

      {/* Center Marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-8 h-8 bg-primary-600 rounded-full shadow-lg border-4 border-white"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
      </div>

      {/* Property Markers Info */}
      {properties.length > 0 && (
        <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow p-4 max-w-xs z-10">
          <p className="font-semibold text-gray-900 text-sm mb-2">
            {properties.length} properties on map
          </p>
          <p className="text-xs text-gray-600">
            Property markers would display here
          </p>
        </div>
      )}

      {/* Map Instructions */}
      <div className="text-center">
        <div className="text-4xl mb-3">🗺️</div>
        <p className="text-gray-600 font-semibold">MapLibre GL Integration</p>
        <p className="text-sm text-gray-500 mt-1">
          Full interactive map coming soon
        </p>
      </div>
    </div>
  )
}

function MapControls({
  mapContainer,
  onZoomIn,
  onZoomOut,
}: {
  mapContainer: React.RefObject<HTMLDivElement>
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
      <button
        onClick={onZoomIn}
        className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-700 font-bold hover:bg-gray-50 transition-colors"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-700 font-bold hover:bg-gray-50 transition-colors"
        title="Zoom out"
      >
        −
      </button>
    </div>
  )
}

function LayerToggle() {
  const { visibleLayers, toggleLayer } = useMapStore()

  const layers = [
    { id: 'heatmap', label: 'Heatmap', icon: '🔥' },
    { id: 'isochrone', label: 'Isochrone', icon: '⏱️' },
    { id: 'transit', label: 'Transit', icon: '🚌' },
    { id: 'amenities', label: 'Amenities', icon: '🏪' },
  ]

  return (
    <div className="absolute top-6 right-6 bg-white rounded-lg shadow p-3 z-10 max-w-xs">
      <p className="font-semibold text-gray-900 text-sm mb-2">Layers</p>
      <div className="space-y-2">
        {layers.map((layer) => (
          <label key={layer.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleLayers[layer.id] || false}
              onChange={() => toggleLayer(layer.id)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-xs text-gray-700">
              {layer.icon} {layer.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default MapLibreMap
