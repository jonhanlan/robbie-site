import { Splash } from '@/components/Splash'
import { getArtistContent, getShows, getStreetContent, getTracks } from '@/lib/content'
import { buildEventJsonLd, buildMusicRecordingJsonLd } from '@/lib/seo'

export default function HomePage() {
  const artist = getArtistContent()
  const tracks = getTracks()
  const shows = getShows()
  const street = getStreetContent()

  const recordingsJsonLd = buildMusicRecordingJsonLd(artist, tracks)
  const eventsJsonLd = buildEventJsonLd(shows)

  return (
    <>
      <Splash artist={artist} shows={shows} street={street} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recordingsJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }} />
    </>
  )
}
