'use client'

import { useEffect, useState } from 'react'
import { Property } from '@/types'
import { PropertyCard } from '@/components/common/PropertyCard'
import Link from 'next/link'

interface RelatedPropertiesProps {
  property: Property
}

export function RelatedProperties({ property }: RelatedPropertiesProps) {
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedProperties()
  }, [property.id])

  const fetchRelatedProperties = async () => {
    try {
      setLoading(true)

      // Import apiClient dynamically to avoid circular dependencies
      const { apiClient } = await import('@/lib/api-client')

      // Call real API to get related properties
      const data = await apiClient.getRelatedProperties(property.id, 4)

      setRelatedProperties(data.properties || data)
    } catch (error) {
      console.error('Failed to fetch related properties:', error)

      // Fallback to mock data if API fails
      console.warn('Falling back to mock related properties')
      const mockRelated: Property[] = [
        {
          id: 'related-1',
          title: 'Modern Apartment Downtown',
          address: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          price: property.price * 0.95,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area * 1.05,
          type: 'apartment',
          status: 'available',
          description: 'Stunning modern apartment in the heart of downtown.',
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          ],
          amenities: ['Gym', 'Parking', 'Balcony'],
          views: 245,
          favorites: 18,
          country: 'USA',
          latitude: 40.7128,
          longitude: -74.006,
          currency: 'USD',
          ownerId: 'owner-1',
          thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Property,
        {
          id: 'related-2',
          title: 'Luxury Penthouse',
          address: '789 Park Lane',
          city: 'New York',
          state: 'NY',
          postalCode: '10002',
          price: property.price * 1.1,
          bedrooms: property.bedrooms + 1,
          bathrooms: property.bathrooms + 1,
          area: property.area * 1.2,
          type: 'apartment',
          status: 'available',
          description: 'Exclusive penthouse with panoramic city views.',
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          ],
          amenities: ['Pool', 'Gym', 'Rooftop'],
          views: 512,
          favorites: 42,
          country: 'USA',
          latitude: 40.7128,
          longitude: -74.006,
          currency: 'USD',
          ownerId: 'owner-2',
          thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Property,
        {
          id: 'related-3',
          title: 'Cozy Studio',
          address: '321 Elm St',
          city: 'New York',
          state: 'NY',
          postalCode: '10003',
          price: property.price * 0.7,
          bedrooms: 0,
          bathrooms: 1,
          area: property.area * 0.5,
          type: 'apartment',
          status: 'available',
          description: 'Perfect starter property in a great neighborhood.',
          images: [
            'https://images.unsplash.com/photo-1516455207990-7a41e1d4fcc3?w=800',
          ],
          amenities: ['Parking', 'Gym'],
          views: 189,
          favorites: 12,
          country: 'USA',
          latitude: 40.7128,
          longitude: -74.006,
          currency: 'USD',
          ownerId: 'owner-3',
          thumbnail: 'https://images.unsplash.com/photo-1516455207990-7a41e1d4fcc3?w=200',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Property,
        {
          id: 'related-4',
          title: 'Contemporary House',
          address: '555 Maple Drive',
          city: 'New York',
          state: 'NY',
          postalCode: '10004',
          price: property.price * 1.15,
          bedrooms: property.bedrooms + 2,
          bathrooms: property.bathrooms + 2,
          area: property.area * 1.5,
          type: 'house',
          status: 'available',
          description: 'Beautiful contemporary home with garden.',
          images: [
            'https://images.unsplash.com/photo-1460932656007-374ff3409236?w=800',
          ],
          amenities: ['Garden', 'Parking', 'Garage'],
          views: 378,
          favorites: 31,
          country: 'USA',
          latitude: 40.7128,
          longitude: -74.006,
          currency: 'USD',
          ownerId: 'owner-4',
          thumbnail: 'https://images.unsplash.com/photo-1460932656007-374ff3409236?w=200',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Property,
      ]

      setRelatedProperties(mockRelated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
        <Link
          href={`/search?type=${property.type}&city=${property.city}`}
          className="text-primary-600 hover:text-primary-700 font-semibold"
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : relatedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProperties.map((prop) => (
            <Link key={prop.id} href={`/property/${prop.id}`}>
              <PropertyCard property={prop} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No similar properties found.</p>
        </div>
      )}
    </div>
  )
}
