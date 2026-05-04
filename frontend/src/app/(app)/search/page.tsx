'use client'

import { useState, Suspense } from 'react'
import { SearchFilters } from '@/components/search/SearchFilters'
import { SearchResults } from '@/components/search/SearchResults'
import { SearchMapWithList } from '@/components/maps/SearchMapWithList'
import { LayoutGrid, Map } from 'lucide-react'

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('map')
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  return (
    <>
      {/* Filters Sidebar */}
      {isFilterOpen && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <Suspense fallback={<FiltersSkeleton />}>
            <SearchFilters onClose={() => setIsFilterOpen(false)} />
          </Suspense>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Controls */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!isFilterOpen && (
              <button
                onClick={() => setIsFilterOpen(true)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Filters
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Properties</h1>
              <p className="text-sm text-gray-600">Find your next home</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'map' ? (
          <div className="flex-1 overflow-auto">
            <Suspense fallback={<MapSkeleton />}>
              <div className="p-4">
                <SearchMapWithList showList={true} />
              </div>
            </Suspense>
          </div>
        ) : (
          <Suspense fallback={<ResultsSkeleton />}>
            <SearchResults />
          </Suspense>
        )}
      </div>
    </>
  )
}

function FiltersSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card shimmer h-80"></div>
        ))}
      </div>
    </div>
  )
}
