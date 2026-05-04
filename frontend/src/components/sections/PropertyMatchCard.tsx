'use client'

import { CheckCircle, TrendingUp, BarChart3 } from 'lucide-react'

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: string
  matchScore: number
  image?: string
  builderName?: string
  builderScore?: number
  investmentScore?: string
}

export function PropertyMatchCard({ 
  id, 
  title, 
  location, 
  price, 
  matchScore,
  image,
  builderName,
  builderScore,
  investmentScore
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-2">🏢</div>
            <p className="text-gray-500 text-sm">Property Image</p>
          </div>
        )}
        
        {/* Match Score Badge */}
        <div className="absolute top-4 right-4 bg-green-500 rounded-full p-4 shadow-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{matchScore}%</div>
            <div className="text-xs text-green-100 font-semibold">Match</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{location}</p>
        
        {builderName && (
          <p className="text-xs text-gray-500 mb-3">{builderName}</p>
        )}

        {/* Price */}
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">{price}</p>
        </div>

        {/* Scores Row */}
        {(builderScore || investmentScore) && (
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
            {builderScore && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Builder Credibility</p>
                <p className="text-lg font-bold text-gray-900">{builderScore}/10</p>
              </div>
            )}
            {investmentScore && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Investment Score</p>
                <p className="text-lg font-bold text-gray-900">{investmentScore}</p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Trusted Builder</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">High Growth Area</span>
          </div>
        </div>

        {/* View Details Button */}
        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          View Details
        </button>
      </div>
    </div>
  )
}
