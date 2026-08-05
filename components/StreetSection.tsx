'use client'

import { motion } from 'framer-motion'
import { Section, itemVariants } from '@/components/Section'
import type { StreetContent } from '@/lib/types'

export function StreetSection({ street }: { street: StreetContent }) {
  if (street.spots.length === 0 && street.tipJar.links.length === 0) return null

  return (
    <Section id="street">
      <motion.p className="kicker" variants={itemVariants}>
        Between gigs
      </motion.p>
      <motion.div variants={itemVariants}>
        <h2 className="title-block mt-3">Around Town</h2>
      </motion.div>

      {street.intro && (
        <motion.p variants={itemVariants} className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          {street.intro}
        </motion.p>
      )}

      <div className="mt-9 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
        {/* Spots */}
        <div className="grid content-start gap-3">
          {street.spots.map((spot) => (
            <motion.div key={spot.id} variants={itemVariants} className="spot-row">
              <span className="mt-0.5 shrink-0 text-[var(--accent)]" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block font-serif text-lg font-medium text-[var(--fg)]">
                  {spot.place} <span className="font-sans text-sm font-normal text-[var(--muted)]">· {spot.when}</span>
                </span>
                {spot.note && <span className="mt-0.5 block text-sm text-[var(--muted)]">{spot.note}</span>}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Tip jar */}
        {street.tipJar.links.length > 0 && (
          <motion.div variants={itemVariants} className="tip-card h-full p-7">
            <div className="flex items-center gap-2.5 text-[var(--accent)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
                <path d="M7 6h1v4" />
                <path d="m16.71 13.88.7.71-2.82 2.82" />
              </svg>
              <h3 className="font-serif text-xl font-medium text-[var(--fg)]">The tip jar</h3>
            </div>
            {street.tipJar.note && (
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{street.tipJar.note}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-2.5">
              {street.tipJar.links.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="tip-link">
                  {link.label}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 3h6v6" />
                    <path d="M10 14 21 3" />
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  </svg>
                </a>
              ))}
            </div>
            {street.tipJar.footnote && (
              <p className="mt-5 font-serif text-sm italic text-[var(--muted)]">{street.tipJar.footnote}</p>
            )}
          </motion.div>
        )}
      </div>
    </Section>
  )
}
