'use client'

import { useState } from 'react'
import type { Show, StreetContent } from '@/lib/types'

function fmt(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

export function ShowList({ shows, street }: { shows: Show[]; street: StreetContent }) {
  const upcoming = shows
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section id="live" className="sec">
      <div className="shell">
        <div className="sec-head">
          <span className="idx">03</span>
          <h2 className="sec-title">Come <em>out</em></h2>
        </div>

        {upcoming.length > 0 ? (
          <div className="tracks mb-14">
            {upcoming.map((show) => (
              <div key={show.id} className="track" style={{ cursor: 'default' }}>
                <span className="tno">{fmt(show.dateISO)}</span>
                <span className="ttitle" style={{ fontSize: 'clamp(1.1rem,3.5vw,1.7rem)' }}>{show.venue}</span>
                <span className="tmeta">
                  <span className="tdur mono">{show.city}</span>
                  {show.ticketUrl && (
                    <a href={show.ticketUrl} target="_blank" rel="noreferrer" className="chip">Tickets ↗</a>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-14 border-2 border-[var(--line2)] p-7 md:p-10" style={{ boxShadow: '8px 8px 0 rgba(0,0,0,.5)' }}>
            <p className="label mb-3">/ no dates on the board yet</p>
            <h3 className="serif-accent text-[1.9rem] text-[var(--fg)]">Just got to town.</h3>
            <p className="mt-3 max-w-lg text-[var(--muted)]">
              He&rsquo;s knocking on doors across the five boroughs right now. Run a room? Want the first-show alert?
              The two buttons are for you.
            </p>
            <form
              className="mt-6 flex flex-wrap items-stretch gap-3"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault()
                if (email) setDone(true)
              }}
            >
              <a href="#book" className="btn btn-hot">Book him</a>
              {done ? (
                <span className="label flex items-center px-2">✓ on the list</span>
              ) : (
                <>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="field"
                    style={{ width: 'auto', flex: '1 1 12rem' }}
                    aria-label="Email for show alerts"
                  />
                  <button type="submit" className="btn">Alert me</button>
                </>
              )}
            </form>
          </div>
        )}

        {/* Around town / busking */}
        {street.spots.length > 0 && (
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:gap-12">
            <div>
              <p className="label mb-3">/ between gigs — around town</p>
              <p className="mb-5 max-w-md text-[var(--muted)]">{street.intro}</p>
              <div>
                {street.spots.map((s) => (
                  <div key={s.id} className="spot">
                    <span className="swhen">{s.when}</span>
                    <span>
                      <span className="splace">{s.place}</span>
                      {s.note && <span className="snote"> — {s.note}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {street.tipJar.links.length > 0 && (
              <div className="self-start border-2 border-[var(--accent)] p-6" style={{ boxShadow: '6px 6px 0 var(--accent)', background: 'rgba(239,127,54,.06)' }}>
                <p className="label mb-2">/ the tip jar</p>
                {street.tipJar.note && <p className="mb-4 text-sm text-[var(--muted)]">{street.tipJar.note}</p>}
                <div className="flex flex-wrap gap-2.5">
                  {street.tipJar.links.map((l) => (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="btn" style={{ borderColor: 'var(--accent)' }}>
                      {l.label} ↗
                    </a>
                  ))}
                </div>
                {street.tipJar.footnote && <p className="serif-accent mt-4 text-sm text-[var(--muted)]">{street.tipJar.footnote}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
