'use client'

import { useEffect, useCallback, useState } from 'react'
import maplibregl from 'maplibre-gl'
import Supercluster from 'supercluster'
import { useMapLibre } from './MapLibreProvider'
import { useMapStore } from '@/store/mapStore'
import { Property } from '@/types'
import { fetchTransitStations, getTransitTypeColor, formatDistance, formatWalkTime } from '@/lib/transitService'
import { 
  generateWalkabilityHeatmap, 
  generatePricePredictionHeatmap, 
  generateMarketTrendsHeatmap,
  formatScore,
  getScoreColor
} from '@/lib/analyticsService'
import { isMobileDevice, getOptimalMapZoom, supportsWebGL } from '@/lib/mobileUtils'
export function MapLibreMap({
  properties,
  onPropertyClick,
  showHeatmap = false,
  showIsochrone = false,
  showTransit = false,
  showAmenities = false,
  center,
  zoom,
}: MapLibreMapProps) {
  const { map, isLoaded, addLayer, removeLayer, addSource, removeSource } = useMapLibre()
  const {
    visibleLayers,
    heatmapType,
    isochroneMode,
    isochroneTime,
    transitType,
    showTransitDistance,
    analyticsType,
    analyticsOpacity,
    showAnalyticsLabels
  } = useMapStore()
  const [cluster, setCluster] = useState<Supercluster<any, any> | null>(null)
  const [loading, setLoading] = useState(false)

  // Mobile detection and optimizations
  const isMobile = isMobileDevice()
  const optimalZoom = getOptimalMapZoom()
  const hasWebGL = supportsWebGL()

  // Mobile-specific map settings
  const mobileMapSettings = {
    maxZoom: 16, // Lower than desktop for performance
    minZoom: 10,
    renderWorldCopies: false,
    pitchWithRotate: false,
    dragRotate: false,
    touchZoomRotate: true,
    cooperativeGestures: true,
    pitchEnabled: false,
    rotateEnabled: false,
    maxTileCacheSize: 20 * 1024 * 1024, // 20MB cache
    maxTileCacheZoomLevels: 2,
  }

  // Initialize clustering with mobile optimizations
  useEffect(() => {
    if (!properties.length) return

    const supercluster = new Supercluster({
      radius: isMobile ? 60 : 40, // Larger clusters on mobile for performance
      maxZoom: isMobile ? 14 : 16, // Lower max zoom on mobile
      minZoom: 0,
    })

    // Create features from properties
    const features = properties.map((prop) => ({
      geometry: {
        coordinates: [prop.longitude, prop.latitude],
        type: 'Point' as const,
      },
      properties: {
        id: prop.id,
        title: prop.title,
        price: prop.price,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
      },
    }))

    supercluster.load(features)
    setCluster(supercluster)
  }, [properties, isMobile])

  // Add property markers
  useEffect(() => {
    if (!map || !isLoaded || !cluster) return

    try {
      // Remove existing property source if present
      removeSource('properties')
    } catch (e) {
      // Source might not exist yet
    }

    // Create GeoJSON from clustered properties
    const bounds = map.getBounds()
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]

    const zoom = Math.round(map.getZoom())
    const clusters = cluster.getClusters(bbox, zoom)

    // Create GeoJSON feature collection
    const features: GeoJSON.Feature[] = clusters.map((cluster) => {
      if (cluster.properties?.cluster) {
        // Clustered group
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: cluster.geometry.coordinates,
          },
          properties: {
            ...cluster.properties,
            isCluster: true,
          },
        }
      } else {
        // Individual property
        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: cluster.geometry.coordinates,
          },
          properties: {
            ...cluster.properties,
            isCluster: false,
          },
        }
      }
    })

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features,
    }

    // Add source
    try {
      addSource('properties', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Add clustered circles layer with mobile optimizations
      addLayer({
        id: 'property-cluster-circles',
        type: 'circle',
        source: 'properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#0ea5e9',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            isMobile ? 25 : 20, // Larger on mobile
            5,
            isMobile ? 30 : 25,
            10,
            isMobile ? 35 : 30
          ],
          'circle-opacity': isMobile ? 0.9 : 0.8, // More opaque on mobile
        },
      })

      // Add cluster count text with mobile sizing
      addLayer({
        id: 'property-cluster-text',
        type: 'symbol',
        source: 'properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Open Sans Semibold'],
          'text-size': isMobile ? 14 : 12, // Larger text on mobile
        },
        paint: {
          'text-color': '#fff',
        },
      })

      // Add individual property markers with mobile optimizations
      addLayer({
        id: 'property-markers',
        type: 'symbol',
        source: 'properties',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'property-icon',
          'icon-size': isMobile ? 1.0 : 0.8, // Larger icons on mobile
          'icon-allow-overlap': true,
          'text-field': isMobile ? '' : ['get', 'title'], // Hide text labels on mobile
          'text-font': ['Open Sans Regular'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
      })

      // Add click handler for individual properties
      if (onPropertyClick) {
        map.on('click', 'property-markers', (e) => {
          const feature = e.features?.[0]
          if (feature?.properties?.id) {
            onPropertyClick(feature.properties.id)
          }
        })

        // Change cursor on hover
        map.on('mouseenter', 'property-markers', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'property-markers', () => {
          map.getCanvas().style.cursor = ''
        })
      }
    } catch (e) {
      console.error('Error adding property layers:', e)
    }
  }, [map, isLoaded, cluster])

  // Add heatmap layer
  useEffect(() => {
    if (!map || !isLoaded) return

    const shouldShow = visibleLayers.heatmap && showHeatmap

    if (shouldShow) {
      try {
        // Create heatmap data from properties
        const features = properties.map((prop) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [prop.longitude, prop.latitude],
          },
          properties: {
            price: prop.price,
            demand: Math.random() * 100,
            density: 1,
          },
        }))

        // Remove existing heatmap layer and source
        removeLayer('heatmap-layer')
        removeSource('heatmap-source')

        // Add source
        addSource('heatmap-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features,
          },
        })

        // Determine which property to use for heatmap
        const colorProperty = heatmapType === 'price' ? 'price' : heatmapType === 'demand' ? 'demand' : 'density'

        // Add heatmap layer with mobile optimizations
        addLayer(
          {
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heatmap-source',
            paint: {
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['get', colorProperty],
                0,
                0,
                100,
                1,
              ],
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, isMobile ? 0.8 : 1, // Lower intensity on mobile
                9, isMobile ? 2 : 3
              ],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33, 102, 172, 0)',
                0.2,
                'rgb(103, 169, 207)',
                0.4,
                'rgb(209, 229, 240)',
                0.6,
                'rgb(253, 191, 111)',
                0.8,
                'rgb(227, 74, 51)',
                1,
                'rgb(189, 0, 38)',
              ],
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, isMobile ? 3 : 2, // Larger radius on mobile for visibility
                9, isMobile ? 25 : 20
              ],
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                7, isMobile ? 0.8 : 1, // Higher opacity on mobile
                9, isMobile ? 0.4 : 0.3
              ],
            },
          },
          'property-markers'
        )
      } catch (e) {
        console.error('Error adding heatmap layer:', e)
      }
    } else {
      // Remove heatmap if not visible
      try {
        removeLayer('heatmap-layer')
        removeSource('heatmap-source')
      } catch (e) {
        // Layer might not exist
      }
    }
  }, [map, isLoaded, visibleLayers, heatmapType, properties, showHeatmap])

  // Add isochrone layer (commute time zones)
  useEffect(() => {
    if (!map || !isLoaded || !isochroneMode) return

    const fetchIsochrone = async () => {
      try {
        setLoading(true)

        // Import apiClient dynamically to avoid circular dependencies
        const { apiClient } = await import('@/lib/api-client')

        // Get map center for isochrone calculation
        const center = map.getCenter()
        const latitude = center.lat
        const longitude = center.lng

        // Call real API for isochrone calculation
        const isochroneData = await apiClient.calculateIsochrone(
          latitude,
          longitude,
          isochroneTime,
          isochroneMode
        )

        // Transform API response to GeoJSON
        const isochroneGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: isochroneData.features || [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: isochroneData.coordinates || [
                  [
                    [longitude - 0.01, latitude - 0.01],
                    [longitude - 0.01, latitude + 0.01],
                    [longitude + 0.01, latitude + 0.01],
                    [longitude + 0.01, latitude - 0.01],
                    [longitude - 0.01, latitude - 0.01],
                  ],
                ],
              },
              properties: {
                time: isochroneTime,
                mode: isochroneMode,
              },
            },
          ],
        }

        removeLayer('isochrone-layer')
        removeSource('isochrone-source')

        addSource('isochrone-source', {
          type: 'geojson',
          data: isochroneGeoJSON,
        })

        addLayer(
          {
            id: 'isochrone-layer',
            type: 'fill',
            source: 'isochrone-source',
            paint: {
              'fill-color': '#0ea5e9',
              'fill-opacity': 0.2,
            },
          },
          'property-markers'
        )

        // Add outline
        addLayer({
          id: 'isochrone-outline',
          type: 'line',
          source: 'isochrone-source',
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 2,
            'line-dasharray': [5, 5],
          },
        })
      } catch (error) {
        console.error('Error fetching isochrone data:', error)

        // Fallback to mock isochrone
        console.warn('Falling back to mock isochrone data')
        const isochroneGeoJSON: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-74.006, 40.7128],
                    [-74.006, 40.7228],
                    [-73.996, 40.7228],
                    [-73.996, 40.7128],
                    [-74.006, 40.7128],
                  ],
                ],
              },
              properties: {
                time: isochroneTime,
              },
            },
          ],
        }

        removeLayer('isochrone-layer')
        removeSource('isochrone-source')

        addSource('isochrone-source', {
          type: 'geojson',
          data: isochroneGeoJSON,
        })

        addLayer(
          {
            id: 'isochrone-layer',
            type: 'fill',
            source: 'isochrone-source',
            paint: {
              'fill-color': '#0ea5e9',
              'fill-opacity': 0.2,
            },
          },
          'property-markers'
        )

        // Add outline
        addLayer({
          id: 'isochrone-outline',
          type: 'line',
          source: 'isochrone-source',
          paint: {
            'line-color': '#0ea5e9',
            'line-width': 2,
            'line-dasharray': [5, 5],
          },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchIsochrone()

    return () => {
      try {
        removeLayer('isochrone-layer')
        removeLayer('isochrone-outline')
        removeSource('isochrone-source')
      } catch (e) {
        // Layers might not exist
      }
    }
  }, [map, isLoaded, isochroneMode, isochroneTime])

  // Add transit stations layer
  useEffect(() => {
    if (!map || !isLoaded) return

    const shouldShow = visibleLayers.transit && showTransit

    if (shouldShow) {
      const loadTransitStations = async () => {
        try {
          setLoading(true)
          const bounds = map.getBounds()
          
          // Get center for reference point (for distance calculation)
          const center = map.getCenter()
          const referencePoint = { lat: center.lat, lon: center.lng }

          // Fetch transit stations
          const transitData = await fetchTransitStations(
            bounds.getSouth(),
            bounds.getNorth(),
            bounds.getWest(),
            bounds.getEast(),
            transitType,
            referencePoint
          )

          // Remove existing transit layer and source
          removeLayer('transit-layer')
          removeLayer('transit-labels')
          removeSource('transit-source')

          // Add transit source
          addSource('transit-source', {
            type: 'geojson',
            data: transitData,
          })

          // Add transit markers layer (colored circles by type)
          addLayer({
            id: 'transit-layer',
            type: 'circle',
            source: 'transit-source',
            paint: {
              'circle-radius': 8,
              'circle-color': [
                'match',
                ['get', 'type'],
                'bus',
                '#ef4444',      // red
                'subway',
                '#3b82f6',      // blue
                'train',
                '#8b5cf6',      // purple
                '#6b7280'       // gray fallback
              ],
              'circle-opacity': 0.9,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
            },
          })

          // Add transit labels
          addLayer({
            id: 'transit-labels',
            type: 'symbol',
            source: 'transit-source',
            layout: {
              'text-field': showTransitDistance 
                ? ['format',
                    ['get', 'name'], { 'text-transform': 'uppercase' },
                    '\n',
                    ['concat', 
                      ['get', 'walkTime'], 
                      ' min'
                    ], { 'font-scale': 0.8 }
                  ]
                : ['get', 'name'],
              'text-font': ['Open Sans Regular'],
              'text-size': 10,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-max-width': 12,
            },
            paint: {
              'text-color': '#000000',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1,
            },
          })

          // Add click handler for transit stations
          if (map) {
            map.on('click', 'transit-layer', (e) => {
              const feature = e.features?.[0]
              if (feature?.properties) {
                const { name, type, distance, walkTime, routes } = feature.properties
                
                // Create popup content
                const routesText = routes ? `Routes: ${routes.join(', ')}` : ''
                const distanceText = distance ? `Distance: ${formatDistance(distance)}` : ''
                const walkTimeText = walkTime ? `Walk Time: ${formatWalkTime(walkTime)}` : ''
                
                const popup = new maplibregl.Popup({ offset: 25 })
                  .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
                  .setHTML(
                    `<div class="p-2">
                      <h3 class="font-semibold text-sm mb-1">${name}</h3>
                      <p class="text-xs text-gray-600 mb-1">Type: ${type}</p>
                      ${distanceText ? `<p class="text-xs text-gray-600">${distanceText}</p>` : ''}
                      ${walkTimeText ? `<p class="text-xs text-gray-600">${walkTimeText}</p>` : ''}
                      ${routesText ? `<p class="text-xs text-gray-600 mt-1">${routesText}</p>` : ''}
                    </div>`
                  )
                  .addTo(map)
              }
            })

            // Change cursor on hover
            map.on('mouseenter', 'transit-layer', () => {
              map.getCanvas().style.cursor = 'pointer'
            })
            map.on('mouseleave', 'transit-layer', () => {
              map.getCanvas().style.cursor = ''
            })
          }

          setLoading(false)
        } catch (e) {
          console.error('Error loading transit stations:', e)
          setLoading(false)
        }
      }

      loadTransitStations()
    } else {
      // Remove transit layer if not visible
      try {
        removeLayer('transit-layer')
        removeLayer('transit-labels')
        removeSource('transit-source')
      } catch (e) {
        // Layer might not exist
      }
    }
  }, [map, isLoaded, visibleLayers.transit, showTransit, transitType, showTransitDistance])

  // Add analytics layers (walkability, price prediction, market trends, neighborhood scoring)
  useEffect(() => {
    if (!map || !isLoaded) return

    const shouldShow = visibleLayers.analytics && analyticsType

    if (shouldShow) {
      try {
        const bounds = map.getBounds()
        
        // Generate analytics data based on selected type
        let analyticsData
        
        switch (analyticsType) {
          case 'walkability':
            analyticsData = generateWalkabilityHeatmap(
              bounds.getSouth(),
              bounds.getNorth(),
              bounds.getWest(),
              bounds.getEast()
            )
            break
          case 'pricePrediction':
            analyticsData = generatePricePredictionHeatmap(
              bounds.getSouth(),
              bounds.getNorth(),
              bounds.getWest(),
              bounds.getEast()
            )
            break
          case 'marketTrends':
            analyticsData = generateMarketTrendsHeatmap(
              bounds.getSouth(),
              bounds.getNorth(),
              bounds.getWest(),
              bounds.getEast()
            )
            break
          case 'neighborhood':
            analyticsData = generateWalkabilityHeatmap(
              bounds.getSouth(),
              bounds.getNorth(),
              bounds.getWest(),
              bounds.getEast()
            )
            break
          default:
            return
        }

        // Remove existing analytics layer and source
        try {
          removeLayer('analytics-heatmap')
          removeLayer('analytics-labels')
          removeSource('analytics-source')
        } catch (e) {
          // Layers might not exist
        }

        // Add analytics source
        addSource('analytics-source', {
          type: 'geojson',
          data: analyticsData,
        })

        // Determine color gradient based on analytics type
        let colorGradient
        
        if (analyticsType === 'pricePrediction') {
          // Price: Blue (low) → Red (high)
          colorGradient = [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            200,
            '#3b82f6',     // Blue - low price
            400,
            '#60a5fa',
            600,
            '#fbbf24',     // Amber - mid price
            800,
            '#f97316',
            1000,
            '#ef4444'      // Red - high price
          ]
        } else if (analyticsType === 'marketTrends') {
          // Demand Index: Blue (low) → Red (high)
          colorGradient = [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0,
            '#3b82f6',     // Blue - low demand
            5,
            '#10b981',     // Green - medium demand
            10,
            '#ef4444'      // Red - high demand
          ]
        } else {
          // Walkability & Neighborhood: Red (low) → Green (high)
          colorGradient = [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0,
            '#dc2626',     // Red - low score
            25,
            '#f97316',     // Orange
            50,
            '#eab308',     // Yellow
            75,
            '#84cc16',     // Lime
            100,
            '#10b981'      // Green - high score
          ]
        }

        // Add analytics heatmap layer
        addLayer({
          id: 'analytics-heatmap',
          type: 'heatmap',
          source: 'analytics-source',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'value'],
              0,
              0,
              100,
              1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              0.5,
              20,
              2
            ],
            'heatmap-color': colorGradient,
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              2,
              20,
              25
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7,
              analyticsOpacity,
              20,
              analyticsOpacity * 0.5
            ]
          }
        })

        // Add labels if enabled
        if (showAnalyticsLabels) {
          addLayer({
            id: 'analytics-labels',
            type: 'symbol',
            source: 'analytics-source',
            layout: {
              'text-field': ['get', 'value'],
              'text-font': ['Open Sans Regular'],
              'text-size': 9,
              'text-offset': [0, 0.5],
              'text-anchor': 'center',
            },
            paint: {
              'text-color': '#000000',
              'text-halo-color': '#ffffff',
              'text-halo-width': 1,
              'text-opacity': 0.7,
            },
          })
        }

        // Add click handler for analytics points
        if (map) {
          map.on('click', 'analytics-heatmap', (e) => {
            const feature = e.features?.[0]
            if (feature?.properties) {
              const { value, category } = feature.properties
              
              const categoryLabel = analyticsType === 'walkability' ? 'Walkability Score'
                : analyticsType === 'pricePrediction' ? 'Price per Sq Ft'
                : analyticsType === 'marketTrends' ? 'Demand Index'
                : 'Score'
              
              const popup = new maplibregl.Popup({ offset: 25 })
                .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
                .setHTML(
                  `<div class="p-2">
                    <p class="font-semibold text-sm mb-1">${categoryLabel}</p>
                    <p class="text-sm text-gray-700">${formatScore(value)}</p>
                  </div>`
                )
                .addTo(map)
            }
          })

          map.on('mouseenter', 'analytics-heatmap', () => {
            map.getCanvas().style.cursor = 'pointer'
          })
          map.on('mouseleave', 'analytics-heatmap', () => {
            map.getCanvas().style.cursor = ''
          })
        }
      } catch (e) {
        console.error('Error adding analytics layer:', e)
      }
    } else {
      // Remove analytics layers if not visible
      try {
        removeLayer('analytics-heatmap')
        removeLayer('analytics-labels')
        removeSource('analytics-source')
      } catch (e) {
        // Layers might not exist
      }
    }
  }, [map, isLoaded, visibleLayers.analytics, analyticsType, analyticsOpacity, showAnalyticsLabels])

  return null
}

export default MapLibreMap
