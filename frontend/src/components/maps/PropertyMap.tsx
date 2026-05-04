'use client'

import { useEffect } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useSearchStore } from '@/store/searchStore'
import { MapPin } from 'lucide-react'

export function PropertyMap() {
  const { results, search } = useSearchStore()
  const { viewport, setViewport } = useMapStore()

  useEffect(() => {
    search()
  }, [])

  // Placeholder for MapLibre GL integration
  return (
    <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
      {/* MapLibre GL will be rendered here */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center">
          <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Map View</h2>
          <p className="text-gray-600 max-w-md">
            MapLibre GL JS integration will display {results.length} properties here
          </p>
          <div className="mt-6 px-6 py-3 bg-white rounded-lg shadow text-sm text-gray-700 max-w-sm">
            <p className="font-semibold mb-2">Viewport: </p>
            <p>Lat: {viewport.latitude.toFixed(4)}</p>
            <p>Lon: {viewport.longitude.toFixed(4)}</p>
            <p>Zoom: {viewport.zoom}</p>
          </div>
        </div>
      </div>

      {/* Property Count Badge */}
      {results.length > 0 && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow">
          <p className="text-sm font-semibold text-gray-900">{results.length} properties</p>
        </div>
      )}

      {/* Map Controls Placeholder */}
      <div className="absolute bottom-6 left-6 space-y-2">
        <button className="w-10 h-10 bg-white rounded shadow hover:shadow-md transition-shadow flex items-center justify-center text-gray-700 font-semibold">
          +
        </button>
        <button className="w-10 h-10 bg-white rounded shadow hover:shadow-md transition-shadow flex items-center justify-center text-gray-700 font-semibold">
          −
        </button>
      </div>
    </div>
  )
}
