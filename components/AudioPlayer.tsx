'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useAudioPlayer } from '@/lib/audio-store'
import { formatTime } from '@/lib/utils'

export function AudioPlayer() {
  const player = useAudioPlayer()
  if (!player.currentTrack) return null

  const max = Math.max(player.duration, player.currentTrack.duration, 1)
  const pct = Math.min(100, Math.max(0, (Math.min(player.currentTime, max) / max) * 100))

  return (
    <AnimatePresence>
      <m.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        className="miniplayer"
        aria-label="Player"
      >
        {/* progress */}
        <div className="h-1 w-full bg-[var(--line2)]">
          <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
        </div>
        <div className="shell flex items-center gap-4 py-2.5">
          <button
            type="button"
            onClick={player.toggle}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[var(--accent)] text-[#1a0f06]"
            aria-label={player.isPlaying ? 'Pause' : 'Play'}
          >
            {player.isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="3" width="4" height="14" rx="1" /><rect x="11" y="3" width="4" height="14" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M6 3.5L16 10L6 16.5V3.5Z" /></svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-sm font-bold uppercase tracking-tight text-[var(--fg)]">{player.currentTrack.title}</p>
            <p className="mono text-xs text-[var(--muted)]">{formatTime(player.currentTime)} / {formatTime(max)}</p>
          </div>
          <label className="hidden flex-1 sm:block">
            <span className="sr-only">Seek</span>
            <input
              type="range"
              min={0}
              max={max}
              value={Math.min(player.currentTime, max)}
              onChange={(e) => player.seek(Number(e.currentTarget.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>
        </div>
      </m.aside>
    </AnimatePresence>
  )
}
