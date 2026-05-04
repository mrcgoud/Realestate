'use client'

import { PropertyMatchCard } from './PropertyMatchCard'

const topMatches = [
  {
    id: '1',
    title: 'Skyline Heights',
    location: 'Financial District',
    price: '₹95L - 1.1Cr',
    matchScore: 92,
    builderName: 'ABC Developers',
    builderScore: 8.4,
    investmentScore: '8.6% Rental',
  },
  {
    id: '2',
    title: 'Green Valley Residences',
    location: 'Gachbowli',
    price: '₹85L - 1Cr',
    matchScore: 89,
    builderName: 'XYZ Builders',
    builderScore: 8.2,
    investmentScore: '7.8% Rental',
  },
  {
    id: '3',
    title: 'Elite Crest',
    location: 'Kokapet',
    price: '₹1.2Cr - 1.5Cr',
    matchScore: 91,
    builderName: 'Premium Homes',
    builderScore: 8.9,
    investmentScore: '9.2% Rental',
  },
]

export function PropertyMatchesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Property Matches</h2>
          <p className="text-lg text-gray-600">Properties curated just for you based on your preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topMatches.map((property) => (
            <PropertyMatchCard key={property.id} {...property} />
          ))}
        </div>
      </div>
    </section>
  )
}
