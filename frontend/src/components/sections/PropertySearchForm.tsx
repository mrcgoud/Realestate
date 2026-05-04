'use client'

import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'

interface SearchFilters {
  budgetRange: string
  location: string
  propertyType: string
  bhk: string
}

export function PropertySearchForm() {
  const [filters, setFilters] = useState<SearchFilters>({
    budgetRange: '',
    location: '',
    propertyType: '',
    bhk: '',
  })

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.budgetRange) params.append('budget', filters.budgetRange)
    if (filters.location) params.append('location', filters.location)
    if (filters.propertyType) params.append('type', filters.propertyType)
    if (filters.bhk) params.append('bhk', filters.bhk)
    
    // Navigate to search results
    window.location.href = `/search?${params.toString()}`
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Find Your Property Match</h3>
      
      <div className="space-y-4">
        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
          <select
            value={filters.budgetRange}
            onChange={(e) => handleFilterChange('budgetRange', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="">Select budget range</option>
            <option value="under-50L">Under ₹50L</option>
            <option value="50L-1Cr">₹50L - 1 Cr</option>
            <option value="1Cr-1.5Cr">₹1Cr - 1.5 Cr</option>
            <option value="1.5Cr-2Cr">₹1.5Cr - 2 Cr</option>
            <option value="above-2Cr">Above ₹2 Cr</option>
          </select>
        </div>

        {/* Preferred Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Location</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="">Select location</option>
            <option value="financial-district">Financial District</option>
            <option value="gachbowli">Gachbowli</option>
            <option value="hitech-city">Hitech City</option>
            <option value="kokapet">Kokapet</option>
            <option value="kukatpally">Kukatpally</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="">Select property type</option>
            <option value="apartment">Apartment</option>
            <option value="villa">Villa</option>
            <option value="townhouse">Townhouse</option>
            <option value="penthouse">Penthouse</option>
          </select>
        </div>

        {/* BHK */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
          <select
            value={filters.bhk}
            onChange={(e) => handleFilterChange('bhk', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            <option value="">Select BHK</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        {/* Get Matches Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-6"
        >
          <Search className="h-5 w-5" />
          Get My Matches
        </button>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm text-gray-700 font-medium">Verified Property Data</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm text-gray-700 font-medium">Builder Credibility Ratings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✓</span>
          <span className="text-sm text-gray-700 font-medium">Smart Property Matching</span>
        </div>
      </div>
    </div>
  )
}
