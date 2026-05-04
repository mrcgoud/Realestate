'use client'

import { BarChart3, MapPin, TrendingUp, Video, Shield, Clock } from 'lucide-react'

const features = [
  {
    icon: BarChart3,
    title: 'Price Prediction',
    description: 'AI-powered models analyze comparable properties to forecast market values with high confidence.',
  },
  {
    icon: MapPin,
    title: 'Geospatial Analysis',
    description: 'Explore isochrones, commute times, amenities, and walkability scores for any location.',
  },
  {
    icon: TrendingUp,
    title: 'Market Trends',
    description: 'Track price appreciation, market health indicators, and investment potential scores.',
  },
  {
    icon: Video,
    title: '3D Virtual Tours',
    description: 'Experience immersive 3D property tours and virtual staging with interactive controls.',
  },
  {
    icon: Shield,
    title: 'Verified Data',
    description: 'All property information is verified and updated from authoritative sources.',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Get instant notifications about new listings and price changes in your areas of interest.',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">Powerful Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to make informed real estate decisions with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="card p-8 hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="mb-4 inline-block p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
