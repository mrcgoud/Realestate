'use client'

import { Calendar, MapPin, Clock } from 'lucide-react'

export function CuratedToursSection() {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container">
        <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Curated Property Tours</h2>
          <p className="text-gray-600 mb-8">Visit multiple projects in one day with expert insights.</p>

          {/* Tour Card */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-8 mb-8">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">Financial District Tour</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Saturday | 10 AM</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Half-day tour with expert guide</span>
              </div>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Reserve My Seat
            </button>
          </div>

          <p className="text-sm text-gray-600">Visit multiple properties curated based on your preferences in a single tour.</p>
        </div>
      </div>
    </section>
  )
}
