'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Layers, Plus } from 'lucide-react'
import { useMapStore } from '@/store/mapStore'
import { isMobileDevice } from '@/lib/mobileUtils'
import BottomSheet, { SheetState } from './BottomSheet'
import MobileMapControls from './MobileMapControls'

const MobileMapInterface: React.FC = () => {
  const [bottomSheetState, setBottomSheetState] = useState<SheetState>('closed')
  const { setBottomSheetState: setStoreBottomSheetState, bottomSheetOpen } = useMapStore()
  const isMobile = isMobileDevice()

  // Update store when bottom sheet state changes
  useEffect(() => {
    setStoreBottomSheetState(bottomSheetState !== 'closed', getSheetHeight(bottomSheetState))
  }, [bottomSheetState, setStoreBottomSheetState])

  // Handle search click
  const handleSearchClick = () => {
    // TODO: Implement search functionality
    console.log('Search clicked')
  }

  // Handle location click
  const handleLocationClick = () => {
    // TODO: Implement location functionality
    console.log('Location clicked')
  }

  // Handle favorites click
  const handleFavoritesClick = () => {
    // TODO: Implement favorites functionality
    console.log('Favorites clicked')
  }

  // Get height for different sheet states
  const getSheetHeight = (state: SheetState): number => {
    const viewportHeight = window.innerHeight
    switch (state) {
      case 'closed':
        return 0
      case 'peek':
        return Math.min(120, viewportHeight * 0.3)
      case 'full':
        return Math.min(viewportHeight * 0.8, viewportHeight - 100)
      default:
        return 120
    }
  }

  // Don't render on desktop
  if (!isMobile) {
    return null
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setBottomSheetState(bottomSheetState === 'closed' ? 'peek' : 'closed')}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white"
        style={{ minWidth: '56px', minHeight: '56px' }}
      >
        <Layers className="w-6 h-6" />
      </motion.button>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={bottomSheetState !== 'closed'}
        state={bottomSheetState}
        onStateChange={setBottomSheetState}
      >
        <MobileMapControls
          onSearchClick={handleSearchClick}
          onLocationClick={handleLocationClick}
          onFavoritesClick={handleFavoritesClick}
        />
      </BottomSheet>
    </>
  )
}

export default MobileMapInterface