import type { ArtistContent } from '@/lib/types'
import { Reveal } from '@/components/Reveal'

export function AboutSection({ artist }: { artist: ArtistContent }) {
  return (
    <section id="about" className="sec">
      <div className="shell">
        <div className="sec-head">
          <span className="idx">02</span>
          <h2 className="sec-title">The <em>story</em></h2>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr] md:gap-14">
          <Reveal className="space-y-5">
            {artist.bio.map((para, i) => (
              <p key={i} className={i === 0 ? 'text-[1.25rem] leading-relaxed text-[var(--fg)]' : 'leading-relaxed text-[var(--muted)]'}>
                {para}
              </p>
            ))}
          </Reveal>

          <Reveal delay={100} className="self-start">
            <div className="border-2 border-[var(--line2)] p-6" style={{ boxShadow: '6px 6px 0 rgba(0,0,0,.5)' }}>
              <p className="label-dim mb-4">The facts</p>
              <ul className="space-y-3">
                {artist.bookingFacts.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-[var(--fg)]">
                    <span className="mono mt-0.5 shrink-0 text-[var(--accent)]">/</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
