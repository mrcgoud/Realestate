'use client'

import { useEffect } from 'react'
import { useSearchStore } from '@/store/searchStore'
import { PropertyCard } from '@/components/common/PropertyCard'
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react'

export function SearchResults() {
  const { query, filters, results, total, page, pageSize, isLoading, hasMore, search, loadMore, setPage } =
    useSearchStore()

  useEffect(() => {
    search()
  }, [])

  const totalPages = Math.ceil(total / pageSize)

  if (isLoading && results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to find more properties
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Results Info */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-semibold">{(page - 1) * pageSize + 1}</span> -{' '}
            <span className="font-semibold">
              {Math.min(page * pageSize, total)}
            </span>{' '}
            of <span className="font-semibold">{total}</span> properties
          </p>
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (page > 3) {
                    pageNum = page - 2 + i
                  }
                  if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i)
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`min-w-10 h-10 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                      pageNum === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => {
                if (page < totalPages) {
                  setPage(page + 1)
                } else if (hasMore) {
                  loadMore()
                }
              }}
              disabled={page === totalPages && !hasMore}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
