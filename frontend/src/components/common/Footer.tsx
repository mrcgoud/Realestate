'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 rounded-lg p-2 font-bold">
                HB
              </div>
              <span className="font-bold text-lg">HireBuyer</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Find the right property with verified data, builder credibility ratings, and smart matching.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/properties" className="text-gray-400 hover:text-white transition-colors text-sm">Properties</Link></li>
              <li><Link href="/builders" className="text-gray-400 hover:text-white transition-colors text-sm">Builders</Link></li>
              <li><Link href="/areas" className="text-gray-400 hover:text-white transition-colors text-sm">Investment Areas</Link></li>
              <li><Link href="/insights" className="text-gray-400 hover:text-white transition-colors text-sm">Insights</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors text-sm">Disclaimer</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 HireBuyer. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm">
            Made with ❤️ to help you find your dream property
          </p>
        </div>
      </div>
    </footer>
  )
}
