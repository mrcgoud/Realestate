'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

interface TouchPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  isDragging: boolean
  startPoint: TouchPoint | null
  currentPoint: TouchPoint | null
  velocity: { x: number; y: number }
}

interface UseMobileGesturesOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number, centerX: number, centerY: number) => void
  onDoubleTap?: (x: number, y: number) => void
  onLongPress?: (x: number, y: number) => void
  onTap?: (x: number, y: number) => void
  swipeThreshold?: number
  longPressDelay?: number
  doubleTapDelay?: number
  enableHapticFeedback?: boolean
}

export function useMobileGestures(options: UseMobileGesturesOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onDoubleTap,
    onLongPress,
    onTap,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    enableHapticFeedback = true
  } = options

  const [gestureState, setGestureState] = useState<GestureState>({
    isDragging: false,
    startPoint: null,
    currentPoint: null,
    velocity: { x: 0, y: 0 }
  })

  const touchesRef = useRef<Map<number, TouchPoint>>(new Map())
  const lastTapRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const velocityRef = useRef({ x: 0, y: 0 })

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
    if (!isMobileDevice()) return

    const touches = Array.from(e.touches)
    const currentTime = Date.now()

    // Clear existing timers
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

        if (timeDiff < doubleTapDelay && distance < 30) {
          onDoubleTap?.(touch.clientX, touch.clientY)
          lastTapRef.current = null

          if (enableHapticFeedback) {
            triggerHapticFeedback('success')
          }
          return
        }
      }

      // Set up long press timer
      longPressTimerRef.current = setTimeout(() => {
        onLongPress?.(touch.clientX, touch.clientY)

        if (enableHapticFeedback) {
          triggerHapticFeedback('medium')
        }
      }, longPressDelay)

      // Store last tap for double tap detection
      lastTapRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: currentTime
      }

      // Update gesture state
      setGestureState(prev => ({
        ...prev,
        isDragging: false,
        startPoint: {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: currentTime
        },
        currentPoint: {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: currentTime
        }
      }))
    }
  }, [onDoubleTap, onLongPress, longPressDelay, doubleTapDelay, enableHapticFeedback])

  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isMobileDevice()) return

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

    // Handle single touch move
    if (touches.length === 1) {
      const touch = touches[0]
      const startTouch = gestureState.startPoint

      if (startTouch && longPressTimerRef.current) {
        const movement = Math.sqrt(
          Math.pow(touch.clientX - startTouch.x, 2) +
          Math.pow(touch.clientY - startTouch.y, 2)
        )

        // Cancel long press if moved too much
        if (movement > 10) {
          clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }

      // Calculate velocity
      const deltaTime = currentTime - (gestureState.currentPoint?.timestamp || currentTime)
      if (deltaTime > 0) {
        velocityRef.current = {
          x: (touch.clientX - (gestureState.currentPoint?.x || touch.clientX)) / deltaTime,
          y: (touch.clientY - (gestureState.currentPoint?.y || touch.clientY)) / deltaTime
        }
      }

      // Update gesture state
      setGestureState(prev => ({
        ...prev,
        isDragging: true,
        currentPoint: {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          timestamp: currentTime
        },
        velocity: velocityRef.current
      }))
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
  }, [gestureState, onPinch, getDistance, getCenter])

  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!isMobileDevice()) return

    const touches = Array.from(e.touches)
    const changedTouches = Array.from(e.changedTouches)
    const currentTime = Date.now()

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // Handle swipe gesture
    if (changedTouches.length === 1 && touches.length === 0 && gestureState.startPoint) {
      const touch = changedTouches[0]
      const startPoint = gestureState.startPoint
      const duration = currentTime - startPoint.timestamp
      const distanceX = touch.clientX - startPoint.x
      const distanceY = touch.clientY - startPoint.y

      // Check if it's a valid swipe
      if (duration < 500 && (Math.abs(distanceX) > swipeThreshold || Math.abs(distanceY) > swipeThreshold)) {
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
          // Horizontal swipe
          if (distanceX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        } else {
          // Vertical swipe
          if (distanceY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }

        if (enableHapticFeedback) {
          triggerHapticFeedback('light')
        }
      } else if (!gestureState.isDragging && duration < 200) {
        // Simple tap
        onTap?.(touch.clientX, touch.clientY)

        if (enableHapticFeedback) {
          triggerHapticFeedback('light')
        }
      }
    }

    // Remove ended touches
    changedTouches.forEach(touch => {
      touchesRef.current.delete(touch.identifier)
    })

    // Reset gesture state
    setGestureState({
      isDragging: false,
      startPoint: null,
      currentPoint: null,
      velocity: { x: 0, y: 0 }
    })

    // Clear touches if no active touches
    if (touches.length === 0) {
      touchesRef.current.clear()
    }
  }, [gestureState, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, swipeThreshold, enableHapticFeedback])

  // Set up event listeners on element
  const attachToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return

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

  return {
    gestureState,
    attachToElement,
    isMobile: isMobileDevice()
  }
}