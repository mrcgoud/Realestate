/**
 * Common utility functions for the real estate application
 */

/**
 * Format currency values
 */
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Format area in sqft
 */
export const formatArea = (area: number): string => {
  return `${area.toLocaleString()} sqft`
}

/**
 * Format distance in km or miles
 */
export const formatDistance = (distanceKm: number, unit: 'km' | 'mi' = 'km'): string => {
  if (unit === 'mi') {
    return `${(distanceKm * 0.621371).toFixed(1)} mi`
  }
  return `${distanceKm.toFixed(1)} km`
}

/**
 * Calculate price per sqft
 */
export const calculatePriceSqft = (price: number, area: number): number => {
  return Math.round(price / area)
}

/**
 * Format property address
 */
export const formatAddress = (
  address: string,
  city: string,
  state: string,
  postalCode: string
): string => {
  return `${address}, ${city}, ${state} ${postalCode}`
}

/**
 * Get property type label
 */
export const getPropertyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    apartment: 'Apartment',
    house: 'House',
    plot: 'Plot',
    commercial: 'Commercial',
  }
  return labels[type] || type
}

/**
 * Get property status label
 */
export const getPropertyStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    available: 'Available',
    sold: 'Sold',
    rented: 'Rented',
    'under-offer': 'Under Offer',
  }
  return labels[status] || status
}

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    available: 'green',
    sold: 'gray',
    rented: 'blue',
    'under-offer': 'yellow',
  }
  return colors[status] || 'gray'
}

/**
 * Calculate zoom level based on bounds
 */
export const calculateZoomLevel = (
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): number => {
  const maxLon2 = ((minLon + maxLon) / 2) % 360
  const deltaLat = maxLat - minLat
  const deltaLon = maxLon - minLon
  const maxDelta = Math.max(deltaLat, deltaLon)

  if (maxDelta === 0) return 18

  const zoom = Math.floor(Math.log2(360 / maxDelta))
  return Math.max(0, Math.min(20, zoom))
}

/**
 * Debounce function
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Sleep/delay promise
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get relative time string
 */
export const getRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const baseDate = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - baseDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`

  return `${Math.floor(diffDays / 365)}y ago`
}

/**
 * Validate email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value))
}

/**
 * Generate query string from object
 */
export const generateQueryString = (params: Record<string, unknown>): string => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return query ? `?${query}` : ''
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Round number to decimal places
 */
export const roundToDecimal = (value: number, decimals: number): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Calculate center point from bounds
 */
export const calculateCenter = (
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): [number, number] => {
  return [(minLat + maxLat) / 2, (minLon + maxLon) / 2]
}

/**
 * Check if value is within range
 */
export const inRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}
