'use client'

import { useState, useEffect, useCallback } from 'react'
import { isMobileDevice } from '@/lib/mobileUtils'

interface PWAManagerProps {
  onInstallPrompt?: (prompt: () => void) => void
  onInstallSuccess?: () => void
  onUpdateAvailable?: (update: () => void) => void
}

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOffline: boolean
  updateAvailable: boolean
  installPrompt: (() => void) | null
}

const PWAManager: React.FC<PWAManagerProps> = ({
  onInstallPrompt,
  onInstallSuccess,
  onUpdateAvailable
}) => {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: false,
    updateAvailable: false,
    installPrompt: null
  })

  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Check if PWA is supported
  const isPWASupported = useCallback(() => {
    return (
      'serviceWorker' in navigator &&
      'BeforeInstallPromptEvent' in window &&
      isMobileDevice()
    )
  }, [])

  // Check if app is already installed
  const checkInstalled = useCallback(() => {
    if ('standalone' in window.navigator && (window.navigator as any).standalone) {
      return true
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true
    }

    return false
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      setRegistration(registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState(prev => ({ ...prev, updateAvailable: true }))

              const updateApp = () => {
                newWorker.postMessage({ action: 'skipWaiting' })
                window.location.reload()
              }

              onUpdateAvailable?.(updateApp)
            }
          })
        }
      })

      // Listen for controller change (update applied)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

      console.log('Service Worker registered successfully')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }, [onUpdateAvailable])

  // Handle install prompt
  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault()

    const prompt = () => {
      (e as any).prompt()
      ;(e as any).userChoice.then((choice: { outcome: string }) => {
        if (choice.outcome === 'accepted') {
          setPwaState(prev => ({
            ...prev,
            isInstalled: true,
            isInstallable: false,
            installPrompt: null
          }))
          onInstallSuccess?.()
        }
      })
    }

    setPwaState(prev => ({
      ...prev,
      isInstallable: true,
      installPrompt: prompt
    }))

    onInstallPrompt?.(prompt)
  }, [onInstallPrompt, onInstallSuccess])

  // Handle app installed
  const handleAppInstalled = useCallback(() => {
    setPwaState(prev => ({
      ...prev,
      isInstalled: true,
      isInstallable: false,
      installPrompt: null
    }))
    onInstallSuccess?.()
  }, [onInstallSuccess])

  // Check online status
  const checkOnlineStatus = useCallback(() => {
    setPwaState(prev => ({
      ...prev,
      isOffline: !navigator.onLine
    }))
  }, [])

  // Initialize PWA
  useEffect(() => {
    if (!isPWASupported()) return

    // Register service worker
    registerServiceWorker()

    // Check if already installed
    const installed = checkInstalled()
    setPwaState(prev => ({ ...prev, isInstalled: installed }))

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Listen for online/offline
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)
    checkOnlineStatus()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [isPWASupported, registerServiceWorker, checkInstalled, handleBeforeInstallPrompt, handleAppInstalled, checkOnlineStatus])

  // Background sync
  const requestBackgroundSync = useCallback(async (tag: string) => {
    if (!registration) return false

    try {
      await registration.sync.register(tag)
      return true
    } catch (error) {
      console.error('Background sync not supported:', error)
      return false
    }
  }, [registration])

  // Push notifications
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Notification permission request failed:', error)
      return false
    }
  }, [])

  // Send push notification
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!registration) return

    try {
      await registration.showNotification(title, {
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        ...options
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }, [registration])

  // Share content
  const shareContent = useCallback(async (data: ShareData) => {
    if (!navigator.share) return false

    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Share failed:', error)
      return false
    }
  }, [])

  // Get app shortcuts (if supported)
  const getAppShortcuts = useCallback(() => {
    if ('shortcuts' in window.navigator) {
      return (window.navigator as any).shortcuts || []
    }
    return []
  }, [])

  // Check for content index
  const addToContentIndex = useCallback(async (content: {
    id: string
    title: string
    description: string
    url: string
    category?: string
  }) => {
    if ('contentIndex' in window.navigator) {
      try {
        await (window.navigator as any).contentIndex.add(content)
        return true
      } catch (error) {
        console.error('Failed to add to content index:', error)
      }
    }
    return false
  }, [])

  // Get cache storage info
  const getCacheInfo = useCallback(async () => {
    if (!('caches' in window)) return null

    try {
      const cacheNames = await caches.keys()
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name)
          const keys = await cache.keys()
          return { name, entries: keys.length }
        })
      )
      return cacheInfo
    } catch (error) {
      console.error('Failed to get cache info:', error)
      return null
    }
  }, [])

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) return false

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      )
      return true
    } catch (error) {
      console.error('Failed to clear caches:', error)
      return false
    }
  }, [])

  // Update app
  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ action: 'skipWaiting' })
    }
  }, [registration])

  return {
    ...pwaState,
    registration,
    requestBackgroundSync,
    requestNotificationPermission,
    sendNotification,
    shareContent,
    getAppShortcuts,
    addToContentIndex,
    getCacheInfo,
    clearAllCaches,
    updateApp,
    isPWASupported: isPWASupported()
  }
}

export default PWAManager