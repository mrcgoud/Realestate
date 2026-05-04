'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronUp, ChevronDown, X } from 'lucide-react'

export type SheetState = 'closed' | 'peek' | 'full'

interface BottomSheetProps {
  isOpen: boolean
  state: SheetState
  onStateChange: (state: SheetState) => void
  children: React.ReactNode
  snapPoints?: number[]
  className?: string
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  state,
  onStateChange,
  children,
  snapPoints = [0, 120, window.innerHeight * 0.8],
  className = ''
}) => {
  const [height, setHeight] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)

  // Calculate snap points based on viewport
  const getSnapPoints = useCallback(() => {
    const viewportHeight = window.innerHeight
    return [
      0, // closed
      Math.min(120, viewportHeight * 0.3), // peek
      Math.min(viewportHeight * 0.8, viewportHeight - 100) // full
    ]
  }, [])

  const currentSnapPoints = getSnapPoints()

  // Handle state changes
  useEffect(() => {
    const targetHeight = currentSnapPoints[state === 'closed' ? 0 : state === 'peek' ? 1 : 2]
    setHeight(targetHeight)
  }, [state, currentSnapPoints])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newSnapPoints = getSnapPoints()
      const currentIndex = currentSnapPoints.indexOf(height)
      if (currentIndex !== -1) {
        setHeight(newSnapPoints[currentIndex])
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height, currentSnapPoints, getSnapPoints])

  // Find closest snap point
  const findClosestSnapPoint = useCallback((dragHeight: number) => {
    const distances = currentSnapPoints.map(point => Math.abs(point - dragHeight))
    const minDistance = Math.min(...distances)
    const closestIndex = distances.indexOf(minDistance)

    if (closestIndex === 0) return 'closed'
    if (closestIndex === 1) return 'peek'
    return 'full'
  }, [currentSnapPoints])

  // Handle drag end
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    setIsDragging(false)
    const newHeight = height - info.offset.y
    const clampedHeight = Math.max(0, Math.min(newHeight, currentSnapPoints[2]))
    const newState = findClosestSnapPoint(clampedHeight)

    onStateChange(newState)

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [height, currentSnapPoints, findClosestSnapPoint, onStateChange])

  // Handle drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    if (navigator.vibrate) {
      navigator.vibrate(5)
    }
  }, [])

  // Handle close
  const handleClose = useCallback(() => {
    onStateChange('closed')
  }, [onStateChange])

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleBackdropClick}
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `calc(100% - ${height}px)` }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8
            }}
            drag="y"
            dragConstraints={{ top: -currentSnapPoints[2], bottom: 0 }}
            dragElastic={0.1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl ${className}`}
            style={{
              maxHeight: '90vh',
              touchAction: 'none'
            }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {state === 'peek' && (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                )}
                {state === 'full' && (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Map Controls
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div
              className="px-6 py-4 overflow-y-auto"
              style={{
                maxHeight: `calc(${height}px - 120px)`,
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default BottomSheet