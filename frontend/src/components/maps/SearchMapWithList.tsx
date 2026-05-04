'use client'

import { Suspense, useState } from 'react'
import { MapLibreProvider } from '@/components/maps/MapLibreProvider'
import MapLibreMap from '@/components/maps/MapLibreMapFull'
import MapControls from '@/components/maps/MapControls'
import MobileMapInterface from '@/components/mobile/MobileMapInterface'
import { useSearchStore } from '@/store/searchStore'
import { useMapStore } from '@/store/mapStore'
import { Property } from '@/types'
import Link from 'next/link'

/**
 * Complete Search Map Component
 * Integrates MapLibre with search results and layer controls
 */
export function SearchMapView() {
  const { results } = useSearchStore()
  const { viewport } = useMapStore()
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  if (!results.length) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <p className="text-gray-600">No properties to display on map</p>
        </div>
      </div>
    )
  }

  return (
    <MapLibreProvider
      center={[viewport.longitude, viewport.latitude]}
      zoom={viewport.zoom}
    >
      <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
        {/* Map Container */}
        <div className="w-full h-full">
          <MapLibreMap
            properties={results}
            onPropertyClick={setSelectedProperty}
            showHeatmap={true}
            showIsochrone={true}
            showTransit={true}
            showAmenities={true}
          />
        </div>

        {/* Controls Overlay */}
        <MapControls />
        <MobileMapInterface />

        {/* Selected Property Info Card */}
        {selectedProperty && (
          <SelectedPropertyCard
            properties={results}
            propertyId={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </div>
    </MapLibreProvider>
  )
}

/**
 * Display info for selected property on map
 */
function SelectedPropertyCard({
  properties,
  propertyId,
  onClose,
}: {
  properties: Property[]
  propertyId: string
  onClose: () => void
}) {
  const property = properties.find((p) => p.id === propertyId)

  if (!property) return null

  return (
    <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 max-w-sm z-30 border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{property.title}</h3>
          <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-primary-600">
          ${property.price.toLocaleString()}
        </p>
        <p className="text-xs text-gray-600">
          ${Math.round(property.price / property.area)}/sqft
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900">{property.bedrooms}</p>
          <p className="text-xs text-gray-600">Beds</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{property.bathrooms}</p>
          <p className="text-xs text-gray-600">Baths</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">
            {(property.area / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-gray-600">Sqft</p>
        </div>
      </div>

      <Link
        href={`/property/${property.id}`}
        className="w-full btn btn-primary text-center py-2 rounded transition-colors"
      >
        View Details
      </Link>
    </div>
  )
}

/**
 * Property List with Map Integration
 * Shows properties in a sidebar alongside the map
 */
export function SearchMapWithList({
  showList = true,
}: {
  showList?: boolean
}) {
  const { results, isLoading } = useSearchStore()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Map */}
      <div className="lg:col-span-2">
        <Suspense fallback={<MapLoadingSkeleton />}>
          <SearchMapView />
        </Suspense>
      </div>

      {/* Properties List */}
      {showList && (
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Properties ({results.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse p-3 bg-gray-100 rounded" />
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((property) => (
                <PropertyListItem key={property.id} property={property} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No properties found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function PropertyListItem({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property.id}`}>
      <div className="p-3 border border-gray-200 rounded hover:border-primary-600 hover:bg-primary-50 transition-colors cursor-pointer group">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-primary-600 truncate">
            {property.title}
          </h4>
          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded whitespace-nowrap ml-2">
            {property.bedrooms}bd
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-2 truncate">{property.city}, {property.state}</p>
        <p className="text-sm font-bold text-gray-900">${(property.price / 1000).toFixed(0)}k</p>
      </div>
    </Link>
  )
}

function MapLoadingSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-600 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
}

export default SearchMapWithList
