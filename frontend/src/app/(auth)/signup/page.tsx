'use client'

import Link from 'next/link'
import { RegisterForm } from '@/components/forms/RegisterForm'

export default function SignupPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">
          Join millions finding their dream property
        </p>
      </div>

      <RegisterForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-4">Or sign up with</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-outline p-2 text-sm">
            <span>Google</span>
          </button>
          <button className="btn btn-outline p-2 text-sm">
            <span>GitHub</span>
          </button>
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="text-primary-600 hover:underline">
          Terms of Service
        </Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-primary-600 hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
