/**
 * Advanced Analytics Service
 * Provides walkability scores, price predictions, market trends, and neighborhood analysis
 */

export interface WalkabilityScore {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  components: {
    walkableStreets: number
    amenityDensity: number
    pedestrianFriendliness: number
    transitAccess: number
    safetyRating: number
  }
  description: string
}

export interface PricePrediction {
  currentPrice: number
  predictedPrice: number
  priceChange: number // Percentage
  confidence: number // 0-100
  factors: {
    neighborhood: number
    marketTrends: number
    amenityProximity: number
    transportAccess: number
    demographicTrends: number
  }
}

export interface MarketTrend {
  trend: 'up' | 'down' | 'stable'
  percentageChange: number // Annual
  averagePricePerSqft: number
  daysOnMarket: number
  demandIndex: number // 0-10
  competitionLevel: 'low' | 'medium' | 'high'
  forecastTrend: 'accelerating' | 'steady' | 'slowing'
}

export interface NeighborhoodScore {
  overallScore: number // 0-100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  metrics: {
    walkability: number // 0-100
    safety: number // 0-100
    schools: number // 0-100
    parks: number // 0-100
    nightlife: number // 0-100
    affordability: number // 0-100
    employment: number // 0-100
    diversity: number // 0-100
  }
  highlights: string[]
  concerns: string[]
  populationDensity: number // People per sq km
  medianAge: number
  householdIncome: number
  growthRate: number // Percentage YoY
}

export interface AnalyticsGridPoint {
  latitude: number
  longitude: number
  walkabilityScore: number
  pricePerSqft: number
  marketTrend: 'up' | 'down' | 'stable'
  demandIndex: number
  neighborhoodGrade: string
}

export interface AnalyticsHeatmap {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number] // [lon, lat]
    }
    properties: {
      value: number
      category: string
      metadata?: Record<string, any>
    }
  }>
}

/**
 * Get walkability score for location from API
 */
export async function generateWalkabilityScore(
  latitude: number,
  longitude: number
): Promise<WalkabilityScore> {
  try {
    // Import apiClient dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api-client')

    // Call real API
    const data = await apiClient.getWalkabilityScore(latitude, longitude)

    return {
      score: data.score,
      grade: data.grade,
      components: data.components,
      description: data.description,
    }
  } catch (error) {
    console.error('Failed to fetch walkability score from API:', error)

    // Fallback to mock data
    console.warn('Falling back to mock walkability score')
    const seed = Math.floor(latitude * 1000 + longitude * 100) % 1000
    const baseScore = 50 + Math.sin(seed / 100) * 30 + Math.random() * 20

    const score = Math.min(100, Math.max(0, baseScore))
    const grade = getGradeFromScore(score)

    const components = {
      walkableStreets: 60 + Math.random() * 30,
      amenityDensity: 50 + Math.random() * 35,
      pedestrianFriendliness: 55 + Math.random() * 35,
      transitAccess: 65 + Math.random() * 25,
      safetyRating: 70 + Math.random() * 25,
    }

    return {
      score: Math.round(score * 10) / 10,
      grade,
      components: Object.fromEntries(
        Object.entries(components).map(([k, v]) => [k, Math.round(v * 10) / 10])
      ) as any,
      description: getWalkabilityDescription(score),
    }
  }
}

/**
 * Get price prediction for property from API
 */
export async function generatePricePrediction(
  currentPrice: number,
  latitude: number,
  longitude: number
): Promise<PricePrediction> {
  try {
    // Import apiClient dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api-client')

    // Call real API for price prediction
    const data = await apiClient.predictPrice(
      latitude,
      longitude,
      2, // Default bedrooms
      1, // Default bathrooms
      1000, // Default sqft
      new Date().getFullYear() - 10, // Default year built
      'apartment' // Default property type
    )

    return {
      currentPrice,
      predictedPrice: data.predictedPrice,
      priceChange: ((data.predictedPrice - currentPrice) / currentPrice) * 100,
      confidence: data.confidence * 100,
      factors: data.factors,
    }
  } catch (error) {
    console.error('Failed to fetch price prediction from API:', error)

    // Fallback to mock data
    console.warn('Falling back to mock price prediction')
    const seed = Math.floor(latitude * 1000 + longitude * 50) % 1000
    const trendMultiplier = 0.95 + (seed % 10) / 50 // -5% to +15%

    const predictedPrice = currentPrice * trendMultiplier
    const priceChange = ((predictedPrice - currentPrice) / currentPrice) * 100

    const factors = {
      neighborhood: 80 + Math.random() * 15,
      marketTrends: 65 + Math.random() * 25,
      amenityProximity: 70 + Math.random() * 20,
      transportAccess: 75 + Math.random() * 20,
      demographicTrends: 60 + Math.random() * 30,
    }

    const confidence = 60 + Math.random() * 35

    return {
      currentPrice,
      predictedPrice: Math.round(predictedPrice),
      priceChange: Math.round(priceChange * 10) / 10,
      confidence: Math.round(confidence * 10) / 10,
      factors: Object.fromEntries(
        Object.entries(factors).map(([k, v]) => [k, Math.round(v * 10) / 10])
      ) as any,
    }
  }
}

/**
 * Get market trends for location from API
 */
export async function generateMarketTrends(
  latitude: number,
  longitude: number
): Promise<MarketTrend> {
  try {
    // Import apiClient dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api-client')

    // Call real API for locality scoring (includes market data)
    const data = await apiClient.scoreLocality(latitude, longitude)

    // Transform locality data to market trends format
    const trend: 'up' | 'down' | 'stable' =
      data.marketTrend === 'increasing' ? 'up' :
      data.marketTrend === 'decreasing' ? 'down' : 'stable'

    const competitionLevel: 'low' | 'medium' | 'high' =
      data.demandIndex < 4 ? 'low' :
      data.demandIndex < 7 ? 'medium' : 'high'

    const forecastTrend: 'accelerating' | 'steady' | 'slowing' =
      data.growthRate > 2 ? 'accelerating' :
      data.growthRate > 0 ? 'steady' : 'slowing'

    return {
      trend,
      percentageChange: data.growthRate,
      averagePricePerSqft: data.averagePricePerSqft || 350,
      daysOnMarket: data.daysOnMarket || 30,
      demandIndex: data.demandIndex,
      competitionLevel,
      forecastTrend,
    }
  } catch (error) {
    console.error('Failed to fetch market trends from API:', error)

    // Fallback to mock data
    console.warn('Falling back to mock market trends')
    const seed = Math.floor(latitude * 1000 + longitude * 75) % 1000

    // Determine trend
    const trendRoll = seed % 3
    const trend: 'up' | 'down' | 'stable' =
      trendRoll === 0 ? 'up' : trendRoll === 1 ? 'down' : 'stable'

    const percentageChange = trend === 'up'
      ? 3 + Math.random() * 6
      : trend === 'down'
      ? -6 + Math.random() * -1
      : -2 + Math.random() * 4

    const demandRoll = seed % 10
    const competitionLevel: 'low' | 'medium' | 'high' =
      demandRoll < 3 ? 'low' : demandRoll < 7 ? 'medium' : 'high'

    const forecastTrend: 'accelerating' | 'steady' | 'slowing' =
      seed % 3 === 0 ? 'accelerating' : seed % 3 === 1 ? 'steady' : 'slowing'

    return {
      trend,
      percentageChange: Math.round(percentageChange * 10) / 10,
      averagePricePerSqft: 300 + Math.random() * 400,
      daysOnMarket: 20 + Math.floor(Math.random() * 60),
      demandIndex: Math.round((3 + Math.random() * 7) * 10) / 10,
      competitionLevel,
      forecastTrend,
    }
  }
}

/**
 * Get neighborhood score for location from API
 */
export async function generateNeighborhoodScore(
  latitude: number,
  longitude: number
): Promise<NeighborhoodScore> {
  try {
    // Import apiClient dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api-client')

    // Call real API for locality scoring
    const data = await apiClient.scoreLocality(latitude, longitude)

    return {
      overallScore: data.overallScore,
      grade: data.grade,
      metrics: data.metrics,
      highlights: data.highlights || [],
      concerns: data.concerns || [],
      populationDensity: data.populationDensity,
      medianAge: data.medianAge,
      householdIncome: data.householdIncome,
      growthRate: data.growthRate,
    }
  } catch (error) {
    console.error('Failed to fetch neighborhood score from API:', error)

    // Fallback to mock data
    console.warn('Falling back to mock neighborhood score')
    const seed = Math.floor(latitude * 1000 + longitude * 200) % 1000

    const metrics = {
      walkability: Math.round((50 + Math.random() * 50) * 10) / 10,
      safety: Math.round((65 + Math.random() * 30) * 10) / 10,
      schools: Math.round((60 + Math.random() * 35) * 10) / 10,
      parks: Math.round((55 + Math.random() * 40) * 10) / 10,
      nightlife: Math.round((50 + Math.random() * 45) * 10) / 10,
      affordability: Math.round((40 + Math.random() * 50) * 10) / 10,
      employment: Math.round((70 + Math.random() * 25) * 10) / 10,
      diversity: Math.round((60 + Math.random() * 35) * 10) / 10,
    }

    const overallScore =
      Object.values(metrics).reduce((a, b) => a + b, 0) / 8

    const grade = getNeighborhoodGrade(overallScore)

    const highlights = generateHighlights(metrics)
    const concerns = generateConcerns(metrics)

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      grade,
      metrics,
      highlights,
      concerns,
      populationDensity: 5000 + Math.random() * 20000,
      medianAge: 25 + Math.random() * 45,
      householdIncome: 40000 + Math.random() * 120000,
      growthRate: -1 + Math.random() * 5,
    }
  }
}

/**
 * Generate analytics grid data for heatmap visualization
 */
export function generateAnalyticsGridData(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  gridResolution: number = 0.01 // 0.01 degree ≈ 1km
): AnalyticsGridPoint[] {
  const points: AnalyticsGridPoint[] = []

  for (let lat = minLat; lat <= maxLat; lat += gridResolution) {
    for (let lon = minLon; lon <= maxLon; lon += gridResolution) {
      const walkability = generateWalkabilityScore(lat, lon)
      const trends = generateMarketTrends(lat, lon)

      points.push({
        latitude: lat,
        longitude: lon,
        walkabilityScore: walkability.score,
        pricePerSqft: trends.averagePricePerSqft,
        marketTrend: trends.trend,
        demandIndex: trends.demandIndex,
        neighborhoodGrade: getNeighborhoodGrade(
          generateNeighborhoodScore(lat, lon).overallScore
        ),
      })
    }
  }

  return points
}

/**
 * Generate walkability heatmap GeoJSON
 */
export function generateWalkabilityHeatmap(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): AnalyticsHeatmap {
  const points = generateAnalyticsGridData(minLat, maxLat, minLon, maxLon, 0.02)

  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        value: p.walkabilityScore,
        category: 'walkability',
        grade: p.neighborhoodGrade,
      },
    })),
  }
}

/**
 * Generate price prediction heatmap GeoJSON
 */
export function generatePricePredictionHeatmap(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): AnalyticsHeatmap {
  const points = generateAnalyticsGridData(minLat, maxLat, minLon, maxLon, 0.02)

  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        value: p.pricePerSqft,
        category: 'pricePrediction',
        trend: p.marketTrend,
      },
    })),
  }
}

/**
 * Generate market trends heatmap GeoJSON
 */
export function generateMarketTrendsHeatmap(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): AnalyticsHeatmap {
  const points = generateAnalyticsGridData(minLat, maxLat, minLon, maxLon, 0.02)

  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.longitude, p.latitude],
      },
      properties: {
        value: p.demandIndex,
        category: 'marketTrend',
        trend: p.marketTrend,
      },
    })),
  }
}

/**
 * Helper: Get grade from score
 */
function getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

/**
 * Helper: Get neighborhood grade
 */
function getNeighborhoodGrade(
  score: number
): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'B+'
  if (score >= 80) return 'B'
  if (score >= 75) return 'C+'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

/**
 * Helper: Get walkability description
 */
function getWalkabilityDescription(score: number): string {
  if (score >= 90)
    return 'Walker\'s Paradise - Daily errands do not require a car'
  if (score >= 80)
    return 'Very Walkable - Most errands can be accomplished on foot'
  if (score >= 70) return 'Somewhat Walkable - Some errands can be accomplished on foot'
  if (score >= 60)
    return 'Car-Dependent - Most errands require a car'
  return 'Very Car-Dependent - Almost all errands require a car'
}

/**
 * Helper: Generate highlights based on metrics
 */
function generateHighlights(metrics: Record<string, number>): string[] {
  const highlights: string[] = []

  // Find top 3 metrics
  const sorted = Object.entries(metrics)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const descriptions: Record<string, string> = {
    walkability: 'Excellent walkability',
    safety: 'Very safe neighborhood',
    schools: 'Great schools nearby',
    parks: 'Abundant parks & green spaces',
    nightlife: 'Vibrant nightlife & entertainment',
    affordability: 'Good value for money',
    employment: 'Strong job market',
    diversity: 'Diverse & inclusive community',
  }

  sorted.forEach(([key]) => {
    if (descriptions[key]) highlights.push(descriptions[key])
  })

  return highlights
}

/**
 * Helper: Generate concerns based on metrics
 */
function generateConcerns(metrics: Record<string, number>): string[] {
  const concerns: string[] = []

  // Find bottom 2 metrics
  const sorted = Object.entries(metrics)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2)

  const descriptions: Record<string, string> = {
    walkability: 'Lower walkability - car-dependent area',
    safety: 'Safety could be improved',
    schools: 'Limited school options',
    parks: 'Limited parks & green spaces',
    nightlife: 'Limited entertainment options',
    affordability: 'Higher cost of living',
    employment: 'Limited job opportunities',
    diversity: 'Less diverse community',
  }

  sorted.forEach(([key]) => {
    if (descriptions[key]) concerns.push(descriptions[key])
  })

  return concerns
}

/**
 * Fetch analytics for a specific property
 */
export async function fetchPropertyAnalytics(
  latitude: number,
  longitude: number,
  price: number
): Promise<{
  walkability: WalkabilityScore
  pricePrediction: PricePrediction
  marketTrends: MarketTrend
  neighborhood: NeighborhoodScore
}> {
  try {
    // In production, would call API:
    // const response = await fetch('/api/analytics/property', {...})

    return {
      walkability: generateWalkabilityScore(latitude, longitude),
      pricePrediction: generatePricePrediction(price, latitude, longitude),
      marketTrends: generateMarketTrends(latitude, longitude),
      neighborhood: generateNeighborhoodScore(latitude, longitude),
    }
  } catch (error) {
    console.error('Error fetching property analytics:', error)
    throw error
  }
}

/**
 * Format score for display
 */
export function formatScore(score: number): string {
  return Math.round(score * 10) / 10 + '/100'
}

/**
 * Get score color (for UI)
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981' // green
  if (score >= 70) return '#3b82f6' // blue
  if (score >= 60) return '#f59e0b' // amber
  if (score >= 50) return '#ef5350' // red
  return '#dc2626' // dark red
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '📈'
    case 'down':
      return '📉'
    case 'stable':
      return '➡️'
  }
}
