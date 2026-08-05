'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { ArtistContent, Track } from '@/lib/types'
import { useAudioPlayer } from '@/lib/audio-store'

const socials: Record<string, string> = {
  instagram: 'IG',
  tiktok: 'TT',
  youtube: 'YT',
  spotify: 'SP',
  appleMusic: 'AM',
  bandcamp: 'BC',
}

export function Hero({ artist, featuredTrack }: { artist: ArtistContent; featuredTrack?: Track }) {
  const player = useAudioPlayer()
  const nameRef = useRef<HTMLHeadingElement>(null)
  const [reduce, setReduce] = useState(false)

  const isCurrent = featuredTrack && player.currentTrack?.id === featuredTrack.id
  const isPlaying = isCurrent && player.isPlaying

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // kinetic drift of the name on scroll
  useEffect(() => {
    if (reduce) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = nameRef.current
        if (!el) return
        const y = window.scrollY
        el.style.transform = `translate3d(${Math.min(y * 0.06, 60)}px, ${y * -0.04}px, 0)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [reduce])

  function togglePlay() {
    if (!featuredTrack) return
    if (isCurrent && isPlaying) player.pause()
    else player.play(featuredTrack.id)
  }

  const [first, ...rest] = artist.wordmarkText.split(' ')
  const last = rest.join(' ')

  return (
    <section id="home" className="sec" style={{ paddingTop: '6.5rem' }}>
      <div className="shell">
        <div className="grid items-end gap-8 md:grid-cols-[1.2fr_.8fr] md:gap-10">
          {/* Words */}
          <div>
            <div className="label mb-5 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-[var(--accent)]" />
              Country folk · New York City · est. 2026
            </div>

            <h1 ref={nameRef} className="drift" style={{ fontSize: 'clamp(3.4rem,16vw,9rem)', lineHeight: '.82', textTransform: 'uppercase', letterSpacing: '-.04em' }}>
              {first}
              <br />
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, textTransform: 'none', color: 'var(--accent)', letterSpacing: '-.02em' }}>
                {last}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-[var(--muted)]">
              Three chords and the truth, dragged up from the subway and out onto the record. No band, no backing track, no apologies.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              {featuredTrack && (
                <button type="button" onClick={togglePlay} className="bigplay" aria-label={isPlaying ? 'Pause' : 'Play the new single'}>
                  <span className="disc">
                    {isPlaying ? (
                      <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="3" width="4" height="14" rx="1" /><rect x="11" y="3" width="4" height="14" rx="1" /></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5L16 10L6 16.5V3.5Z" /></svg>
                    )}
                  </span>
                  <span>
                    {isPlaying ? 'Now playing' : 'Press play'}
                    <br />
                    <span className="text-[var(--muted)]">{featuredTrack.title}</span>
                  </span>
                </button>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <a href="#songs" className="btn">The songs</a>
              <a href="#book" className="btn btn-hot">Book him ↗</a>
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              {Object.entries(artist.socials).map(([k, url]) =>
                url && socials[k] ? (
                  <a key={k} href={url} target="_blank" rel="noreferrer" className="label-dim transition-colors hover:!text-[var(--accent)]" aria-label={k}>
                    {socials[k]}
                  </a>
                ) : null,
              )}
            </div>
          </div>

          {/* Portrait */}
          <div className="relative mx-auto w-full max-w-[300px] md:mx-0 md:max-w-none">
            <div className="frame duotone aspect-[4/5]">
              <Image
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/album-cover.png`}
                alt={`${artist.name}`}
                fill
                priority
                className="object-cover"
                sizes="(min-width:768px) 34vw, 90vw"
              />
            </div>
            <div className="sticker absolute -left-3 -top-3" style={{ transform: 'rotate(-5deg)' }}>
              NOW BOOKING
              <span className="s2">all five boroughs · 2026</span>
            </div>
            {isPlaying && (
              <div className="absolute bottom-3 right-3 z-10 text-[var(--accent)]">
                <span className="eq"><span></span><span></span><span></span><span></span></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
