'use client'

interface TrustStepProps {
  number: string
  title: string
  description: string
}

function TrustStep({ number, title, description }: TrustStepProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4 mx-auto">
        {number}
      </div>
      <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

export function TrustedBySection() {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">How Buyers Trust HireBuyer</h2>
        <p className="text-center text-gray-600 text-lg mb-12 max-w-2xl mx-auto">
          Our platform combines verified data, expert insights, and advanced technology to help you make confident decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <TrustStep
            number="1"
            title="Create Buyer Profile"
            description="Tell us your requirements. HireBuyer finds the best properties for you."
          />
          <TrustStep
            number="2"
            title="Get Property Matches"
            description="View curated project recommendations with detailed insights and analysis."
          />
          <TrustStep
            number="3"
            title="Book Property Tours"
            description="Visit shortlisted properties. Schedule expert-led tours at your convenience."
          />
        </div>
      </div>
    </section>
  )
}
