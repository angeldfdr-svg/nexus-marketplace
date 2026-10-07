import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import '../styles/globals.css'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nexus.tech'),
  title: {
    default: 'NEXUS — Premium Technology Marketplace',
    template: '%s | NEXUS',
  },
  description: 'Descubra tecnologia premium curada. Drones, áudio, smart home, fotografia e muito mais. Envio grátis > 100€, devoluções 30 dias, garantia oficial.',
  keywords: ['technology', 'electronics', 'drones', 'audio', 'smart home', 'photography', 'premium', 'marketplace'],
  authors: [{ name: 'NEXUS' }],
  creator: 'NEXUS',
  publisher: 'NEXUS',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://nexus.tech',
    siteName: 'NEXUS',
    title: 'NEXUS — Premium Technology Marketplace',
    description: 'Descubra tecnologia premium curada. Drones, áudio, smart home, fotografia e muito mais.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NEXUS Premium Technology Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS — Premium Technology Marketplace',
    description: 'Descubra tecnologia premium curada.',
    images: ['/images/og-image.jpg'],
    creator: '@nexustech',
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
        <link rel="dns-prefetch" href="https://js.stripe.com" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
