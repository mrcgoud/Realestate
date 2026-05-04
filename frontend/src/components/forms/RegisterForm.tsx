'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/providers/ToastProvider'
import { validateEmail } from '@/lib/utils'
import { Eye, EyeOff, Check, X } from 'lucide-react'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export function RegisterForm() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const { addToast } = useToast()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[!@#$%^&*]/.test(password)) score++

    const strengths: PasswordStrength[] = [
      { score: 0, label: 'Very Weak', color: 'red' },
      { score: 1, label: 'Weak', color: 'red' },
      { score: 2, label: 'Fair', color: 'yellow' },
      { score: 3, label: 'Good', color: 'blue' },
      { score: 4, label: 'Strong', color: 'green' },
      { score: 5, label: 'Very Strong', color: 'green' },
    ]
    return strengths[Math.min(score, 5)]
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      addToast('Account created successfully!', 'success')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      addToast(errorMessage, 'error')
    }
  }

  const passwordStrength = calculatePasswordStrength(formData.password)
  const hasPasswordRequirements =
    formData.password.length >= 8 &&
    /[a-z]/.test(formData.password) &&
    /[A-Z]/.test(formData.password) &&
    /\d/.test(formData.password)

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => {
            setFormData({ ...formData, firstName: e.target.value })
            if (validationErrors.firstName) {
              const newErrors = { ...validationErrors }
              delete newErrors.firstName
              setValidationErrors(newErrors)
            }
          }}
          placeholder="John"
          className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            validationErrors.firstName
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
        {validationErrors.firstName && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => {
            setFormData({ ...formData, lastName: e.target.value })
            if (validationErrors.lastName) {
              const newErrors = { ...validationErrors }
              delete newErrors.lastName
              setValidationErrors(newErrors)
            }
          }}
          placeholder="Doe"
          className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            validationErrors.lastName
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
        {validationErrors.lastName && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value })
            if (validationErrors.email) {
              const newErrors = { ...validationErrors }
              delete newErrors.email
              setValidationErrors(newErrors)
            }
          }}
          placeholder="you@example.com"
          className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            validationErrors.email
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        />
        {validationErrors.email && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value })
              if (validationErrors.password) {
                const newErrors = { ...validationErrors }
                delete newErrors.password
                setValidationErrors(newErrors)
              }
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              validationErrors.password
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Strength */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Strength:</span>
              <span className={`text-xs font-semibold text-${passwordStrength.color}-600`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < passwordStrength.score
                      ? `bg-${passwordStrength.color}-500`
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {validationErrors.password && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value })
              if (validationErrors.confirmPassword) {
                const newErrors = { ...validationErrors }
                delete newErrors.confirmPassword
                setValidationErrors(newErrors)
              }
            }}
            placeholder="••••••••"
            className={`w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              validationErrors.confirmPassword
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
        )}
      </div>

      {/* Password Requirements */}
      {formData.password && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-gray-700 mb-2">Password requirements:</p>
          <div className="space-y-1">
            <RequirementCheck
              met={formData.password.length >= 8}
              text="At least 8 characters"
            />
            <RequirementCheck
              met={/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)}
              text="Mix of uppercase and lowercase"
            />
            <RequirementCheck
              met={/\d/.test(formData.password)}
              text="At least one number"
            />
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !hasPasswordRequirements}
        className="w-full py-2.5 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}

function RequirementCheck({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-green-700' : 'text-gray-600'}`}>{text}</span>
    </div>
  )
}
