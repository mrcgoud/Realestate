'use client'

import Link from 'next/link'
import { LoginForm } from '@/components/forms/LoginForm'

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
        <p className="text-gray-600">
          Welcome back to RealEstate Pro
        </p>
      </div>

      <LoginForm />

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700">
            Sign up here
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-4">Or continue with</p>
        <div className="grid grid-cols-2 gap-3">
          <button className="btn btn-outline p-2 text-sm">
            <span>Google</span>
          </button>
          <button className="btn btn-outline p-2 text-sm">
            <span>GitHub</span>
          </button>
        </div>
      </div>
    </div>
  )
}
