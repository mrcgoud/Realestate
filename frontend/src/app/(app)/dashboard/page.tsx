'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePropertyStore } from '@/store/propertyStore'
import Link from 'next/link'
import { Heart, MapPin, TrendingUp, Eye, Plus } from 'lucide-react'
import { PropertyCard } from '@/components/common/PropertyCard'

export default function DashboardPage() {
  const { user, fetchCurrentUser } = useAuthStore()
  const { recentViews, favorites } = usePropertyStore()

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-gray-600">Here's what's happening with your properties</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Heart className="h-6 w-6" />}
          title="Saved Properties"
          value={favorites.size.toString()}
          color="red"
        />
        <StatCard
          icon={<Eye className="h-6 w-6" />}
          title="Recent Views"
          value={recentViews.length.toString()}
          color="blue"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          title="Price Alerts"
          value="3"
          color="green"
        />
        <StatCard
          icon={<MapPin className="h-6 w-6" />}
          title="Searches Saved"
          value="5"
          color="purple"
        />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/search"
          className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <MapPin className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Search Properties</h3>
              <p className="text-sm text-gray-600">Browse all available properties with advanced filters</p>
            </div>
          </div>
        </Link>

        <div className="card p-6 border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">List a Property</h3>
              <p className="text-sm text-gray-600">Post your property for sale or rent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Properties */}
      {favorites.size > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saved Properties</h2>
              <p className="text-sm text-gray-600">Your favorite listings</p>
            </div>
            <Link
              href="/dashboard/saved"
              className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(favorites).slice(0, 3).map((id) => (
              <div key={id} className="text-center p-6 card">
                <p className="text-gray-600">Property card for {id}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Searches */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <p className="text-sm text-gray-600">Properties you recently viewed</p>
        </div>
        {recentViews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentViews.slice(0, 3).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 card bg-gray-50">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent views yet. Start exploring properties!</p>
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: string
  color: 'red' | 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="card p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>{icon}</div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
