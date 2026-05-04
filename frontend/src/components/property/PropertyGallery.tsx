'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Property } from '@/types'

interface PropertyGalleryProps {
  property: Property
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Mock images - in real app, these would come from property.images
  const images = property.images && property.images.length > 0
    ? property.images
    : [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1400',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1400',
        'https://images.unsplash.com/photo-1516455207990-7a41e1d4fcc3?w=1400',
        'https://images.unsplash.com/photo-1460932656007-374ff3409236?w=1400',
      ]

  const currentImage = images[selectedImageIndex]

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden aspect-video">
        <Image
          src={currentImage}
          alt={`${property.title} - Image ${selectedImageIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {/* Image Counter */}
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {selectedImageIndex + 1} / {images.length}
        </div>

        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-2 rounded-full transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3 md:grid-cols-6">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative w-full aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              index === selectedImageIndex
                ? 'border-primary-600'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Image Status */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing{' '}
          <span className="font-semibold text-gray-900">{images.length} photos</span>
        </span>
        <button className="text-primary-600 hover:text-primary-700 font-semibold">
          View Virtual Tour →
        </button>
      </div>
    </div>
  )
}
