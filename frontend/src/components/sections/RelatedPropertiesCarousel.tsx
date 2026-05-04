'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface RelatedPropertyCardProps {
  title: string
  location: string
  price: string
  matchScore: number
}

function RelatedPropertyCard({ title, location, price, matchScore }: RelatedPropertyCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow flex-shrink-0 w-72">
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
        <div className="text-4xl">🏢</div>
        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{matchScore}%</div>
            <div className="text-xs text-green-100">Match</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{location}</p>
        <p className="text-lg font-bold text-gray-900 mb-3">{price}</p>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
          View Details
        </button>
      </div>
    </div>
  )
}

export function RelatedPropertiesCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0)

  const relatedProperties = [
    { title: 'Skyline Heights', location: 'Financial District', price: '₹95L - 1.1Cr', matchScore: 92 },
    { title: 'Green Valley Residences', location: 'Gachbowli', price: '₹85L - 1Cr', matchScore: 89 },
    { title: 'Elite Crest', location: 'Kokapet', price: '₹1.2Cr - 1.5Cr', matchScore: 91 },
    { title: 'Premium Homes', location: 'Kukatpally', price: '₹75L - 95L', matchScore: 88 },
  ]

  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollBehavior: 'smooth' }}>
        {relatedProperties.map((property, index) => (
          <RelatedPropertyCard key={index} {...property} />
        ))}
      </div>
    </div>
  )
}
