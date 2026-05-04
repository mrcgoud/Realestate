'use client'

import { useState, useEffect, useCallback } from 'react'
import { triggerHapticFeedback, isMobileDevice } from '@/lib/mobileUtils'

interface BiometricAuthProps {
  onSuccess: (credential: any) => void
  onError: (error: string) => void
  mode: 'login' | 'register' | 'verify'
  userId?: string
}

interface BiometricState {
  isSupported: boolean
  isAvailable: boolean
  authenticators: string[]
  isAuthenticating: boolean
  error: string | null
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  onSuccess,
  onError,
  mode,
  userId
}) => {
  const [state, setState] = useState<BiometricState>({
    isSupported: false,
    isAvailable: false,
    authenticators: [],
    isAuthenticating: false,
    error: null
  })

  // Check biometric support
  const checkBiometricSupport = useCallback(async () => {
    if (!isMobileDevice()) {
      setState(prev => ({
        ...prev,
        error: 'Biometric authentication requires a mobile device'
      }))
      return
    }

    if (!window.PublicKeyCredential) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'WebAuthn not supported'
      }))
      return
    }

    try {
      // Check if biometric authentication is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      const uvpa = await PublicKeyCredential.isConditionalMediationAvailable?.() || false

      setState(prev => ({
        ...prev,
        isSupported: true,
        isAvailable: available || uvpa
      }))

      // Get available authenticators
      const authenticators = []
      if (available) authenticators.push('platform')
      if (uvpa) authenticators.push('conditional')

      setState(prev => ({ ...prev, authenticators }))

    } catch (error) {
      console.error('Biometric support check failed:', error)
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: 'Failed to check biometric support'
      }))
    }
  }, [])

  // Create credential for registration
  const createCredential = useCallback(async () => {
    if (!state.isSupported) return

    setState(prev => ({ ...prev, isAuthenticating: true, error: null }))

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'RealEstate Platform',
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(16), // Would be user ID in production
            name: userId || 'user@example.com',
            displayName: 'Real Estate User'
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256
            { alg: -257, type: 'public-key' } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      })

      setState(prev => ({ ...prev, isAuthenticating: false }))
      onSuccess(credential)
      triggerHapticFeedback('success')

    } catch (error: any) {
      console.error('Credential creation failed:', error)
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: error.message || 'Failed to create credential'
      }))
      onError(error.message || 'Registration failed')
      triggerHapticFeedback('error')
    }
  }, [state.isSupported, userId, onSuccess, onError])

  // Get credential for authentication
  const getCredential = useCallback(async () => {
    if (!state.isSupported) return

    setState(prev => ({ ...prev, isAuthenticating: true, error: null }))

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          allowCredentials: [] // Empty for any credential
        }
      })

      setState(prev => ({ ...prev, isAuthenticating: false }))
      onSuccess(credential)
      triggerHapticFeedback('success')

    } catch (error: any) {
      console.error('Credential retrieval failed:', error)
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: error.message || 'Failed to authenticate'
      }))
      onError(error.message || 'Authentication failed')
      triggerHapticFeedback('error')
    }
  }, [state.isSupported, onSuccess, onError])

  // Handle authentication based on mode
  const handleAuth = useCallback(() => {
    if (mode === 'register') {
      createCredential()
    } else {
      getCredential()
    }
  }, [mode, createCredential, getCredential])

  // Initialize on mount
  useEffect(() => {
    checkBiometricSupport()
  }, [checkBiometricSupport])

  // Get authenticator display name
  const getAuthenticatorName = (type: string) => {
    switch (type) {
      case 'platform':
        return 'Device Biometrics (Fingerprint/Face)'
      case 'conditional':
        return 'Platform Authenticator'
      default:
        return 'Biometric Authentication'
    }
  }

  // Get mode-specific text
  const getModeText = () => {
    switch (mode) {
      case 'register':
        return {
          title: 'Set Up Biometric Login',
          description: 'Register your fingerprint or face for quick and secure access',
          buttonText: 'Register Biometrics'
        }
      case 'login':
        return {
          title: 'Biometric Login',
          description: 'Use your fingerprint or face to sign in',
          buttonText: 'Authenticate'
        }
      case 'verify':
        return {
          title: 'Verify Identity',
          description: 'Confirm your identity with biometrics',
          buttonText: 'Verify'
        }
      default:
        return {
          title: 'Biometric Authentication',
          description: 'Secure authentication using biometrics',
          buttonText: 'Authenticate'
        }
    }
  }

  const modeText = getModeText()

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-4">
          {state.isAuthenticating ? '🔄' : '🔐'}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {modeText.title}
        </h2>
        <p className="text-gray-600 text-sm">
          {modeText.description}
        </p>
      </div>

      {/* Authenticator Info */}
      {state.isSupported && state.authenticators.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Available Methods:
          </h3>
          <div className="space-y-2">
            {state.authenticators.map((auth, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <span className="mr-2">✓</span>
                {getAuthenticatorName(auth)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{state.error}</p>
        </div>
      )}

      {/* Authentication Button */}
      {state.isAvailable && (
        <button
          onClick={handleAuth}
          disabled={state.isAuthenticating}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {state.isAuthenticating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {mode === 'register' ? 'Registering...' : 'Authenticating...'}
            </div>
          ) : (
            modeText.buttonText
          )}
        </button>
      )}

      {/* Fallback Options */}
      {!state.isAvailable && state.isSupported && (
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-4">
            Biometric authentication is not available on this device.
          </p>
          <button
            onClick={() => onError('Biometric authentication not available')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Use Alternative Login
          </button>
        </div>
      )}

      {/* Not Supported */}
      {!state.isSupported && (
        <div className="text-center">
          <div className="text-3xl mb-4">📱</div>
          <p className="text-gray-600 text-sm mb-4">
            Biometric authentication requires a compatible device and browser.
          </p>
          <button
            onClick={() => onError('Biometric authentication not supported')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Continue with Password
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Your biometric data is processed locally and never stored on our servers.
          Authentication is handled securely by your device's built-in security features.
        </p>
      </div>
    </div>
  )
}

export default BiometricAuth