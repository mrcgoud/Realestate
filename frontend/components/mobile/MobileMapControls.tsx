'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layers,
  MapPin,
  Navigation,
  Search,
  Heart,
  BarChart3,
  Bus,
  Car,
  Home,
  ShoppingBag,
  Thermometer,
  Settings,
  Zap,
  ChevronDown
} from 'lucide-react'
import { useMapStore } from '@/store/mapStore'

interface MobileMapControlsProps {
  onSearchClick?: () => void
  onLocationClick?: () => void
  onFavoritesClick?: () => void
}

const MobileMapControls: React.FC<MobileMapControlsProps> = ({
  onSearchClick,
  onLocationClick,
  onFavoritesClick
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const {
    layers,
    toggleLayer,
    heatmap,
    toggleHeatmap,
    analytics,
    toggleAnalytics,
    transit,
    toggleTransit
  } = useMapStore()

  const quickActions = [
    {
      id: 'search',
      icon: Search,
      label: 'Search',
      color: 'bg-blue-500',
      onClick: onSearchClick
    },
    {
      id: 'location',
      icon: Navigation,
      label: 'My Location',
      color: 'bg-green-500',
      onClick: onLocationClick
    },
    {
      id: 'favorites',
      icon: Heart,
      label: 'Favorites',
      color: 'bg-red-500',
      onClick: onFavoritesClick
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      color: 'bg-purple-500',
      onClick: () => toggleAnalytics()
    }
  ]

  const layerCategories = [
    {
      id: 'property',
      name: 'Properties',
      icon: Home,
      color: 'text-blue-600',
      layers: [
        { id: 'properties', name: 'All Properties', active: layers.properties },
        { id: 'forSale', name: 'For Sale', active: layers.forSale },
        { id: 'forRent', name: 'For Rent', active: layers.forRent }
      ]
    },
    {
      id: 'transit',
      name: 'Transit',
      icon: Bus,
      color: 'text-green-600',
      layers: [
        { id: 'transit', name: 'Public Transit', active: transit.enabled },
        { id: 'commute', name: 'Commute Zones', active: layers.commute },
        { id: 'parking', name: 'Parking', active: layers.parking }
      ]
    },
    {
      id: 'amenities',
      name: 'Amenities',
      icon: ShoppingBag,
      color: 'text-orange-600',
      layers: [
        { id: 'schools', name: 'Schools', active: layers.schools },
        { id: 'groceries', name: 'Groceries', active: layers.groceries },
        { id: 'hospitals', name: 'Hospitals', active: layers.hospitals },
        { id: 'restaurants', name: 'Restaurants', active: layers.restaurants }
      ]
    },
    {
      id: 'data',
      name: 'Data Layers',
      icon: Thermometer,
      color: 'text-red-600',
      layers: [
        { id: 'heatmap', name: 'Price Heatmap', active: heatmap.enabled },
        { id: 'analytics', name: 'Analytics', active: analytics.enabled },
        { id: 'demographics', name: 'Demographics', active: layers.demographics }
      ]
    }
  ]

  const handleLayerToggle = (layerId: string) => {
    switch (layerId) {
      case 'properties':
        toggleLayer('properties')
        break
      case 'forSale':
        toggleLayer('forSale')
        break
      case 'forRent':
        toggleLayer('forRent')
        break
      case 'transit':
        toggleTransit()
        break
      case 'commute':
        toggleLayer('commute')
        break
      case 'parking':
        toggleLayer('parking')
        break
      case 'schools':
        toggleLayer('schools')
        break
      case 'groceries':
        toggleLayer('groceries')
        break
      case 'hospitals':
        toggleLayer('hospitals')
        break
      case 'restaurants':
        toggleLayer('restaurants')
        break
      case 'heatmap':
        toggleHeatmap()
        break
      case 'analytics':
        toggleAnalytics()
        break
      case 'demographics':
        toggleLayer('demographics')
        break
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.95 }}
                onClick={action.onClick}
                className={`aspect-square rounded-xl ${action.color} flex flex-col items-center justify-center text-white shadow-lg`}
                style={{ minHeight: '60px' }}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Layer Categories */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Map Layers
        </h3>
        <div className="space-y-3">
          {layerCategories.map((category) => {
            const Icon = category.icon
            const isExpanded = activeCategory === category.id

            return (
              <div key={category.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setActiveCategory(isExpanded ? null : category.id)}
                  className="w-full flex items-center justify-between p-3 text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${category.color}`} />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2">
                        {category.layers.map((layer) => (
                          <label
                            key={layer.id}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={layer.active}
                              onChange={() => handleLayerToggle(layer.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {layer.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Settings
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Performance Mode
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                defaultChecked={true}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMapControls