'use client'

import { BarChart3, TrendingUp, Zap } from 'lucide-react'

interface InsightCardProps {
  icon: React.ReactNode
  title: string
  metric: string
  subtitle: string
  description?: string
}

function InsightCard({ icon, title, metric, subtitle, description }: InsightCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{metric}</div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  )
}

export function PropertyInsightsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Property Insights That Matter</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InsightCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Builder Credibility"
            metric="8.4 / 10"
            subtitle="ABC Developers"
            description="Trusted builder with proven track record"
          />
          <InsightCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Area Growth"
            metric="9 / 10"
            subtitle="Financial District"
            description="High growth area with strong infrastructure"
          />
          <InsightCard
            icon={<Zap className="h-8 w-8" />}
            title="Investment Potential"
            metric="4.6%"
            subtitle="Rental Yield"
            description="Strong rental income opportunity"
          />
        </div>
      </div>
    </section>
  )
}
