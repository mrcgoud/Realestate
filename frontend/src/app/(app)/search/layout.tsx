import { ReactNode } from 'react'

export default function SearchLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex gap-6 min-h-screen">
      {children}
    </div>
  )
}
