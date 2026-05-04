'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-blue-600 text-white rounded-lg p-2 font-bold">
            HB
          </div>
          <span className="font-bold text-xl text-gray-900 hidden sm:inline">HireBuyer</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Home
          </Link>
          <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Properties
          </Link>
          <Link href="/builders" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Builders
          </Link>
          <Link href="/insights" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Insights
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
            Login
          </Link>
          <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
            Create Buyer Profile
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2"
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-gray-900" />
          ) : (
            <Menu className="h-6 w-6 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col p-4 gap-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
              Home
            </Link>
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
              Properties
            </Link>
            <Link href="/builders" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
              Builders
            </Link>
            <Link href="/insights" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
              Insights
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">
              Login
            </Link>
            <Link href="/signup" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Create Buyer Profile
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
