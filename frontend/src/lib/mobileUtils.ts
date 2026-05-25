/**
 * Mobile utility functions for responsive UI and mobile-specific features
 */

/**
 * Detect if running on mobile device
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Get viewport dimensions
 */
export const getViewportSize = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Check if viewport is mobile size (< 768px width)
 */
export const isMobileViewport = (): boolean => {
  const { width } = getViewportSize();
  return width < 768;
};

/**
 * Check if viewport is tablet size (768px - 1024px)
 */
export const isTabletViewport = (): boolean => {
  const { width } = getViewportSize();
  return width >= 768 && width < 1024;
};

/**
 * Handle safe area insets for notch/safe zone
 */
export const getSafeAreaInsets = (): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const root = document.documentElement;
  return {
    top: parseInt(
      getComputedStyle(root).getPropertyValue('--safe-area-inset-top') || '0',
      10
    ),
    right: parseInt(
      getComputedStyle(root).getPropertyValue('--safe-area-inset-right') || '0',
      10
    ),
    bottom: parseInt(
      getComputedStyle(root).getPropertyValue('--safe-area-inset-bottom') || '0',
      10
    ),
    left: parseInt(
      getComputedStyle(root).getPropertyValue('--safe-area-inset-left') || '0',
      10
    ),
  };
};

/**
 * Disable scroll on body element (useful for modals)
 */
export const disableBodyScroll = (): void => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'hidden';
};

/**
 * Enable scroll on body element
 */
export const enableBodyScroll = (): void => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = 'auto';
};

/**
 * Detect if user prefers dark mode
 */
export const prefersDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
};

export default {
  isMobileDevice,
  getViewportSize,
  isMobileViewport,
  isTabletViewport,
  getSafeAreaInsets,
  disableBodyScroll,
  enableBodyScroll,
  prefersDarkMode,
  prefersReducedMotion,
  formatBytes,
};
