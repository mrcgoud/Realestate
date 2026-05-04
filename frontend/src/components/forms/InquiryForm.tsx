'use client'

import { useState } from 'react'
import { Calendar, MessageSquare, Phone } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'

interface InquiryFormProps {
  propertyId: string
}

interface FormData {
  name: string
  email: string
  phone: string
  message: string
  tourDate?: string
  tourTime?: string
}

export function InquiryForm({ propertyId }: InquiryFormProps) {
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'message' | 'tour'>('message')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    tourDate: '',
    tourTime: '10:00',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    if (selectedTab === 'tour' && !formData.tourDate) {
      addToast('Please select a tour date', 'error')
      return
    }

    try {
      setIsLoading(true)

      // Import apiClient dynamically to avoid circular dependencies
      const { apiClient } = await import('@/lib/api-client')

      // Call real API to submit inquiry
      await apiClient.sendPropertyInquiry({
        propertyId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        type: selectedTab,
        tourDate: formData.tourDate,
        tourTime: formData.tourTime,
      })

      addToast(
        selectedTab === 'message'
          ? 'Message sent successfully!'
          : 'Tour scheduled successfully!',
        'success'
      )

      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        tourDate: '',
        tourTime: '10:00',
      })
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
      addToast('Failed to submit. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="card overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <TabButton
          tab="message"
          label="Message"
          icon={<MessageSquare className="h-4 w-4" />}
          active={selectedTab === 'message'}
          onClick={() => setSelectedTab('message')}
        />
        <TabButton
          tab="tour"
          label="Schedule Tour"
          icon={<Calendar className="h-4 w-4" />}
          active={selectedTab === 'tour'}
          onClick={() => setSelectedTab('tour')}
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {/* Tour Date */}
        {selectedTab === 'tour' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date *
            </label>
            <input
              type="date"
              name="tourDate"
              value={formData.tourDate}
              onChange={handleChange}
              min={minDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              required={selectedTab === 'tour'}
            />
          </div>
        )}

        {/* Tour Time */}
        {selectedTab === 'tour' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time
            </label>
            <select
              name="tourTime"
              value={formData.tourTime}
              onChange={handleChange as any}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
              <option value="17:00">5:00 PM</option>
            </select>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {selectedTab === 'message' ? 'Message *' : 'Additional Notes'}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={
              selectedTab === 'message'
                ? 'Tell us what you interested in this property...'
                : 'Any special requests or questions?'
            }
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            required={selectedTab === 'message'}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              {selectedTab === 'message' ? (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Tour</span>
                </>
              )}
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          We'll contact you shortly to confirm. Your information is secure.
        </p>
      </form>

      {/* Agent Contact */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
        <p className="text-sm font-semibold text-gray-900">Prefer to call?</p>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary-600" />
          <a
            href="tel:+15551234567"
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            (555) 123-4567
          </a>
        </div>
        <p className="text-xs text-gray-500">Mon-Sat, 9AM-6PM EST</p>
      </div>
    </div>
  )
}

function TabButton({
  tab,
  label,
  icon,
  active,
  onClick,
}: {
  tab: string
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 font-semibold transition-colors ${
        active
          ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
