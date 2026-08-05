export interface ArtistSocials {
  instagram?: string
  tiktok?: string
  youtube?: string
  spotify?: string
  appleMusic?: string
  bandcamp?: string
}

export interface PressQuote {
  quote: string
  source: string
}

export interface ArtistContent {
  name: string
  wordmarkText: string
  tagline: string
  location: string
  canonicalUrl: string
  bookingEmail: string
  newsletterUrl?: string
  socials: ArtistSocials
  bio: string[]
  pressQuotes: PressQuote[]
  bookingFacts: string[]
  pressPhotos: string[]
}

export interface TrackLinks {
  spotify?: string
  apple?: string
  youtube?: string
  bandcamp?: string
}

export interface Track {
  id: string
  title: string
  note?: string
  audioUrl: string
  coverImage: string
  duration: number
  links: TrackLinks
}

export interface Show {
  id: string
  dateISO: string
  city: string
  venue: string
  ticketUrl?: string
  status: 'upcoming' | 'past'
}

export interface MediaVideo {
  id: string
  type: 'youtube' | 'file'
  title: string
  url: string
  poster?: string
}

export interface MediaPhoto {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export interface MediaContent {
  videos: MediaVideo[]
  photos: MediaPhoto[]
}

export interface StreetSpot {
  id: string
  place: string
  when: string
  note?: string
}

export interface TipJarLink {
  label: string
  url: string
}

export interface StreetContent {
  intro: string
  spots: StreetSpot[]
  tipJar: {
    note: string
    links: TipJarLink[]
    footnote?: string
  }
}
