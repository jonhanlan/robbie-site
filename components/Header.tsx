'use client'

import { useEffect, useState } from 'react'

const links = [
  { id: 'songs', label: 'Songs' },
  { id: 'about', label: 'Story' },
  { id: 'live', label: 'Live' },
  { id: 'book', label: 'Book' },
]

export function Header({ artistName }: { artistName: string }) {
  const [active, setActive] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const secs = links.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => Boolean(e))
    if (!secs.length) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      style={scrolled ? { background: 'rgba(12,10,8,.82)', backdropFilter: 'blur(16px) saturate(1.3)', borderBottom: '2px solid var(--line2)' } : { borderBottom: '2px solid transparent' }}
    >
      <div className="shell flex h-14 items-center justify-between">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--fg)]"
        >
          {artistName.split(' ')[0]}
          <span className="text-[var(--accent)]">.</span>
        </button>
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Sections">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="label-dim transition-colors"
              style={active === l.id ? { color: 'var(--accent)' } : undefined}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
