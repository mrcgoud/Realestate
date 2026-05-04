'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { triggerHapticFeedback, isMobileDevice } from '@/lib/mobileUtils'

interface GestureEvent {
  type: 'pinch' | 'rotate' | 'pan' | 'swipe' | 'tap' | 'double-tap' | 'long-press'
  scale?: number
  rotation?: number
  deltaX?: number
  deltaY?: number
  velocityX?: number
  velocityY?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  fingers?: number
}

interface AdvancedGesturesProps {
  onGesture: (event: GestureEvent) => void
  children: React.ReactNode
  className?: string
  enablePinch?: boolean
  enableRotate?: boolean
  enablePan?: boolean
  enableSwipe?: boolean
  enableMultiTouch?: boolean
}

interface TouchPoint {
  id: number
  x: number
  y: number
  timestamp: number
}

interface GestureState {
  touches: TouchPoint[]
  startTouches: TouchPoint[]
  isGesturing: boolean
  lastGestureTime: number
  scale: number
  rotation: number
  panStart: { x: number; y: number }
  lastTapTime: number
  tapCount: number
}

const AdvancedGestures: React.FC<AdvancedGesturesProps> = ({
  onGesture,
  children,
  className = '',
  enablePinch = true,
  enableRotate = true,
  enablePan = true,
  enableSwipe = true,
  enableMultiTouch = true
}) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    touches: [],
    startTouches: [],
    isGesturing: false,
    lastGestureTime: 0,
    scale: 1,
    rotation: 0,
    panStart: { x: 0, y: 0 },
    lastTapTime: 0,
    tapCount: 0
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<NodeJS.Timeout>()
  const gestureTimeoutRef = useRef<NodeJS.Timeout>()

  // Calculate distance between two points
  const getDistance = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  // Calculate angle between two points
  const getAngle = useCallback((p1: TouchPoint, p2: TouchPoint) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x)
  }, [])

  // Get center point of touches
  const getCenter = useCallback((touches: TouchPoint[]) => {
    const sum = touches.reduce(
      (acc, touch) => ({ x: acc.x + touch.x, y: acc.y + touch.y }),
      { x: 0, y: 0 }
    )
    return {
      x: sum.x / touches.length,
      y: sum.y / touches.length
    }
  }, [])

  // Convert TouchEvent to TouchPoint array
  const touchesToPoints = useCallback((touches: TouchList): TouchPoint[] => {
    return Array.from(touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    }))
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    event.preventDefault()

    const newTouches = touchesToPoints(event.touches)
    const now = Date.now()

    setGestureState(prev => {
      const updatedTouches = [...prev.touches]

      // Add new touches
      newTouches.forEach(newTouch => {
        const existingIndex = updatedTouches.findIndex(t => t.id === newTouch.id)
        if (existingIndex === -1) {
          updatedTouches.push(newTouch)
        }
      })

      // Check for double tap
      if (prev.lastTapTime && now - prev.lastTapTime < 300) {
        const newTapCount = prev.tapCount + 1
        if (newTapCount === 2) {
          onGesture({ type: 'double-tap', fingers: updatedTouches.length })
          triggerHapticFeedback('light')
        }
        return {
          ...prev,
          touches: updatedTouches,
          startTouches: [...updatedTouches],
          tapCount: newTapCount,
          lastTapTime: now
        }
      }

      // Start long press timer
      if (updatedTouches.length === 1) {
        longPressTimerRef.current = setTimeout(() => {
          onGesture({ type: 'long-press' })
          triggerHapticFeedback('medium')
        }, 500)
      }

      return {
        ...prev,
        touches: updatedTouches,
        startTouches: [...updatedTouches],
        isGesturing: updatedTouches.length > 1,
        panStart: getCenter(updatedTouches),
        tapCount: 1,
        lastTapTime: now
      }
    })
  }, [touchesToPoints, getCenter, onGesture])

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault()

    const newTouches = touchesToPoints(event.touches)

    setGestureState(prev => {
      if (newTouches.length === 0) return prev

      // Clear long press timer if moving
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = undefined
      }

      const updatedTouches = [...prev.touches]

      // Update existing touches
      newTouches.forEach(newTouch => {
        const existingIndex = updatedTouches.findIndex(t => t.id === newTouch.id)
        if (existingIndex !== -1) {
          updatedTouches[existingIndex] = newTouch
        }
      })

      // Handle gestures
      if (updatedTouches.length >= 2 && enableMultiTouch) {
        const startTouches = prev.startTouches

        if (startTouches.length >= 2) {
          // Pinch gesture
          if (enablePinch) {
            const startDistance = getDistance(startTouches[0], startTouches[1])
            const currentDistance = getDistance(updatedTouches[0], updatedTouches[1])
            const scale = currentDistance / startDistance

            if (Math.abs(scale - prev.scale) > 0.1) {
              onGesture({
                type: 'pinch',
                scale,
                fingers: updatedTouches.length
              })
            }
          }

          // Rotate gesture
          if (enableRotate) {
            const startAngle = getAngle(startTouches[0], startTouches[1])
            const currentAngle = getAngle(updatedTouches[0], updatedTouches[1])
            const rotation = (currentAngle - startAngle) * (180 / Math.PI)

            if (Math.abs(rotation - prev.rotation) > 5) {
              onGesture({
                type: 'rotate',
                rotation,
                fingers: updatedTouches.length
              })
            }
          }
        }
      } else if (updatedTouches.length === 1 && enablePan) {
        // Pan gesture
        const deltaX = updatedTouches[0].x - prev.panStart.x
        const deltaY = updatedTouches[0].y - prev.panStart.y

        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          onGesture({
            type: 'pan',
            deltaX,
            deltaY,
            fingers: 1
          })
        }
      }

      return {
        ...prev,
        touches: updatedTouches,
        scale: updatedTouches.length >= 2 ?
          getDistance(updatedTouches[0], updatedTouches[1]) / getDistance(startTouches[0], startTouches[1]) : 1,
        rotation: updatedTouches.length >= 2 ?
          (getAngle(updatedTouches[0], updatedTouches[1]) - getAngle(startTouches[0], startTouches[1])) * (180 / Math.PI) : 0
      }
    })
  }, [touchesToPoints, getDistance, getAngle, enablePinch, enableRotate, enablePan, enableMultiTouch, onGesture])

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    event.preventDefault()

    const remainingTouches = touchesToPoints(event.touches)
    const now = Date.now()

    setGestureState(prev => {
      // Clear timers
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = undefined
      }

      // Handle swipe gesture
      if (enableSwipe && prev.touches.length === 1 && remainingTouches.length === 0) {
        const touch = prev.touches[0]
        const duration = now - touch.timestamp
        const deltaX = touch.x - prev.panStart.x
        const deltaY = touch.y - prev.panStart.y

        if (duration < 300 && (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50)) {
          const velocityX = deltaX / duration
          const velocityY = deltaY / duration

          let direction: 'up' | 'down' | 'left' | 'right' = 'right'
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left'
          } else {
            direction = deltaY > 0 ? 'down' : 'up'
          }

          onGesture({
            type: 'swipe',
            deltaX,
            deltaY,
            velocityX,
            velocityY,
            direction,
            fingers: 1
          })

          triggerHapticFeedback('light')
        }
      }

      // Handle single tap
      if (prev.touches.length === 1 && remainingTouches.length === 0) {
        const timeSinceLastTap = now - prev.lastTapTime
        if (timeSinceLastTap > 300) {
          // Single tap (not part of double tap)
          setTimeout(() => {
            setGestureState(current => {
              if (current.tapCount === 1) {
                onGesture({ type: 'tap', fingers: 1 })
                return { ...current, tapCount: 0 }
              }
              return current
            })
          }, 300)
        }
      }

      // Reset gesture state after delay
      gestureTimeoutRef.current = setTimeout(() => {
        setGestureState(current => ({
          ...current,
          isGesturing: false,
          scale: 1,
          rotation: 0
        }))
      }, 100)

      return {
        ...prev,
        touches: remainingTouches,
        isGesturing: remainingTouches.length > 1
      }
    })
  }, [touchesToPoints, enableSwipe, onGesture])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current)
      }
    }
  }, [])

  // Only enable on mobile devices
  if (!isMobileDevice()) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        touchAction: 'none', // Prevent default touch behaviors
        userSelect: 'none'
      }}
    >
      {children}

      {/* Debug overlay (only in development) */}
      {process.env.NODE_ENV === 'development' && gestureState.isGesturing && (
        <div className="absolute top-4 right-4 bg-black/70 text-white p-2 rounded text-xs font-mono">
          <div>Touches: {gestureState.touches.length}</div>
          <div>Scale: {gestureState.scale.toFixed(2)}</div>
          <div>Rotation: {gestureState.rotation.toFixed(1)}°</div>
        </div>
      )}
    </div>
  )
}

export default AdvancedGestures