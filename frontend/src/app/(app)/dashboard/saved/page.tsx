'use client'

import { useEffect } from 'react'
import { usePropertyStore } from '@/store/propertyStore'
import Link from 'next/link'
import { PropertyCard } from '@/components/common/PropertyCard'
import { Heart, ArrowLeft } from 'lucide-react'

export default function SavedPropertiesPage() {
  const { favorites, fetchFavorites } = usePropertyStore()

  useEffect(() => {
    fetchFavorites()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Saved Properties</h1>
        <p className="text-gray-600">
          {favorites.size} {favorites.size === 1 ? 'property' : 'properties'} saved
        </p>
      </div>

      {/* Empty State */}
      {favorites.size === 0 ? (
        <div className="text-center py-12 card bg-gray-50">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved properties yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start exploring properties and save your favorites to compare and track them
          </p>
          <Link
            href="/search"
            className="btn btn-primary px-6 py-2 inline-block"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        /* Properties Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(favorites).map((id) => (
            <div key={id} className="card p-4">
              <p className="text-center text-gray-600">Property {id}</p>
              <p className="text-center text-sm text-gray-500 mt-2">ID: {id}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sorting & Filtering */}
      {favorites.size > 0 && (
        <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg text-center text-sm text-gray-600">
          <p>Sort and filter options will be available here</p>
        </div>
      )}
    </div>
  )
}
