'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { usePropertyStore } from '@/store/propertyStore'
import { useToast } from '@/components/providers/ToastProvider'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyInfo } from '@/components/property/PropertyInfo'
import { PropertyMap } from '@/components/property/PropertyMap'
import { PricePrediction } from '@/components/property/PricePrediction'
import { InquiryForm } from '@/components/forms/InquiryForm'
import { RelatedProperties } from '@/components/property/RelatedProperties'
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import Link from 'next/link'

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string
  
  const { currentProperty, fetchProperty, isLoading, error, isFavorite, addFavorite, removeFavorite } = usePropertyStore()
  const { addToast } = useToast()
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(false)

  useEffect(() => {
    if (propertyId) {
      fetchProperty(propertyId)
    }
  }, [propertyId])

  useEffect(() => {
    if (currentProperty) {
      setIsFavoriteLocal(isFavorite(currentProperty.id))
    }
  }, [currentProperty])

  const handleToggleFavorite = async () => {
    if (!currentProperty) return

    try {
      if (isFavoriteLocal) {
        await removeFavorite(currentProperty.id)
        setIsFavoriteLocal(false)
        addToast('Removed from favorites', 'success')
      } else {
        await addFavorite(currentProperty.id)
        setIsFavoriteLocal(true)
        addToast('Added to favorites', 'success')
      }
    } catch (err) {
      addToast('Error updating favorites', 'error')
    }
  }

  const handleShare = async () => {
    if (!currentProperty) return

    const text = `Check out this property: ${currentProperty.title} - ${currentProperty.city}, ${currentProperty.state}`
    const url = `${window.location.origin}/property/${currentProperty.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProperty.title,
          text: text,
          url: url,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      addToast('Link copied to clipboard', 'success')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (error || !currentProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/search" className="btn btn-primary px-6 py-2 inline-block">
            Browse Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Search
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share property"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFavoriteLocal ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavoriteLocal ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Gallery */}
        <PropertyGallery property={currentProperty} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <PropertyInfo property={currentProperty} />

            {/* Map */}
            <PropertyMap property={currentProperty} />

            {/* Price Prediction */}
            <PricePrediction property={currentProperty} />
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Form */}
            <InquiryForm propertyId={currentProperty.id} />

            {/* Property Stats */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Property Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold text-gray-900">{currentProperty.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saved</span>
                  <span className="font-semibold text-gray-900">{currentProperty.favorites}</span>
                </div>
                {currentProperty.yearBuilt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year Built</span>
                    <span className="font-semibold text-gray-900">{currentProperty.yearBuilt}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Links */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share</h3>
              <div className="grid grid-cols-3 gap-2">
                <ShareButton icon="f" label="Facebook" />
                <ShareButton icon="𝕏" label="Twitter" />
                <ShareButton icon="*" label="Copy Link" onClick={handleShare} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        <RelatedProperties property={currentProperty} />
      </div>
    </div>
  )
}

function ShareButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors group"
    >
      <span className="text-lg font-semibold text-gray-600 group-hover:text-primary-600">{icon}</span>
      <span className="text-xs text-gray-600 group-hover:text-primary-600 text-center">{label}</span>
    </button>
  )
}
