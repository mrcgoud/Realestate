'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapInstance {
  map: maplibregl.Map | null
  isLoaded: boolean
}

interface MapContextType {
  map: maplibregl.Map | null
  isLoaded: boolean
  addMarker: (lngLat: [number, number], popup?: string) => void
  addLayer: (layer: maplibregl.AnyLayer, beforeId?: string) => void
  removeLayer: (id: string) => void
  addSource: (id: string, source: maplibregl.SourceSpecification) => void
  removeSource: (id: string) => void
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export function useMapLibre() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('useMapLibre must be used within MapLibreProvider')
  }
  return context
}

interface MapLibreProviderProps {
  children: ReactNode
  center?: [number, number]
  zoom?: number
  style?: string
}

/**
 * MapLibre GL Provider - Context for map management
 * Provides centralized access to map instance across components
 */
export function MapLibreProvider({
  children,
  center = [-74.006, 40.7128], // NYC default
  zoom = 12,
  style = 'https://tiles.openstreetmap.de/styles/osm-bright/style.json',
}: MapLibreProviderProps) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const isLoadedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize map
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: style,
      center: center,
      zoom: zoom,
      antialias: true,
    })

    // Add navigation control
    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Set up event listeners
    map.on('load', () => {
      isLoadedRef.current = true
    })

    map.on('error', (e) => {
      console.error('MapLibre GL error:', e)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      isLoadedRef.current = false
    }
  }, [center, zoom, style])

  const contextValue: MapContextType = {
    map: mapRef.current,
    isLoaded: isLoadedRef.current,
    addMarker: (lngLat: [number, number], popup?: string) => {
      if (!mapRef.current) return

      const marker = new maplibregl.Marker()
        .setLngLat(lngLat)
        .addTo(mapRef.current)

      if (popup) {
        marker.setPopup(new maplibregl.Popup().setText(popup))
      }
    },
    addLayer: (layer: maplibregl.AnyLayer, beforeId?: string) => {
      if (!mapRef.current) return
      mapRef.current.addLayer(layer, beforeId)
    },
    removeLayer: (id: string) => {
      if (!mapRef.current) return
      try {
        mapRef.current.removeLayer(id)
      } catch (e) {
        console.warn(`Layer ${id} not found`)
      }
    },
    addSource: (id: string, source: maplibregl.SourceSpecification) => {
      if (!mapRef.current) return
      try {
        mapRef.current.addSource(id, source)
      } catch (e) {
        console.warn(`Source ${id} already exists`)
      }
    },
    removeSource: (id: string) => {
      if (!mapRef.current) return
      try {
        mapRef.current.removeSource(id)
      } catch (e) {
        console.warn(`Source ${id} not found`)
      }
    },
  }

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '600px' }} />
      {children}
    </MapContext.Provider>
  )
}
