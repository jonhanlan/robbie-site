'use client'

import type { Track } from '@/lib/types'
import { useAudioPlayer } from '@/lib/audio-store'
import { formatTime } from '@/lib/utils'

const labels: Record<string, string> = { spotify: 'Spotify', apple: 'Apple', youtube: 'YouTube', bandcamp: 'Bandcamp' }

export function TrackList({ tracks }: { tracks: Track[] }) {
  const player = useAudioPlayer()

  function toggle(id: string) {
    const isCur = player.currentTrack?.id === id
    if (isCur && player.isPlaying) player.pause()
    else player.play(id)
  }

  return (
    <section id="songs" className="sec">
      <div className="shell">
        <div className="sec-head">
          <span className="idx">01</span>
          <h2 className="sec-title">The <em>songs</em></h2>
        </div>
        <p className="label-dim mb-6">Tap a title. It plays. That&rsquo;s the whole pitch.</p>

        <div className="tracks">
          {tracks.map((track, i) => {
            const isCur = player.currentTrack?.id === track.id
            const isPlaying = isCur && player.isPlaying
            return (
              <div key={track.id}>
                <div
                  className={`track${isCur ? ' active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(track.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggle(track.id)
                    }
                  }}
                  aria-label={`${isPlaying ? 'Pause' : 'Play'} ${track.title}`}
                >
                  <span className="tno">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ttitle">{track.title}</span>
                  <span className="tmeta">
                    {isPlaying ? (
                      <span className="eq text-[var(--accent)]"><span></span><span></span><span></span><span></span></span>
                    ) : (
                      <span className="tdur mono">{formatTime(track.duration)}</span>
                    )}
                    <span className="tplay" aria-hidden="true">
                      {isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="3" width="4" height="14" rx="1" /><rect x="11" y="3" width="4" height="14" rx="1" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5L16 10L6 16.5V3.5Z" /></svg>
                      )}
                    </span>
                  </span>
                </div>
                {isCur && (
                  <div>
                    {track.note && <p className="track-note">{track.note}</p>}
                    <div className="track-links">
                      {Object.entries(track.links).map(([k, url]) =>
                        url ? (
                          <a key={k} href={url} target="_blank" rel="noreferrer" className="chip" onClick={(e) => e.stopPropagation()}>
                            {labels[k] || k} ↗
                          </a>
                        ) : null,
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
