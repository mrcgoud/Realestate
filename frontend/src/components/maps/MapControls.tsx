'use client'

import { useMapStore } from '@/store/mapStore'
import { Eye, EyeOff, Flame, Clock, MapPin, Utensils, Settings, Zap, Volume2 } from 'lucide-react'
import { isMobileDevice } from '@/lib/mobileUtils'

/**
 * Map Controls Component
 * Manages layer visibility, heatmap types, and other map settings
 * Responsive design: hidden on mobile, full controls on desktop
 */
export function MapControls() {
  const isMobile = isMobileDevice()

  const {
    visibleLayers,
    toggleLayer,
    heatmapType,
    setHeatmapType,
    isochroneMode,
    isochroneTime,
    setIsochrone,
    transitType,
    setTransitType,
    showTransitDistance,
    toggleTransitDistance,
    analyticsType,
    setAnalyticsType,
    analyticsOpacity,
    setAnalyticsOpacity,
    showAnalyticsLabels,
    toggleAnalyticsLabels,
  } = useMapStore()

  // Hide controls on mobile - they will be shown in BottomSheet instead
  if (isMobile) {
    return null
  }

  return (
    <div className="absolute top-6 right-6 z-20 space-y-3 max-w-xs">
      {/* Layers Control */}
      <div className="bg-white rounded-lg shadow p-4 max-w-xs">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-gray-700" />
          <h3 className="font-semibold text-gray-900 text-sm">Map Layers</h3>
        </div>

        <div className="space-y-2">
          {/* Heatmap Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={visibleLayers.heatmap || false}
              onChange={() => toggleLayer('heatmap')}
              className="w-4 h-4 rounded text-primary-600"
            />
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-700">Heatmap</span>
          </label>

          {/* Heatmap Type Selection */}
          {visibleLayers.heatmap && (
            <div className="pl-6 pb-2 border-l border-gray-200 space-y-1">
              {['price', 'demand', 'density'].map((type) => (
                <button
                  key={type}
                  onClick={() => setHeatmapType(type as any)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    heatmapType === type
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Isochrone Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={isochroneMode}
              onChange={() => setIsochrone(!isochroneMode, isochroneTime)}
              className="w-4 h-4 rounded text-primary-600"
            />
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">Commute Zones</span>
          </label>

          {/* Isochrone Time Selection */}
          {isochroneMode && (
            <div className="pl-6 pb-2 border-l border-gray-200 space-y-1">
              {[15, 30, 45].map((time) => (
                <button
                  key={time}
                  onClick={() => setIsochrone(true, time)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    isochroneTime === time
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {time} min
                </button>
              ))}
            </div>
          )}

          {/* Transit Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={visibleLayers.transit || false}
              onChange={() => toggleLayer('transit')}
              className="w-4 h-4 rounded text-primary-600"
            />
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-700">Transit</span>
          </label>

          {/* Transit Type Selection */}
          {visibleLayers.transit && (
            <div className="pl-6 pb-2 border-l border-gray-200 space-y-1">
              {[
                { value: 'all', label: 'All Transit', color: 'text-gray-600', emoji: '🚍' },
                { value: 'bus', label: 'Bus', color: 'text-red-500', emoji: '🚌' },
                { value: 'subway', label: 'Subway', color: 'text-blue-500', emoji: '🚇' },
                { value: 'train', label: 'Train', color: 'text-purple-500', emoji: '🚆' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTransitType(type.value as any)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-2 ${
                    transitType === type.value
                      ? 'bg-red-100 text-red-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{type.emoji}</span>
                  {type.label}
                </button>
              ))}

              {/* Distance Toggle */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors mt-2 pt-2 border-t border-gray-200">
                <input
                  type="checkbox"
                  checked={showTransitDistance}
                  onChange={() => toggleTransitDistance()}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span className="text-xs text-gray-700">Show Walk Time</span>
              </label>
            </div>
          )}

          {/* Advanced Analytics Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={visibleLayers.analytics || false}
              onChange={() => toggleLayer('analytics')}
              className="w-4 h-4 rounded text-primary-600"
            />
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-700">Analytics</span>
          </label>

          {/* Analytics Type Selection */}
          {visibleLayers.analytics && (
            <div className="pl-6 pb-2 border-l border-gray-200 space-y-2">
              {[
                { value: 'walkability', label: '🚶 Walkability', desc: 'Pedestrian friendly areas' },
                { value: 'pricePrediction', label: '💰 Price Prediction', desc: 'Estimated price trend' },
                { value: 'marketTrends', label: '📊 Market Trends', desc: 'Demand & appreciation' },
                { value: 'neighborhood', label: '🏘️ Neighborhood', desc: 'Overall score & metrics' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setAnalyticsType(type.value as any)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    analyticsType === type.value
                      ? 'bg-yellow-100 text-yellow-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={type.desc}
                >
                  {type.label}
                </button>
              ))}

              {/* Opacity Control */}
              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-center gap-2 mb-1">
                  <Volume2 className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-700">Opacity</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={analyticsOpacity * 100}
                  onChange={(e) => setAnalyticsOpacity(parseInt(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">{Math.round(analyticsOpacity * 100)}%</span>
              </div>

              {/* Labels Toggle */}
              <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors pt-2 border-t border-gray-200">
                <input
                  type="checkbox"
                  checked={showAnalyticsLabels}
                  onChange={() => toggleAnalyticsLabels()}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span className="text-xs text-gray-700">Show Values</span>
              </label>
            </div>
          )}

          {/* Amenities Toggle */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={visibleLayers.amenities || false}
              onChange={() => toggleLayer('amenities')}
              className="w-4 h-4 rounded text-primary-600"
            />
            <Utensils className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-700">Amenities</span>
          </label>
        </div>
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  )
}

/**
 * Map Legend Component
 * Shows color coding and layer meanings
 */
function MapLegend() {
  const { visibleLayers, heatmapType, analyticsType } = useMapStore()

  if (!visibleLayers.heatmap && !visibleLayers.transit && !visibleLayers.analytics) return null

  return (
    <div className="bg-white rounded-lg shadow p-3 max-w-xs space-y-3">
      {/* Heatmap Legend */}
      {visibleLayers.heatmap && (
        <div>
          <p className="text-xs font-semibold text-gray-900 mb-2">
            {heatmapType.charAt(0).toUpperCase() + heatmapType.slice(1)} Scale
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(189, 0, 38)' }}></div>
              <span className="text-xs text-gray-700">Highest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(227, 74, 51)' }}></div>
              <span className="text-xs text-gray-700">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(253, 191, 111)' }}></div>
              <span className="text-xs text-gray-700">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(209, 229, 240)' }}></div>
              <span className="text-xs text-gray-700">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(103, 169, 207)' }}></div>
              <span className="text-xs text-gray-700">Lowest</span>
            </div>
          </div>
        </div>
      )}

      {/* Transit Legend */}
      {visibleLayers.transit && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-900 mb-2">Transit Types</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-xs text-gray-700">🚌 Bus Stops</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="text-xs text-gray-700">🚇 Subway Stations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="text-xs text-gray-700">🚆 Train Stations</span>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Legend */}
      {visibleLayers.analytics && (
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-900 mb-2">
            {analyticsType === 'walkability' ? 'Walkability Score'
             : analyticsType === 'pricePrediction' ? 'Price per Sq Ft'
             : analyticsType === 'marketTrends' ? 'Demand Index'
             : 'Neighborhood Score'}
          </p>
          <div className="space-y-1">
            {analyticsType === 'pricePrediction' ? (
              // Price prediction scale
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-xs text-gray-700">$200/sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fbbf24' }}></div>
                  <span className="text-xs text-gray-700">$600/sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-xs text-gray-700">$1000/sq ft</span>
                </div>
              </>
            ) : analyticsType === 'marketTrends' ? (
              // Market trends scale
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#3b82f6' }}></div>
                  <span className="text-xs text-gray-700">Low Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-xs text-gray-700">Medium Demand</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                  <span className="text-xs text-gray-700">High Demand</span>
                </div>
              </>
            ) : (
              // Walkability & neighborhood scale
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="text-xs text-gray-700">Poor (0-25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                  <span className="text-xs text-gray-700">Fair (50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                  <span className="text-xs text-gray-700">Excellent (75-100)</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapControls
