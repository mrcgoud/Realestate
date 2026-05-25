'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Navigation,
} from 'lucide-react';

interface MobileMapControlsProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetCompass?: () => void;
  onLocate?: () => void;
  onNavigate?: () => void;
  isLoading?: boolean;
}

const MobileMapControls: React.FC<MobileMapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetCompass,
  onLocate,
  onNavigate,
  isLoading = false,
}) => {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      {/* Zoom In */}
      <button
        onClick={onZoomIn}
        disabled={isLoading}
        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 transition-shadow"
        aria-label="Zoom in"
      >
        <ZoomIn size={20} className="text-gray-700" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={isLoading}
        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 transition-shadow"
        aria-label="Zoom out"
      >
        <ZoomOut size={20} className="text-gray-700" />
      </button>

      {/* Reset Compass */}
      <button
        onClick={onResetCompass}
        disabled={isLoading}
        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 transition-shadow"
        aria-label="Reset compass"
      >
        <Compass size={20} className="text-gray-700" />
      </button>

      {/* Locate User */}
      <button
        onClick={onLocate}
        disabled={isLoading}
        className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 transition-shadow"
        aria-label="Show my location"
      >
        <MapPin size={20} className="text-gray-700" />
      </button>

      {/* Start Navigation */}
      <button
        onClick={onNavigate}
        disabled={isLoading}
        className="p-3 bg-blue-500 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 transition-shadow"
        aria-label="Start navigation"
      >
        <Navigation size={20} className="text-white" />
      </button>
    </div>
  );
};

export default MobileMapControls;
