'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { useMapStore } from '@/store/mapStore'

interface TouchGesturesProps {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onDoubleTap?: () => void
  onLongPress?: (x: number, y: number) => void
  onPinch?: (scale: number, centerX: number, centerY: number) => void
}

interface TouchPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

const TouchGestures: React.FC<TouchGesturesProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onDoubleTap,
  onLongPress,
  onPinch
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map())
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { mapInstance } = useMapStore()

  // Gesture configuration
  const config = {
    swipe: {
      minDistance: 50,
      maxTime: 500,
      maxVerticalMovement: 100
    },
    doubleTap: {
      maxDelay: 300,
      maxDistance: 30
    },
    longPress: {
      minDuration: 500,
      maxMovement: 10
    },
    pinch: {
      minPointers: 2
    }
  }

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  // Calculate center point of multiple touches
  const getCenter = useCallback((touches: TouchPoint[]) => {
    const sumX = touches.reduce((sum, touch) => sum + touch.x, 0)
    const sumY = touches.reduce((sum, touch) => sum + touch.y, 0)
    return {
      x: sumX / touches.length,
      y: sumY / touches.length
    }
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()

    const touches = Array.from(e.touches)
    const currentTime = Date.now()

    // Clear existing long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
    }

    // Store touch points
    touches.forEach(touch => {
      touchesRef.current.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        timestamp: currentTime
      })
    })

    // Handle single touch gestures
    if (touches.length === 1) {
      const touch = touches[0]

      // Check for double tap
      if (lastTapRef.current) {
        const timeDiff = currentTime - lastTapRef.current.time
        const distance = Math.sqrt(
          Math.pow(touch.clientX - lastTapRef.current.x, 2) +
          Math.pow(touch.clientY - lastTapRef.current.y, 2)
        )

        if (timeDiff < config.doubleTap.maxDelay && distance < config.doubleTap.maxDistance) {
          onDoubleTap?.()
          lastTapRef.current = null

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10])
          }
          return
        }
      }

      // Set up long press timer
      longPressTimerRef.current = setTimeout(() => {
        onLongPress?.(touch.clientX, touch.clientY)

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }, config.longPress.minDuration)

      // Store last tap for double tap detection
      lastTapRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: currentTime
      }
    }
  }, [onDoubleTap, onLongPress, config])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()

    const touches = Array.from(e.touches)
    const currentTime = Date.now()

    // Update touch points
    touches.forEach(touch => {
      const existingTouch = touchesRef.current.get(touch.identifier)
      if (existingTouch) {
        touchesRef.current.set(touch.identifier, {
          ...existingTouch,
          x: touch.clientX,
          y: touch.clientY
        })
      }
    })

    // Check for long press movement
    if (touches.length === 1 && longPressTimerRef.current) {
      const touch = touches[0]
      const startTouch = touchesRef.current.get(touch.identifier)

      if (startTouch) {
        const movement = Math.sqrt(
          Math.pow(touch.clientX - startTouch.x, 2) +
          Math.pow(touch.clientY - startTouch.y, 2)
        )

        if (movement > config.longPress.maxMovement) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }
    }

    // Handle pinch gesture
    if (touches.length >= 2 && onPinch) {
      const touchPoints = touches.map(touch => touchesRef.current.get(touch.identifier)).filter(Boolean) as TouchPoint[]

      if (touchPoints.length >= 2) {
        const startTouches = touchPoints.map(point => ({
          ...point,
          timestamp: point.timestamp
        }))

        const currentDistance = getDistance(touchPoints[0], touchPoints[1])
        const startDistance = getDistance(startTouches[0], startTouches[1])

        if (startDistance > 0) {
          const scale = currentDistance / startDistance
          const center = getCenter(touchPoints)

          onPinch(scale, center.x, center.y)
        }
      }
    }
  }, [onPinch, getDistance, getCenter, config])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()

    const touches = Array.from(e.touches)
    const changedTouches = Array.from(e.changedTouches)
    const currentTime = Date.now()

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Remove ended touches
    changedTouches.forEach(touch => {
      touchesRef.current.delete(touch.identifier)
    })

    // Handle swipe gesture
    if (changedTouches.length === 1 && touches.length === 0) {
      const touch = changedTouches[0]
      const startTouch = touchesRef.current.get(touch.identifier)

      if (startTouch) {
        const duration = currentTime - startTouch.timestamp
        const distanceX = touch.clientX - startTouch.x
        const distanceY = touch.clientY - startTouch.y

        // Check if it's a valid swipe
        if (
          duration < config.swipe.maxTime &&
          Math.abs(distanceX) > config.swipe.minDistance &&
          Math.abs(distanceY) < config.swipe.maxVerticalMovement
        ) {
          if (distanceX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }

          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(20)
          }
        }
      }
    }

    // Clear touches if no active touches
    if (touches.length === 0) {
      touchesRef.current.clear()
    }
  }, [onSwipeLeft, onSwipeRight, config])

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className="absolute inset-0 touch-none"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    />
  )
}

export default TouchGestures