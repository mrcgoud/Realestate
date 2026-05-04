'use client'

import Image from 'next/image'
import { Heart, MapPin, Bed, Bath, Maximize2, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Property } from '@/types'
import {
  formatCurrency,
  formatArea,
  getPropertyTypeLabel,
  getPropertyStatusLabel,
  calculatePriceSqft,
} from '@/lib/utils'
import { isMobileDevice, getTouchTargetSize, triggerHapticFeedback } from '@/lib/mobileUtils'

interface PropertyCardProps {
  property: Property
  onFavoriteChange?: (isFavorite: boolean) => void
}

export function PropertyCard({ property, onFavoriteChange }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Mobile optimizations
  const isMobile = isMobileDevice()
  const touchTargetSize = getTouchTargetSize()

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newFavorite = !isFavorite
    setIsFavorite(newFavorite)
    onFavoriteChange?.(newFavorite)

    // Haptic feedback on mobile
    if (isMobile) {
      triggerHapticFeedback('light')
    }
  }

  const priceSqft = calculatePriceSqft(property.price, property.area)

  return (
    <div className="card overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image Container - Mobile optimized */}
      <div className={`relative overflow-hidden bg-gray-200 group ${
        isMobile ? 'h-48' : 'h-64'
      }`}>
        {!imageError ? (
          <Image
            src={property.thumbnail || property.images[0] || '/images/placeholder.jpg'}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
            <span>Image unavailable</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusBgColor(
              property.status
            )}`}
          >
            {getPropertyStatusLabel(property.status)}
          </span>
        </div>

        {/* Favorite Button - Touch optimized */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 rounded-full bg-white/80 hover:bg-white transition-colors hover:shadow-md ${
            isMobile ? 'p-3' : 'p-2'
          }`}
          style={isMobile ? { minWidth: touchTargetSize.width, minHeight: touchTargetSize.height } : {}}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`transition-colors ${isMobile ? 'h-6 w-6' : 'h-5 w-5'} ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Type Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500 text-white">
            {getPropertyTypeLabel(property.type)}
          </span>
        </div>
      </div>

      {/* Content - Mobile optimized */}
      <div className={isMobile ? 'p-3' : 'p-4'}>
        {/* Price - Mobile optimized */}
        <div className="mb-2">
          <p className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatCurrency(property.price, property.currency)}
          </p>
          <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {formatCurrency(priceSqft, property.currency)}/sqft
          </p>
        </div>

        {/* Title - Mobile optimized */}
        <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>
          {property.title}
        </h3>

        {/* Location - Mobile optimized */}
        <div className={`flex items-start gap-2 mb-4 text-gray-600 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary-600" />
          <div>
            <p className="font-medium text-gray-900">
              {property.city}, {property.state}
            </p>
            <p className="text-xs text-gray-500">{property.address}</p>
          </div>
        </div>

        {/* Features - Mobile optimized */}
        <div className={`grid gap-3 mb-4 py-4 border-y border-gray-200 ${
          isMobile ? 'grid-cols-3 text-xs' : 'grid-cols-3'
        }`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bed className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-gray-900">{property.bedrooms}</span>
            </div>
            <p className="text-xs text-gray-500">Beds</p>
          </div>
          <div className="text-center border-l border-r border-gray-200">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Bath className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-gray-900">
                {typeof property.bathrooms === 'number' ? property.bathrooms : '—'}
              </span>
            </div>
            <p className="text-xs text-gray-500">Baths</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Maximize2 className="h-4 w-4 text-primary-600" />
              <span className="font-semibold text-gray-900">
                {Math.round(property.area / 1000)}k
              </span>
            </div>
            <p className="text-xs text-gray-500">Sqft</p>
          </div>
        </div>

        {/* Amenities Preview */}
        {property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 2).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-block px-2 py-1 rounded text-xs bg-primary-50 text-primary-700"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 2 && (
                <span className="inline-block px-2 py-1 text-xs text-gray-500">
                  +{property.amenities.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Meta Info - Mobile optimized */}
        <div className={`flex items-center justify-between text-gray-500 mb-4 ${
          isMobile ? 'text-xs' : 'text-xs'
        }`}>
          <span>👁️ {property.views.toLocaleString()} views</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {property.favorites} saved
          </span>
        </div>

        {/* Year Built */}
        {property.yearBuilt && (
          <p className="text-xs text-gray-500">Built in {property.yearBuilt}</p>
        )}
      </div>
    </div>
  )
}

function getStatusBgColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-green-500'
    case 'sold':
      return 'bg-gray-500'
    case 'rented':
      return 'bg-blue-500'
    case 'under-offer':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}
