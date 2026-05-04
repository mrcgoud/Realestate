'use client'

import { useState, useEffect, useCallback } from 'react'
import { LngLatBounds, LngLat } from 'maplibre-gl'
import { isMobileDevice } from '@/lib/mobileUtils'

export interface OfflineRegion {
  id: string
  name: string
  bounds: LngLatBounds
  zoomLevels: [number, number]
  downloadedTiles: number
  totalTiles: number
  lastAccessed: Date
  expiresAt: Date
  sizeBytes: number
  status: 'pending' | 'downloading' | 'complete' | 'error'
}

interface OfflineMapManagerProps {
  mapInstance: any // MapLibre GL map instance
  onRegionUpdate?: (region: OfflineRegion) => void
  onDownloadProgress?: (regionId: string, progress: number) => void
}

const OfflineMapManager: React.FC<OfflineMapManagerProps> = ({
  mapInstance,
  onRegionUpdate,
  onDownloadProgress
}) => {
  const [regions, setRegions] = useState<OfflineRegion[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [storageQuota, setStorageQuota] = useState({ used: 0, available: 0 })
  const [isDownloading, setIsDownloading] = useState(false)

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    updateOnlineStatus()

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load saved regions from storage
  useEffect(() => {
    loadSavedRegions()
    updateStorageQuota()
  }, [])

  // Update storage quota
  const updateStorageQuota = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        setStorageQuota({
          used: estimate.usage || 0,
          available: estimate.quota || 0
        })
      } catch (error) {
        console.warn('Storage estimation not available:', error)
      }
    }
  }, [])

  // Load saved regions from IndexedDB
  const loadSavedRegions = useCallback(async () => {
    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['regions'], 'readonly')
      const store = transaction.objectStore('regions')
      const request = store.getAll()

      request.onsuccess = () => {
        const savedRegions = request.result.map(region => ({
          ...region,
          bounds: LngLatBounds.convert(region.bounds),
          lastAccessed: new Date(region.lastAccessed),
          expiresAt: new Date(region.expiresAt)
        }))
        setRegions(savedRegions)
      }
    } catch (error) {
      console.error('Failed to load saved regions:', error)
    }
  }, [])

  // Save region to storage
  const saveRegion = useCallback(async (region: OfflineRegion) => {
    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['regions'], 'readwrite')
      const store = transaction.objectStore('regions')

      await store.put({
        ...region,
        bounds: region.bounds.toArray(),
        lastAccessed: region.lastAccessed.toISOString(),
        expiresAt: region.expiresAt.toISOString()
      })

      setRegions(prev => {
        const existing = prev.findIndex(r => r.id === region.id)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = region
          return updated
        }
        return [...prev, region]
      })

      onRegionUpdate?.(region)
    } catch (error) {
      console.error('Failed to save region:', error)
    }
  }, [onRegionUpdate])

  // Calculate tiles for region
  const calculateTilesForRegion = useCallback((bounds: LngLatBounds, zoomLevels: [number, number]): number => {
    const [minZoom, maxZoom] = zoomLevels
    let totalTiles = 0

    for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
      const tiles = Math.pow(2, zoom)
      const west = Math.floor((bounds.getWest() + 180) / 360 * tiles)
      const east = Math.floor((bounds.getEast() + 180) / 360 * tiles)
      const north = Math.floor((1 - Math.log(Math.tan(bounds.getNorth() * Math.PI / 180) + 1 / Math.cos(bounds.getNorth() * Math.PI / 180)) / Math.PI) / 2 * tiles)
      const south = Math.floor((1 - Math.log(Math.tan(bounds.getSouth() * Math.PI / 180) + 1 / Math.cos(bounds.getSouth() * Math.PI / 180)) / Math.PI) / 2 * tiles)

      const tileCount = (east - west + 1) * (south - north + 1)
      totalTiles += tileCount
    }

    return totalTiles
  }, [])

  // Download tiles for region
  const downloadTilesForRegion = useCallback(async (
    regionId: string,
    bounds: LngLatBounds,
    zoomLevels: [number, number]
  ) => {
    if (!isOnline || isDownloading) return

    setIsDownloading(true)

    try {
      const region: OfflineRegion = {
        id: regionId,
        name: `Region ${regionId}`,
        bounds,
        zoomLevels,
        downloadedTiles: 0,
        totalTiles: calculateTilesForRegion(bounds, zoomLevels),
        lastAccessed: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        sizeBytes: 0,
        status: 'downloading'
      }

      await saveRegion(region)

      // Get tile URLs from map
      const source = mapInstance.getSource('maplibre')
      if (!source) {
        throw new Error('Map source not found')
      }

      const tiles = source.tiles || []
      const tileUrls: string[] = []

      // Generate tile URLs for the region
      const [minZoom, maxZoom] = zoomLevels
      for (let zoom = minZoom; zoom <= maxZoom; zoom++) {
        const tilesAtZoom = Math.pow(2, zoom)
        const west = Math.floor((bounds.getWest() + 180) / 360 * tilesAtZoom)
        const east = Math.floor((bounds.getEast() + 180) / 360 * tilesAtZoom)
        const north = Math.floor((1 - Math.log(Math.tan(bounds.getNorth() * Math.PI / 180) + 1 / Math.cos(bounds.getNorth() * Math.PI / 180)) / Math.PI) / 2 * tilesAtZoom)
        const south = Math.floor((1 - Math.log(Math.tan(bounds.getSouth() * Math.PI / 180) + 1 / Math.cos(bounds.getSouth() * Math.PI / 180)) / Math.PI) / 2 * tilesAtZoom)

        for (let x = west; x <= east; x++) {
          for (let y = north; y <= south; y++) {
            tiles.forEach(tileUrl => {
              const url = tileUrl
                .replace('{z}', zoom.toString())
                .replace('{x}', x.toString())
                .replace('{y}', y.toString())
              tileUrls.push(url)
            })
          }
        }
      }

      // Download tiles in batches
      const batchSize = 10
      let downloaded = 0
      let totalSize = 0

      for (let i = 0; i < tileUrls.length; i += batchSize) {
        const batch = tileUrls.slice(i, i + batchSize)
        const promises = batch.map(async (url) => {
          try {
            const response = await fetch(url)
            if (response.ok) {
              const blob = await response.blob()
              await cacheTile(url, blob)
              totalSize += blob.size
              downloaded++
            }
          } catch (error) {
            console.warn('Failed to download tile:', url, error)
          }
        })

        await Promise.all(promises)

        // Update progress
        const progress = (downloaded / tileUrls.length) * 100
        onDownloadProgress?.(regionId, progress)

        // Update region
        region.downloadedTiles = downloaded
        region.sizeBytes = totalSize
        await saveRegion(region)
      }

      // Mark as complete
      region.status = 'complete'
      await saveRegion(region)

      // Update storage quota
      await updateStorageQuota()

    } catch (error) {
      console.error('Failed to download tiles:', error)

      // Mark as error
      const region = regions.find(r => r.id === regionId)
      if (region) {
        region.status = 'error'
        await saveRegion(region)
      }
    } finally {
      setIsDownloading(false)
    }
  }, [isOnline, isDownloading, calculateTilesForRegion, saveRegion, onDownloadProgress, updateStorageQuota, regions])

  // Cache tile in IndexedDB
  const cacheTile = useCallback(async (url: string, blob: Blob) => {
    const db = await openOfflineDB()
    const transaction = db.transaction(['tiles'], 'readwrite')
    const store = transaction.objectStore('tiles')

    await store.put({
      url,
      blob,
      timestamp: Date.now()
    })
  }, [])

  // Get offline tile
  const getOfflineTile = useCallback(async (url: string): Promise<ArrayBuffer | null> => {
    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['tiles'], 'readonly')
      const store = transaction.objectStore('tiles')
      const request = store.get(url)

      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result
          if (result && result.blob) {
            result.blob.arrayBuffer().then(resolve)
          } else {
            resolve(null)
          }
        }
        request.onerror = () => resolve(null)
      })
    } catch (error) {
      console.error('Failed to get offline tile:', error)
      return null
    }
  }, [])

  // Remove region
  const removeRegion = useCallback(async (regionId: string) => {
    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['regions'], 'readwrite')
      const store = transaction.objectStore('regions')
      await store.delete(regionId)

      setRegions(prev => prev.filter(r => r.id !== regionId))
      await updateStorageQuota()
    } catch (error) {
      console.error('Failed to remove region:', error)
    }
  }, [updateStorageQuota])

  // Clear expired tiles
  const clearExpiredTiles = useCallback(async () => {
    try {
      const db = await openOfflineDB()
      const transaction = db.transaction(['regions'], 'readwrite')
      const store = transaction.objectStore('regions')
      const request = store.getAll()

      request.onsuccess = () => {
        const regions = request.result
        const expiredRegions = regions.filter((region: any) =>
          new Date(region.expiresAt) < new Date()
        )

        expiredRegions.forEach(async (region: any) => {
          await store.delete(region.id)
        })

        setRegions(prev => prev.filter(r =>
          !expiredRegions.some((expired: any) => expired.id === r.id)
        ))
      }
    } catch (error) {
      console.error('Failed to clear expired tiles:', error)
    }
  }, [])

  // Open IndexedDB
  const openOfflineDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OfflineMaps', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Regions store
        if (!db.objectStoreNames.contains('regions')) {
          db.createObjectStore('regions', { keyPath: 'id' })
        }

        // Tiles store
        if (!db.objectStoreNames.contains('tiles')) {
          db.createObjectStore('tiles', { keyPath: 'url' })
        }
      }
    })
  }, [])

  // Create region from current view
  const createRegionFromView = useCallback(() => {
    if (!mapInstance) return

    const bounds = mapInstance.getBounds()
    const zoom = Math.round(mapInstance.getZoom())
    const regionId = `region_${Date.now()}`

    const zoomLevels: [number, number] = isMobileDevice()
      ? [Math.max(10, zoom - 2), Math.min(16, zoom + 2)]
      : [Math.max(8, zoom - 3), Math.min(18, zoom + 3)]

    downloadTilesForRegion(regionId, bounds, zoomLevels)
  }, [mapInstance, downloadTilesForRegion])

  // Get region for current location
  const getRegionForLocation = useCallback((lngLat: LngLat, radiusKm: number = 5) => {
    const bounds = new LngLatBounds()
    const latOffset = radiusKm / 111 // 1 degree ≈ 111km
    const lngOffset = radiusKm / (111 * Math.cos(lngLat.lat * Math.PI / 180))

    bounds.extend([lngLat.lng - lngOffset, lngLat.lat - latOffset])
    bounds.extend([lngLat.lng + lngOffset, lngLat.lat + latOffset])

    return bounds
  }, [])

  return {
    regions,
    isOnline,
    storageQuota,
    isDownloading,
    downloadTilesForRegion,
    removeRegion,
    clearExpiredTiles,
    createRegionFromView,
    getRegionForLocation,
    getOfflineTile
  }
}

export default OfflineMapManager