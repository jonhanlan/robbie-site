import type { ArtistContent, Show, Track } from '@/lib/types'

export function buildWebsiteJsonLd(artist: ArtistContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: artist.name,
    url: artist.canonicalUrl,
    description: artist.tagline,
  }
}

export function buildMusicGroupJsonLd(artist: ArtistContent) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: artist.name,
    url: artist.canonicalUrl,
    genre: 'Country Folk',
    foundingLocation: {
      '@type': 'Place',
      name: 'New York City',
    },
    sameAs: Object.values(artist.socials).filter(Boolean),
  }
}

export function buildMusicRecordingJsonLd(artist: ArtistContent, tracks: Track[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': tracks.map((track) => ({
      '@type': 'MusicRecording',
      name: track.title,
      byArtist: {
        '@type': 'MusicGroup',
        name: artist.name,
      },
      duration: `PT${Math.max(1, Math.round(track.duration))}S`,
      image: track.coverImage,
      url: track.links.spotify || track.links.apple || track.links.youtube || artist.canonicalUrl,
    })),
  }
}

export function buildEventJsonLd(shows: Show[]) {
  const upcoming = shows.filter((show) => show.status === 'upcoming')

  return {
    '@context': 'https://schema.org',
    '@graph': upcoming.map((show) => ({
      '@type': 'Event',
      name: `Live at ${show.venue}`,
      startDate: show.dateISO,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: show.venue,
        address: show.city,
      },
      offers: show.ticketUrl
        ? {
            '@type': 'Offer',
            url: show.ticketUrl,
            availability: 'https://schema.org/InStock',
          }
        : undefined,
    })),
  }
}
