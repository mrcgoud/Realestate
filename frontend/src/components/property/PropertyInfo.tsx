'use client'

import { Property } from '@/types'
import {
  Bed,
  Bath,
  Ruler,
  MapPin,
  Home,
  Calendar,
  CheckCircle,
} from 'lucide-react'

interface PropertyInfoProps {
  property: Property
}

export function PropertyInfo({ property }: PropertyInfoProps) {
  const pricePerSqft = Math.round(property.price / property.area)

  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-2">
              <MapPin className="h-5 w-5" />
              <span>
                {property.address}, {property.city}, {property.state}{' '}
                {property.postalCode}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">
              ${property.price.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm">
              ${pricePerSqft}/sqft
            </div>
          </div>
        </div>

        {/* Property Badge */}
        <div className="flex flex-wrap gap-2 mt-4">
          <PropertyBadge icon={<Home className="h-4 w-4" />} label={property.type} />
          <PropertyBadge icon={<CheckCircle className="h-4 w-4" />} label={property.status} />
          {property.yearBuilt && (
            <PropertyBadge
              icon={<Calendar className="h-4 w-4" />}
              label={`Built ${property.yearBuilt}`}
            />
          )}
        </div>
      </div>

      {/* Key Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FeatureCard
          icon={<Bed className="h-8 w-8" />}
          label="Bedrooms"
          value={property.bedrooms}
        />
        <FeatureCard
          icon={<Bath className="h-8 w-8" />}
          label="Bathrooms"
          value={property.bathrooms}
        />
        <FeatureCard
          icon={<Ruler className="h-8 w-8" />}
          label="Area"
          value={`${property.area.toLocaleString()} sqft`}
        />
        <FeatureCard
          icon={<Home className="h-8 w-8" />}
          label="Lot Size"
          value={`${property.lotArea?.toLocaleString() || 'N/A'} sqft`}
        />
      </div>

      {/* Description */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">About this property</h2>
        <p className="text-gray-700 leading-relaxed">
          {property.description ||
            `This stunning ${property.type} features ${property.bedrooms} bedrooms and ${property.bathrooms} bathrooms in ${property.city}. 
            With ${property.area.toLocaleString()} sqft of living space, this property is perfect for families or investors looking 
            for their next great opportunity. The location offers excellent access to schools, shops, and transportation.`}
        </p>
      </div>

      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(property.amenities || [
            'Air Conditioning',
            'Basement',
            'Central Heating',
            'Deck',
            'Garage',
            'Garden',
            'Gym',
            'Parking',
            'Pool',
          ]).map((amenity, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-gray-700">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PropertyBadge({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
      {icon}
      {label}
    </div>
  )
}

function FeatureCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors">
      <div className="text-primary-600 mb-2">{icon}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}
