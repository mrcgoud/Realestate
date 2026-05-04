'use client'

import Link from 'next/link'
import { Suspense } from 'react'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustedBySection } from '@/components/sections/TrustedBySection'
import { PropertyMatchesSection } from '@/components/sections/PropertyMatchesSection'
import { PropertyInsightsSection } from '@/components/sections/PropertyInsightsSection'
import { ExploreAreasSection } from '@/components/sections/ExploreAreasSection'
import { CuratedToursSection } from '@/components/sections/CuratedToursSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <HeroSection />

      {/* How Buyers Trust Section */}
      <TrustedBySection />

      {/* Top Property Matches */}
      <PropertyMatchesSection />

      {/* Property Insights */}
      <PropertyInsightsSection />

      {/* Explore Investment Areas */}
      <ExploreAreasSection />

      {/* Curated Tours */}
      <CuratedToursSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Find the Right Property?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Create your buyer profile and discover the best properties curated just for you.
            </p>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors">
              Start My Property Search
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
