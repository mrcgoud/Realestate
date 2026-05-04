// Mobile utility functions for real estate platform

/**
 * Detect if the current device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  // Check screen width
  if (window.innerWidth < 768) return true

  // Check user agent as fallback
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || ''
  return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent.toLowerCase())
}

/**
 * Get optimal touch target size for mobile devices
 */
export function getTouchTargetSize(): { width: number; height: number } {
  return isMobileDevice()
    ? { width: 44, height: 44 } // WCAG AA compliant
    : { width: 32, height: 32 } // Desktop size
}

/**
 * Check if the device supports haptic feedback
 */
export function supportsHapticFeedback(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator
}

/**
 * Trigger haptic feedback with different patterns
 */
export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light'): void {
  if (!supportsHapticFeedback()) return

  const patterns = {
    light: 10,
    medium: 20,
    heavy: 50,
    success: [10, 50, 10],
    error: [50, 100, 50]
  }

  navigator.vibrate(patterns[type])
}

/**
 * Get optimal image size based on device and viewport
 */
export function getOptimalImageSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 400, height: 300 }

  const isMobile = isMobileDevice()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  if (isMobile) {
    // Mobile: smaller images for performance
    return {
      width: Math.min(viewportWidth * 0.8, 400),
      height: Math.min(viewportHeight * 0.3, 300)
    }
  } else {
    // Desktop: larger images
    return {
      width: Math.min(viewportWidth * 0.4, 600),
      height: Math.min(viewportHeight * 0.4, 400)
    }
  }
}

/**
 * Debounce touch events to prevent excessive firing
 */
export function debounceTouch<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 100
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if the device is in landscape orientation
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth > window.innerHeight
}

/**
 * Get safe area insets for devices with notches
 */
export function getSafeAreaInsets(): {
  top: number
  bottom: number
  left: number
  right: number
} {
  if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }

  const computedStyle = getComputedStyle(document.documentElement)
  const top = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0')
  const bottom = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0')
  const left = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0')
  const right = parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0')

  return { top, bottom, left, right }
}

/**
 * Check if the device has a high pixel density display
 */
export function isHighDPI(): boolean {
  if (typeof window === 'undefined') return false
  return window.devicePixelRatio > 1
}

/**
 * Get the optimal map zoom level for mobile devices
 */
export function getOptimalMapZoom(): number {
  if (isMobileDevice()) {
    return isLandscape() ? 13 : 12
  }
  return 14
}

/**
 * Check if the device supports WebGL for map rendering
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext &&
      canvas.getContext('webgl'))
  } catch (e) {
    return false
  }
}

/**
 * Get battery level if available (for performance adjustments)
 */
export async function getBatteryLevel(): Promise<number | null> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null
  }

  try {
    const battery = await (navigator as any).getBattery()
    return battery.level * 100
  } catch (e) {
    return null
  }
}

/**
 * Check if the device is in low power mode
 */
export async function isLowPowerMode(): Promise<boolean> {
  const batteryLevel = await getBatteryLevel()
  return batteryLevel !== null && batteryLevel < 20
}

/**
 * Format currency for mobile display
 */
export function formatCurrencyMobile(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  // On mobile, use shorter format for large numbers
  if (isMobileDevice() && amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }

  return formatter.format(amount)
}

/**
 * Get optimal text size class for mobile
 */
export function getOptimalTextSize(baseSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl'): string {
  if (!isMobileDevice()) return `text-${baseSize}`

  // Increase text size on mobile for better readability
  const mobileSizes = {
    sm: 'text-base',
    base: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl'
  }

  return mobileSizes[baseSize] || `text-${baseSize}`
}

/**
 * Check if the device supports passive event listeners
 */
export function supportsPassiveEvents(): boolean {
  if (typeof window === 'undefined') return false

  let supportsPassive = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: () => { supportsPassive = true }
    })
    window.addEventListener('test', () => {}, opts)
    window.removeEventListener('test', () => {}, opts)
  } catch (e) {}

  return supportsPassive
}