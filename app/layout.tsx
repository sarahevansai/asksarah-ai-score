import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI Visibility Score — Is Your Website Visible to AI? | askSarah.ai',
  description:
    'Score your website\'s AI visibility in seconds. See why ChatGPT, Perplexity, and Google AI Overviews aren\'t citing you — and get a step-by-step fix plan.',
  keywords: [
    'AI visibility',
    'GEO optimization',
    'generative engine optimization',
    'AI SEO',
    'Perplexity optimization',
    'ChatGPT citations',
    'AI search',
    'schema markup',
    'E-E-A-T',
    'AI readiness score',
    'asksarah.ai',
  ],
  authors: [{ name: 'Zen Media', url: 'https://zenmedia.com' }],
  creator: 'Zen Media',
  publisher: 'askSarah.ai',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://asksarah.ai/ai-score',
    siteName: 'askSarah.ai',
    title: 'AI Visibility Score — Is Your Website Visible to AI?',
    description:
      'Score your site\'s AI visibility in seconds. Free tool by Zen Media — no signup required.',
    images: [
      {
        url: 'https://asksarah.ai/og-ai-score.png',
        width: 1200,
        height: 630,
        alt: 'AI Visibility Analyzer by askSarah.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Visibility Score — Is Your Website Visible to AI?',
    description:
      'Score your site\'s AI visibility in seconds. Free tool by Zen Media.',
    creator: '@prsarahevans',
    images: ['https://asksarah.ai/og-ai-score.png'],
  },
  alternates: {
    canonical: 'https://asksarah.ai/ai-score',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
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
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans antialiased bg-brand-black text-brand-text selection:bg-brand-accent/30 selection:text-brand-text">
        {children}
      </body>
    </html>
  )
}
