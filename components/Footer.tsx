import type { ArtistContent } from '@/lib/types'

export function Footer({ artist }: { artist: ArtistContent }) {
  const year = new Date().getFullYear()
  return (
    <footer className="relative z-10 border-t-2 border-[var(--line2)]">
      <div className="shell flex flex-col gap-3 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="serif-accent text-[1.05rem] text-[var(--fg)]">Songs are better in person. Come find him.</p>
        <p className="label-dim">© {year} {artist.name} · NYC</p>
      </div>
    </footer>
  )
}
