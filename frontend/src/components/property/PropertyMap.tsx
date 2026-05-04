'use client'

import { useEffect, useRef } from 'react'
import { Property } from '@/types'
import { MapPin } from 'lucide-react'

interface PropertyMapProps {
  property: Property
}

export function PropertyMap({ property }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Mock map implementation - in production, integrate MapLibre GL JS
    // This would be the integration point for full map functionality
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Location</h2>

      <div
        ref={mapContainer}
        className="w-full h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-gray-200 relative"
      >
        {/* Map placeholder - will be replaced with MapLibre GL JS */}
        <div className="text-center">
          <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 font-semibold">
            {property.city}, {property.state}
          </p>
          <p className="text-sm text-gray-500">
            {property.latitude?.toFixed(4)}, {property.longitude?.toFixed(4)}
          </p>
        </div>

        {/* Map controls placeholder */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-700 font-bold">
            +
          </button>
          <button className="w-10 h-10 bg-white border border-gray-300 rounded shadow hover:shadow-md flex items-center justify-center text-gray-700 font-bold">
            −
          </button>
        </div>
      </div>

      {/* Location Info */}
      <div className="grid grid-cols-2 gap-4">
        <LocationInfo label="Latitude" value={property.latitude?.toFixed(6) || 'N/A'} />
        <LocationInfo label="Longitude" value={property.longitude?.toFixed(6) || 'N/A'} />
      </div>

      {/* Nearby Info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Nearby Points of Interest</h3>
        <div className="space-y-2 text-sm">
          <NearbyItem icon="🚌" label="Public Transit" value="0.2 miles" />
          <NearbyItem icon="🏫" label="Nearest School" value="0.5 miles" />
          <NearbyItem icon="🏪" label="Shopping Center" value="0.3 miles" />
          <NearbyItem icon="🏥" label="Hospital" value="1.2 miles" />
          <NearbyItem icon="🍽️" label="Restaurants" value="0.4 miles" />
        </div>
      </div>

      {/* Walkability & Scores */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard label="Walk Score" score={72} color="green" />
        <ScoreCard label="Transit Score" score={65} color="blue" />
        <ScoreCard label="Bike Score" score={58} color="orange" />
      </div>
    </div>
  )
}

function LocationInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-mono text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function NearbyItem({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="text-gray-600 font-semibold">{value}</span>
    </div>
  )
}

function ScoreCard({
  label,
  score,
  color,
}: {
  label: string
  score: number
  color: 'green' | 'blue' | 'orange'
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-800 border-green-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
  }

  return (
    <div className={`border-2 rounded-lg p-4 text-center ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-xs font-semibold">{label}</div>
    </div>
  )
}
