import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import type { ArtistContent, MediaContent, MediaPhoto, MediaVideo, Show, StreetContent, StreetSpot, TipJarLink, Track } from '@/lib/types'

const CONTENT_DIR = path.join(process.cwd(), 'content')
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

function prefixAssetPath(p: string): string {
  if (!p || !p.startsWith('/')) return p
  return `${BASE_PATH}${p}`
}

function readJsonFile(fileName: string): unknown {
  const filePath = path.join(CONTENT_DIR, fileName)
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

export function getArtistContent(): ArtistContent {
  const payload = readJsonFile('artist.json')

  if (!isRecord(payload)) {
    return {
      name: 'Robbie Donaldson',
      wordmarkText: 'Robbie Donaldson',
      tagline: 'True stories, three chords, New York City.',
      location: 'New York City',
      canonicalUrl: 'https://example.com',
      bookingEmail: 'booking@example.com',
      newsletterUrl: '',
      socials: {},
      bio: [],
      pressQuotes: [],
      bookingFacts: [],
      pressPhotos: [],
    }
  }

  const socialsPayload = isRecord(payload.socials) ? payload.socials : {}

  return {
    name: asString(payload.name, 'Robbie Donaldson'),
    wordmarkText: asString(payload.wordmarkText, asString(payload.name, 'Robbie Donaldson')),
    tagline: asString(payload.tagline),
    location: asString(payload.location, 'New York City'),
    canonicalUrl: asString(payload.canonicalUrl, 'https://example.com'),
    bookingEmail: asString(payload.bookingEmail, 'booking@example.com'),
    newsletterUrl: asString(payload.newsletterUrl),
    socials: {
      instagram: asString(socialsPayload.instagram),
      tiktok: asString(socialsPayload.tiktok),
      youtube: asString(socialsPayload.youtube),
      spotify: asString(socialsPayload.spotify),
      appleMusic: asString(socialsPayload.appleMusic),
      bandcamp: asString(socialsPayload.bandcamp),
    },
    bio: asStringArray(payload.bio),
    pressQuotes: Array.isArray(payload.pressQuotes)
      ? payload.pressQuotes
          .filter(isRecord)
          .map((quote) => ({ quote: asString(quote.quote), source: asString(quote.source) }))
          .filter((quote) => quote.quote && quote.source)
      : [],
    bookingFacts: asStringArray(payload.bookingFacts),
    pressPhotos: asStringArray(payload.pressPhotos).map(prefixAssetPath),
  }
}

export function getStreetContent(): StreetContent {
  const payload = readJsonFile('street.json')

  if (!isRecord(payload)) {
    return { intro: '', spots: [], tipJar: { note: '', links: [] } }
  }

  const spots: StreetSpot[] = Array.isArray(payload.spots)
    ? payload.spots
        .filter(isRecord)
        .map((spot) => ({
          id: asString(spot.id),
          place: asString(spot.place),
          when: asString(spot.when),
          note: asString(spot.note),
        }))
        .filter((spot) => spot.id && spot.place && spot.when)
    : []

  const tipJarPayload = isRecord(payload.tipJar) ? payload.tipJar : {}
  const links: TipJarLink[] = Array.isArray(tipJarPayload.links)
    ? tipJarPayload.links
        .filter(isRecord)
        .map((link) => ({ label: asString(link.label), url: asString(link.url) }))
        .filter((link) => link.label && link.url)
    : []

  return {
    intro: asString(payload.intro),
    spots,
    tipJar: {
      note: asString(tipJarPayload.note),
      links,
      footnote: asString(tipJarPayload.footnote),
    },
  }
}

export function getTracks(): Track[] {
  const payload = readJsonFile('tracks.json')
  if (!Array.isArray(payload)) return []

  return payload
    .filter(isRecord)
    .map((track) => {
      const linksPayload = isRecord(track.links) ? track.links : {}

      return {
        id: asString(track.id),
        title: asString(track.title),
        note: asString(track.note),
        audioUrl: asString(track.audioUrl),
        coverImage: prefixAssetPath(asString(track.coverImage)),
        duration: asNumber(track.duration),
        links: {
          spotify: asString(linksPayload.spotify),
          apple: asString(linksPayload.apple),
          youtube: asString(linksPayload.youtube),
          bandcamp: asString(linksPayload.bandcamp),
        },
      }
    })
    .filter((track) => track.id && track.title && track.audioUrl && track.coverImage)
}

export function getShows(): Show[] {
  const payload = readJsonFile('shows.json')
  if (!Array.isArray(payload)) return []

  return payload
    .filter(isRecord)
    .map<Show>((show) => ({
      id: asString(show.id),
      dateISO: asString(show.dateISO),
      city: asString(show.city),
      venue: asString(show.venue),
      ticketUrl: asString(show.ticketUrl),
      status: show.status === 'past' ? 'past' : 'upcoming',
    }))
    .filter((show) => show.id && show.dateISO && show.city && show.venue)
}

export function getMediaContent(): MediaContent {
  const payload = readJsonFile('media.json')
  if (!isRecord(payload)) {
    return { videos: [], photos: [] }
  }

  const videos = Array.isArray(payload.videos)
    ? payload.videos
        .filter(isRecord)
        .map<MediaVideo>((video) => ({
          id: asString(video.id),
          type: video.type === 'youtube' ? 'youtube' : 'file',
          title: asString(video.title),
          url: prefixAssetPath(asString(video.url)),
          poster: prefixAssetPath(asString(video.poster)),
        }))
        .filter((video) => video.id && video.title && video.url)
    : []

  const photos = Array.isArray(payload.photos)
    ? payload.photos
        .filter(isRecord)
        .map<MediaPhoto>((photo) => ({
          id: asString(photo.id),
          src: prefixAssetPath(asString(photo.src)),
          alt: asString(photo.alt),
          width: asNumber(photo.width, 1200),
          height: asNumber(photo.height, 900),
        }))
        .filter((photo) => photo.id && photo.src && photo.alt)
    : []

  return { videos, photos }
}
