'use client'

interface AreaCardProps {
  name: string
  image?: string
  growthScore: string
  rentalYield: string
}

function AreaCard({ name, growthScore, rentalYield, image }: AreaCardProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
      {/* Image */}
      <div className="relative h-40 bg-gradient-to-br from-purple-200 to-purple-50 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl">🏙️</div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{name}</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Growth Score</span>
            <span className="font-bold text-gray-900">{growthScore}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Rental Yield</span>
            <span className="font-bold text-gray-900">{rentalYield}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExploreAreasSection() {
  const areas = [
    {
      name: 'Financial District',
      growthScore: '9 / 10',
      rentalYield: '4..%',
    },
    {
      name: 'Gachbowli',
      growthScore: '8.6 / 10',
      rentalYield: '4..%',
    },
    {
      name: 'Kokapet',
      growthScore: '8.8 / 10',
      rentalYield: 'High Potential',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Explore Top Investment Areas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area, index) => (
            <AreaCard key={index} {...area} />
          ))}
        </div>
      </div>
    </section>
  )
}
