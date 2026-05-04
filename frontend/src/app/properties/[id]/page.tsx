'use client'

import { MapPin, Check, TrendingUp, BarChart3, Star } from 'lucide-react'

interface PropertyDetailsPageProps {
  params: {
    id: string
  }
}

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  // Mock property data - in real app would fetch from API
  const property = {
    id: params.id,
    title: 'Skyline Heights',
    builder: 'ABC Developers',
    location: 'Financial District, Hyderabad',
    price: '₹95L - 1.1Cr',
    matchScore: 92,
    builderScore: 8.4,
    areaGrowthScore: 9,
    investmentScore: 8.6,
    investmentYield: '4.5%',
    description: 'Skyline Heights, a premium residential offering parallie luxury berth apartments. With advanced amenities for a aspire lifestyle since insulator specifies advanced mutation one amenities; Activarts in Hyderabad\'s Financial District near IT parks, schools, and entertainment hubs.',
    projectDetails: {
      configurations: '2 BHK / 3 BHK',
      sizes: '1,200-1,600 sq ft',
      area: '1,200 - 1,600 sq ft',
      totalTowers: 5,
      totalUnits: 420,
      reraNumber: 'RERA2023000045',
    },
    amenities: [
      'Swimming Pool',
      'Gym & Fitness Studio',
      'Clubhouse',
      'Kids Play Area',
      'Landscaped Gardens',
      'Jogging Track',
      'Indoor Games',
    ],
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <div className="relative h-96 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏢</div>
            <p className="text-gray-600 font-semibold">Property Images</p>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className="absolute top-8 right-8 bg-green-500 rounded-full p-6 shadow-xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{property.matchScore}%</div>
            <div className="text-sm text-green-100 font-semibold">Match Score</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title & Location */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="h-5 w-5" />
                <span>{property.location}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{property.builder}</p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-600 text-sm mb-2">Starting Price</p>
              <p className="text-3xl font-bold text-gray-900">{property.price}</p>
            </div>

            {/* About */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About {property.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{property.description}</p>
            </section>

            {/* Project Details */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Configurations</p>
                  <p className="font-bold text-gray-900">{property.projectDetails.configurations}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Sizes / Tappas</p>
                  <p className="font-bold text-gray-900">{property.projectDetails.sizes}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Area</p>
                  <p className="font-bold text-gray-900">{property.projectDetails.area}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Towers</p>
                  <p className="font-bold text-gray-900">{property.projectDetails.totalTowers}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Units</p>
                  <p className="font-bold text-gray-900">{property.projectDetails.totalUnits}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">RERA Number</p>
                  <p className="font-bold text-gray-900 text-sm">{property.projectDetails.reraNumber}</p>
                </div>
              </div>
            </section>

            {/* Key Amenities */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl">
                      {amenity === 'Swimming Pool' && '🏊'}
                      {amenity === 'Gym & Fitness Studio' && '💪'}
                      {amenity === 'Clubhouse' && '🎪'}
                      {amenity === 'Kids Play Area' && '🎠'}
                      {amenity === 'Landscaped Gardens' && '🌳'}
                      {amenity === 'Jogging Track' && '🏃'}
                      {amenity === 'Indoor Games' && '🎮'}
                    </div>
                    <span className="font-medium text-gray-900">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* About Location */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Location</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6">
                <p className="text-gray-500">📍 Map View - Interactive location map would be displayed here</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Locality Score</h3>
                  <p className="text-3xl font-bold text-gray-900">₹ 85/Cr</p>
                  <p className="text-sm text-gray-600 mt-1">Roof saris</p>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Match Score</h3>
                  <p className="text-3xl font-bold text-green-600">{property.matchScore}%</p>
                  <p className="text-sm text-gray-600 mt-1">Perfect match for you</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div>
            {/* Match Score Card */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-6 mb-8 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Match Score</h3>
              
              <div className="space-y-4">
                {/* Builder Credibility */}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 rounded-lg p-3 flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Builder Credibility</p>
                    <p className="text-2xl font-bold text-gray-900">{property.builderScore} / 10</p>
                    <p className="text-xs text-gray-600">Trusted Builder</p>
                  </div>
                </div>

                {/* Area Growth */}
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 rounded-lg p-3 flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Area Growth Score</p>
                    <p className="text-2xl font-bold text-gray-900">{property.areaGrowthScore} / 10</p>
                    <p className="text-xs text-gray-600">High growth area</p>
                  </div>
                </div>

                {/* Investment Score */}
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 rounded-lg p-3 flex-shrink-0">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Investment Score</p>
                    <p className="text-2xl font-bold text-gray-900">{property.investmentScore}%</p>
                    <p className="text-xs text-gray-600">Rental: {property.investmentYield}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Book Site Visit
                </button>
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold py-3 px-4 rounded-lg transition-colors">
                  Share Property
                </button>
              </div>
            </div>

            {/* Interested CTA */}
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <p className="text-gray-900 font-semibold mb-4">Interested in {property.title}?</p>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Book a Site Visit
              </button>
            </div>
          </div>
        </div>

        {/* Related Properties Section */}
        <div className="mt-16 border-t pt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Green Valley Residences', location: 'Gachbowli', price: '₹85L - 1Cr', matchScore: 89 },
              { title: 'Elite Crest', location: 'Kokapet', price: '₹1.2Cr - 1.5Cr', matchScore: 91 },
              { title: 'Premium Homes', location: 'Kukatpally', price: '₹75L - 95L', matchScore: 88 },
            ].map((prop, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center relative">
                  <div className="text-4xl">🏢</div>
                  <div className="absolute top-4 right-4 bg-green-500 rounded-full p-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{prop.matchScore}%</div>
                      <div className="text-xs text-green-100">Match</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{prop.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{prop.location}</p>
                  <p className="text-lg font-bold text-gray-900 mb-4">{prop.price}</p>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
