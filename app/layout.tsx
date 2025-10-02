import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AdProvider } from '@/components/Ads/AdProvider'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Small Business Grant Tracker',
    template: '%s | Small Business Grant Tracker'
  },
  description: 'Find and apply for small business grants in your state. Updated daily with new funding opportunities.',
  keywords: ['small business grants', 'business funding', 'grants by state', 'small business loans'],
  authors: [{ name: 'Small Business Grant Tracker' }],
  creator: 'Small Business Grant Tracker',
  publisher: 'Small Business Grant Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Small Business Grant Tracker',
    description: 'Find and apply for small business grants in your state. Updated daily with new funding opportunities.',
    siteName: 'Small Business Grant Tracker',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Small Business Grant Tracker',
    description: 'Find and apply for small business grants in your state. Updated daily with new funding opportunities.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdProvider>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
        </AdProvider>
      </body>
    </html>
  )
}


