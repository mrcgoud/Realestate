import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ApolloWrapper } from '@/components/providers/ApolloWrapper'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import '@/styles/globals.css'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HireBuyer - Find Your Right Property',
  description:
    'Discover properties using verified data, builder credibility ratings, and smart property matching. Find properties matched to your budget and preferences.',
  keywords: [
    'real estate',
    'properties',
    'buy',
    'rent',
    'sell',
    'property matching',
    'builder ratings',
    'investment potential',
    'property search',
  ],
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hirebuyer.com',
    title: 'HireBuyer - Find Your Right Property',
    description: 'Find properties matched to your budget and preferences with verified data and builder credibility ratings',
    siteName: 'HireBuyer',
    images: [
      {
        url: 'https://hirebuyer.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HireBuyer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireBuyer - Find Your Right Property',
    description: 'Find properties matched to your budget and preferences',
    images: ['https://hirebuyer.com/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0284c7" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased flex flex-col min-h-screen`}>
        <ApolloWrapper>
          <ToastProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}
