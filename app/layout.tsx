import type { Metadata } from 'next'
import { Bricolage_Grotesque, DM_Sans, Fraunces, Space_Mono } from 'next/font/google'
import { getArtistContent } from '@/lib/content'
import { buildMusicGroupJsonLd, buildWebsiteJsonLd } from '@/lib/seo'
import './globals.css'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const serif = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

const artist = getArtistContent()

export const metadata: Metadata = {
  metadataBase: new URL(artist.canonicalUrl),
  title: {
    default: `${artist.name} | Country Folk, New York City`,
    template: `%s | ${artist.name}`,
  },
  description: artist.tagline,
  alternates: {
    canonical: artist.canonicalUrl,
  },
  openGraph: {
    type: 'website',
    title: artist.name,
    description: artist.tagline,
    siteName: artist.name,
    url: artist.canonicalUrl,
    images: ['/images/single-nyc-polaroid.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: artist.name,
    description: artist.tagline,
    images: ['/images/single-nyc-polaroid.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const websiteJsonLd = buildWebsiteJsonLd(artist)
  const musicGroupJsonLd = buildMusicGroupJsonLd(artist)

  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${display.variable} ${mono.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(musicGroupJsonLd) }} />
        {children}
      </body>
    </html>
  )
}
