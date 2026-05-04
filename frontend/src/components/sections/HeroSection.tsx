'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, Zap, Brain, CheckCircle } from 'lucide-react'
import { PropertySearchForm } from './PropertySearchForm'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 bg-gradient-to-r from-blue-600 to-blue-800">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left content */}
          <div className="text-white pt-8">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Find the Right Property — Not Just Listings
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Tell us your budget and preferences. HireBuyer finds the best properties for you.
            </p>

            {/* Trust indicators */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-semibold">Verified Property Data</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-semibold">Builder Credibility Ratings</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="font-semibold">Smart Property Matching</span>
              </div>
            </div>

            {/* CTA Link */}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 font-semibold text-lg transition-colors"
            >
              Learn More About Our Process
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Right side - Search Form */}
          <div className="flex justify-center">
            <PropertySearchForm />
          </div>
        </div>
      </div>
    </section>
  )
}
