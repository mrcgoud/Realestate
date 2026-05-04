'use client'

import { useState } from 'react'
import { useSearchStore } from '@/store/searchStore'
import { ChevronDown, X } from 'lucide-react'

export function SearchFilters({ onClose }: { onClose?: () => void }) {
  const { filters, setFilters, updateFilter, search } = useSearchStore()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    property: true,
    location: false,
    amenities: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleSearch = async () => {
    await search()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors lg:hidden"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Filters Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Price Range */}
        <FilterSection
          title="Price Range"
          id="price"
          expanded={expandedSections.price}
          onToggle={() => toggleSection('price')}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  updateFilter('minPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) =>
                  updateFilter('maxPrice', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Property Type */}
        <FilterSection
          title="Property Type"
          id="property"
          expanded={expandedSections.property}
          onToggle={() => toggleSection('property')}
        >
          <div className="space-y-2">
            {['apartment', 'house', 'plot', 'commercial'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.propertyTypes?.includes(type) || false}
                  onChange={(e) => {
                    const currentTypes = filters.propertyTypes || []
                    const newTypes = e.target.checked
                      ? [...currentTypes, type]
                      : currentTypes.filter((t) => t !== type)
                    updateFilter('propertyTypes', newTypes.length > 0 ? newTypes : undefined)
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Bedrooms & Bathrooms */}
        <FilterSection
          title="Bedrooms & Bathrooms"
          id="beds"
          expanded={expandedSections.property}
          onToggle={() => {}}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Bedrooms</label>
              <select
                value={filters.minBedrooms || ''}
                onChange={(e) =>
                  updateFilter('minBedrooms', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}+ Bedrooms
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Bathrooms</label>
              <select
                value={filters.minBedrooms || ''}
                onChange={(e) =>
                  updateFilter('minBedrooms', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}+ Bathrooms
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Area */}
        <FilterSection
          title="Area (sqft)"
          id="area"
          expanded={false}
          onToggle={() => {}}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Area</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minArea || ''}
                onChange={(e) =>
                  updateFilter('minArea', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max Area</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxArea || ''}
                onChange={(e) =>
                  updateFilter('maxArea', e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </FilterSection>

        {/* Amenities */}
        <FilterSection
          title="Amenities"
          id="amenities"
          expanded={expandedSections.amenities}
          onToggle={() => toggleSection('amenities')}
        >
          <div className="space-y-2">
            {['Parking', 'Gym', 'Pool', 'Garden', 'Balcony', 'Elevator'].map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.amenities?.includes(amenity) || false}
                  onChange={(e) => {
                    const currentAmenities = filters.amenities || []
                    const newAmenities = e.target.checked
                      ? [...currentAmenities, amenity]
                      : currentAmenities.filter((a) => a !== amenity)
                    updateFilter('amenities', newAmenities.length > 0 ? newAmenities : undefined)
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={handleSearch}
          className="w-full py-2.5 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          Search
        </button>
        <button
          onClick={() => setFilters({})}
          className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  )
}

function FilterSection({
  title,
  id,
  expanded,
  onToggle,
  children,
}: {
  title: string
  id: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 text-gray-600 transition-transform ${
            expanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {expanded && <div className="p-4 border-t border-gray-200">{children}</div>}
    </div>
  )
}
