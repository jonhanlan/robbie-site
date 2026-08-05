'use client'

import { useState } from 'react'
import type { ArtistContent } from '@/lib/types'

const socialLabels: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', spotify: 'Spotify', appleMusic: 'Apple Music', bandcamp: 'Bandcamp',
}

export function ContactSection({ artist }: { artist: ArtistContent }) {
  const [sent, setSent] = useState(false)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = String(fd.get('name') || '')
    const email = String(fd.get('email') || '')
    const message = String(fd.get('message') || '')
    const subject = encodeURIComponent(`Booking — ${name}`)
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`)
    window.location.href = `mailto:${artist.bookingEmail}?subject=${subject}&body=${body}`
    setSent(true)
    form.reset()
  }

  return (
    <section id="book" className="sec" style={{ paddingBottom: '7rem' }}>
      <div className="shell">
        <div className="sec-head">
          <span className="idx">04</span>
          <h2 className="sec-title">Book <em>him</em></h2>
        </div>

        <div className="grid gap-9 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <p className="text-[1.15rem] leading-relaxed text-[var(--fg)]">
              Listening bar, backyard wedding, Tuesday residency, a stranger&rsquo;s porch — if there&rsquo;s a room and a reason, he&rsquo;ll bring the songs.
            </p>
            <a href={`mailto:${artist.bookingEmail}`} className="serif-accent mt-6 inline-block text-[1.3rem] text-[var(--accent)] hover:underline">
              {artist.bookingEmail}
            </a>

            {artist.pressPhotos.length > 0 && (
              <div className="mt-8">
                <p className="label-dim mb-3">Press shots</p>
                <div className="flex gap-2.5">
                  {artist.pressPhotos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <a key={p} href={p} download className="frame block h-16 w-16" aria-label={`Download press photo ${i + 1}`}>
                      <img src={p} alt="" className="h-full w-full object-cover duotone" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {Object.entries(artist.socials).map(([k, url]) =>
                url ? (
                  <a key={k} href={url} target="_blank" rel="noreferrer" className="label-dim hover:!text-[var(--accent)]">
                    {socialLabels[k] || k}
                  </a>
                ) : null,
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="border-2 border-[var(--line2)] p-6 md:p-8" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,.5)' }}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="field-label">Name</span>
                <input required name="name" autoComplete="name" className="field" />
              </label>
              <label className="block">
                <span className="field-label">Email</span>
                <input required type="email" name="email" autoComplete="email" className="field" />
              </label>
            </div>
            <label className="mt-5 hidden" aria-hidden="true">
              Website<input tabIndex={-1} autoComplete="off" name="website" />
            </label>
            <label className="mt-5 block">
              <span className="field-label">What are you dreaming up?</span>
              <textarea required name="message" rows={4} placeholder="the room, the date, the occasion" className="field" />
            </label>
            <button type="submit" className="btn btn-hot mt-5 w-full justify-center">Send it ↗</button>
            {sent && <p className="label mt-3">✓ opening your mail app</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
