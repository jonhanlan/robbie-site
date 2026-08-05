'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MorphRuntimeStateEnginePlayer } from '@jonhanlan/morph/react/MorphRuntimeStateEnginePlayer'
import { HalftoneBackdrop } from '@/components/HalftoneBackdrop'
import { Modal } from '@/components/Modal'
import robbieTitleRuntime from '@/content/robbie-title.morph.json'
import type { ArtistContent, Show, StreetContent } from '@/lib/types'

type MorphPoint = {
  x: number
  y: number
  t?: number
  w?: number
  [key: string]: unknown
}

type RibbonGeometry = {
  strokes?: MorphPoint[][]
  [key: string]: unknown
}

type RuntimeLayer = {
  geometry?: RibbonGeometry
  states?: Record<string, RibbonGeometry>
  motion?: Array<{ style?: string; [key: string]: unknown }>
  [key: string]: unknown
}

type RuntimeDocument = {
  scene?: {
    layers?: RuntimeLayer[]
    stateGraph?: { transitions?: Array<{ trigger?: string; durationMs?: number; delayMs?: number }> }
    [key: string]: unknown
  }
  [key: string]: unknown
}

const TITLE_MORPH_ENTER_MS = 620
const TITLE_MORPH_HOLD_MS = 1500
const TITLE_MORPH_RETURN_MS = 460

function resampleStroke(points: MorphPoint[], count: number): MorphPoint[] {
  if (points.length < 2 || count <= 1) return points.map((point) => ({ ...point }))

  const distances = [0]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    distances[index] = distances[index - 1] + Math.hypot(current.x - previous.x, current.y - previous.y)
  }

  const total = distances[distances.length - 1]
  if (total <= Number.EPSILON) return Array.from({ length: count }, () => ({ ...points[0] }))

  let segment = 1
  return Array.from({ length: count }, (_, sampleIndex) => {
    const wanted = (sampleIndex / (count - 1)) * total
    while (segment < distances.length - 1 && distances[segment] < wanted) segment += 1

    const from = points[segment - 1]
    const to = points[segment]
    const span = Math.max(Number.EPSILON, distances[segment] - distances[segment - 1])
    const progress = (wanted - distances[segment - 1]) / span
    const point: MorphPoint = {
      ...from,
      x: from.x + (to.x - from.x) * progress,
      y: from.y + (to.y - from.y) * progress,
    }

    if (Number.isFinite(from.w) || Number.isFinite(to.w)) {
      const fromWidth = from.w ?? to.w ?? 2.6
      const toWidth = to.w ?? from.w ?? 2.6
      point.w = fromWidth + (toWidth - fromWidth) * progress
    }
    if (Number.isFinite(from.t) || Number.isFinite(to.t)) {
      const fromTime = from.t ?? to.t ?? 0
      const toTime = to.t ?? from.t ?? 0
      point.t = fromTime + (toTime - fromTime) * progress
    }

    return point
  })
}

function geometryCenter(geometry?: RibbonGeometry) {
  const points = geometry?.strokes?.flat() ?? []
  if (!points.length) return { x: 0, y: 0 }
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}

function closestLayerOrder(restLayers: RuntimeLayer[], targetLayers: RuntimeLayer[]) {
  const restCenters = restLayers.map((layer) => geometryCenter(layer.geometry))
  const targetCenters = targetLayers.map((layer) => geometryCenter(layer.geometry))
  const memo = new Map<string, { cost: number; order: number[] }>()

  function solve(restIndex: number, usedMask: number): { cost: number; order: number[] } {
    if (restIndex === restLayers.length) return { cost: 0, order: [] }
    const key = `${restIndex}:${usedMask}`
    const cached = memo.get(key)
    if (cached) return cached

    let best = { cost: Number.POSITIVE_INFINITY, order: [] as number[] }
    for (let targetIndex = 0; targetIndex < targetLayers.length; targetIndex += 1) {
      if ((usedMask & (1 << targetIndex)) !== 0) continue
      const restCenter = restCenters[restIndex]
      const targetCenter = targetCenters[targetIndex]
      const distance = Math.hypot(restCenter.x - targetCenter.x, restCenter.y - targetCenter.y)
      const remainder = solve(restIndex + 1, usedMask | (1 << targetIndex))
      if (distance + remainder.cost < best.cost) {
        best = { cost: distance + remainder.cost, order: [targetIndex, ...remainder.order] }
      }
    }

    memo.set(key, best)
    return best
  }

  return solve(0, 0).order
}

function pairAuthoredLayers(document: RuntimeDocument) {
  const layers = document.scene?.layers
  if (!layers || layers.length < 2 || layers.length % 2 !== 0 || layers.some((layer) => layer.states?.rest)) return

  const midpoint = layers.length / 2
  const restLayers = layers.slice(0, midpoint)
  const targetLayers = layers.slice(midpoint)
  const targetOrder = closestLayerOrder(restLayers, targetLayers)

  for (const [index, layer] of restLayers.entries()) {
    const target = targetLayers[targetOrder[index]]
    if (!layer.geometry || !target?.geometry) continue
    layer.states = {
      rest: layer.geometry,
      hover: target.geometry,
      press: target.geometry,
    }
  }

  document.scene!.layers = restLayers
}

function normalizeInteractiveRibbons(source: unknown): unknown {
  const document = JSON.parse(JSON.stringify(source)) as RuntimeDocument
  pairAuthoredLayers(document)

  for (const transition of document.scene?.stateGraph?.transitions ?? []) {
    if (transition.trigger === 'hover-on') transition.durationMs = TITLE_MORPH_ENTER_MS
    if (transition.trigger === 'hover-off') {
      transition.durationMs = TITLE_MORPH_RETURN_MS
      transition.delayMs = 35
    }
  }

  for (const layer of document.scene?.layers ?? []) {
    layer.motion = layer.motion?.filter((entry) => entry.style !== 'write-on')
    const rest = layer.states?.rest ?? layer.geometry
    const hover = layer.states?.hover
    if (!rest?.strokes || !hover?.strokes || rest.strokes.length !== hover.strokes.length) continue

    const states = [rest, hover, layer.states?.press].filter((state): state is RibbonGeometry => Boolean(state?.strokes))
    const normalized = states.map((state) => ({
      state,
      strokes: state.strokes!.map((stroke, strokeIndex) => {
        const pointCount = Math.max(48, ...states.map((candidate) => candidate.strokes?.[strokeIndex]?.length ?? 0))
        return resampleStroke(stroke, pointCount)
      }),
    }))

    for (const entry of normalized) entry.state.strokes = entry.strokes
    if (layer.geometry) layer.geometry.strokes = rest.strokes
  }

  return document
}

const interactiveTitleRuntime = normalizeInteractiveRibbons(robbieTitleRuntime)

function AlbumTitleMorph() {
  const [triggerSignal, setTriggerSignal] = useState<{
    trigger: string
    signal: number
    pointerInside: boolean
  } | null>(null)
  const sequenceRef = useRef(0)
  const returnTimerRef = useRef<number | null>(null)
  const lockedUntilRef = useRef(0)
  const hoverLatchedRef = useRef(false)

  const play = useCallback(() => {
    const now = performance.now()
    if (now < lockedUntilRef.current) return
    lockedUntilRef.current = now + TITLE_MORPH_ENTER_MS + TITLE_MORPH_HOLD_MS + TITLE_MORPH_RETURN_MS

    if (returnTimerRef.current != null) window.clearTimeout(returnTimerRef.current)
    const sequence = ++sequenceRef.current
    setTriggerSignal({ trigger: 'hover-on', signal: sequence * 2, pointerInside: true })
    returnTimerRef.current = window.setTimeout(() => {
      setTriggerSignal({ trigger: 'hover-off', signal: sequence * 2 + 1, pointerInside: false })
      returnTimerRef.current = null
    }, TITLE_MORPH_ENTER_MS + TITLE_MORPH_HOLD_MS)
  }, [])

  const playHover = useCallback(() => {
    if (hoverLatchedRef.current) return
    hoverLatchedRef.current = true
    play()
  }, [play])

  const releaseHover = useCallback(() => {
    hoverLatchedRef.current = false
  }, [])

  useEffect(() => () => {
    if (returnTimerRef.current != null) window.clearTimeout(returnTimerRef.current)
  }, [])

  return (
    <button
      type="button"
      className="splash-album-mark"
      aria-label="Animate the Robbie Donaldson album title"
      onPointerEnter={playHover}
      onPointerMove={playHover}
      onPointerLeave={releaseHover}
      onMouseEnter={playHover}
      onMouseMove={playHover}
      onMouseLeave={releaseHover}
      onPointerDown={play}
      onFocus={play}
      onClick={play}
    >
      <MorphRuntimeStateEnginePlayer
        document={interactiveTitleRuntime}
        className="signature-gesture"
        progress={0}
        interactive={false}
        triggerSignal={triggerSignal}
        title="Robbie Donaldson album title"
      />
    </button>
  )
}

const ICON: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4.5" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.28 8.28 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.13z" /></svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" /></svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.7 1.32.42.18.48.66.24 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-.96-.12-1.08-.6-.12-.48.12-.96.6-1.08 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.18 1.14zm.12-3.36C15.24 8.4 8.88 8.16 5.16 9.3c-.54.18-1.14-.12-1.32-.66-.18-.54.12-1.14.66-1.32 4.26-1.26 11.28-1.02 15.72 1.56.54.3.72 1.02.42 1.56-.3.42-.96.6-1.56.3z" /></svg>
  ),
  appleMusic: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 6.4c0-.5 0-1-.1-1.5-.1-.5-.3-1-.6-1.4-.3-.4-.7-.8-1.2-1-.5-.3-1-.4-1.5-.5H5.9c-.5.1-1 .2-1.5.5-.5.2-.9.6-1.2 1-.3.4-.5.9-.6 1.4C2.5 5.4 2.5 5.9 2.5 6.4v11.2c0 .5 0 1 .1 1.5.1.5.3 1 .6 1.4.3.4.7.8 1.2 1 .5.3 1 .4 1.5.5h13.1c.5-.1 1-.2 1.5-.5.5-.2.9-.6 1.2-1 .3-.4.5-.9.6-1.4.1-.5.1-1 .1-1.5V6.4zm-6.3 8.9c0 .3 0 .6-.1.9-.1.3-.3.5-.5.7-.2.2-.5.3-.8.4-.5.1-1 0-1.4-.3-.3-.2-.5-.6-.6-1 0-.3 0-.7.2-1 .2-.3.5-.5.8-.6l1.3-.3V8.3l-5 1v6.4c0 .3 0 .6-.1.9-.1.3-.3.5-.5.7-.2.2-.5.3-.8.4-.5.1-1 0-1.4-.3-.3-.2-.5-.6-.6-1 0-.4.1-.7.3-1 .2-.3.5-.5.8-.6l1.3-.3V7.2c0-.2 0-.3.1-.4.1-.1.2-.2.4-.2l5.9-1.2c.2 0 .4 0 .5.1.1.1.2.3.2.5v9.3z" /></svg>
  ),
  bandcamp: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 18.75l7.437-13.5H24l-7.438 13.5H0z" /></svg>
  ),
}

const ICON_ORDER = ['spotify', 'appleMusic', 'youtube', 'instagram', 'tiktok', 'bandcamp']

const mapUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q + ' NYC')}`

function fmtDate(v: string) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return v
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d)
}

export function Splash({
  artist,
  shows,
  street,
}: {
  artist: ArtistContent
  shows: Show[]
  street: StreetContent
}) {
  const reduce = useReducedMotion()
  const [modal, setModal] = useState<null | 'shows' | 'book'>(null)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    document.body.classList.add('splash')
    return () => document.body.classList.remove('splash')
  }, [])

  const upcoming = shows
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())

  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''

  const container = reduce
    ? {}
    : { initial: 'hidden', animate: 'show', variants: { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } } }
  const item = reduce
    ? {}
    : { variants: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.32, 1] as const } } } }

  function submitBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '')
    const from = String(fd.get('email') || '')
    const msg = String(fd.get('message') || '')
    window.location.href = `mailto:${artist.bookingEmail}?subject=${encodeURIComponent(`Booking — ${name}`)}&body=${encodeURIComponent(`From: ${name} (${from})\n\n${msg}`)}`
  }

  return (
    <>
      <div className="splash-wrap">
        <HalftoneBackdrop src={`${base}/images/flower-polaroid.jpg`} />

        <motion.div className="splash" {...container}>
          <motion.div className="splash-title" {...item}>
            <h1 className="splash-name">{artist.wordmarkText}</h1>
            <AlbumTitleMorph />
            <div className="splash-release" aria-label="Robbie Donaldson, self-titled, New York City">
              <span className="release-index">RD / ONE</span>
              <span className="release-title">Self-titled</span>
              <span className="release-city">New York City</span>
            </div>
          </motion.div>

          <motion.div className="cover-sq" {...item}>
            <div className="cover-art">
              <Image
                src={`${base}/images/single-nyc-polaroid.png`}
                alt={`${artist.name} — New York single artwork`}
                fill
                priority
                sizes="(min-width:768px) 360px, 76vw"
              />
            </div>
          </motion.div>

          <motion.div className="socials" {...item}>
            {ICON_ORDER.map((k) => {
              const url = (artist.socials as Record<string, string | undefined>)[k]
              if (!url || !ICON[k]) return null
              return (
                <a key={k} href={url} target="_blank" rel="noreferrer" className="soc" aria-label={k}>
                  {ICON[k]}
                </a>
              )
            })}
          </motion.div>

          <motion.div className="splash-actions" {...item}>
            <button type="button" className="btn" onClick={() => setModal('shows')}>
              <span className="btn-meta">NYC / LIVE</span>
              <span className="btn-label">Come through</span>
            </button>
            <button type="button" className="btn btn-hot" onClick={() => setModal('book')}>
              <span className="btn-meta">ROOMS / NIGHTS</span>
              <span className="btn-label">Bring him in</span>
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* SHOWS modal */}
      <Modal open={modal === 'shows'} onClose={() => setModal(null)} title={<>Shows</>}>
        {upcoming.length > 0 ? (
          <div>
            {upcoming.map((s) => (
              <div key={s.id} className="m-venue">
                <span className="vw">{fmtDate(s.dateISO)}</span>
                <span className="vt">
                  <a className="maplink" href={mapUrl(`${s.venue} ${s.city}`)} target="_blank" rel="noreferrer">{s.venue}</a>
                </span>
                <span className="vn">
                  {s.city}
                  {s.ticketUrl ? (
                    <> · <a className="maplink" href={s.ticketUrl} target="_blank" rel="noreferrer">tickets ↗</a></>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="shows-empty">
            <p className="shows-line">First NYC dates are coming · New York, 2026</p>
            {subscribed ? (
              <p className="shows-saved">You&rsquo;re on the list.</p>
            ) : (
              <form
                className="shows-alert"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (email) setSubscribed(true)
                }}
              >
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mono-field" aria-label="Email for show alerts" />
                <button type="submit" className="btn btn-hot">Tell me first</button>
              </form>
            )}
          </div>
        )}

        {street.spots.length > 0 && (
          <>
            <p className="modal-label modal-section-heading">For now, find him outside</p>
            {street.spots.map((s) => (
              <div key={s.id} className="m-venue">
                <span className="vw">{s.when}</span>
                <span className="vt">
                  <a className="maplink" href={mapUrl(s.place)} target="_blank" rel="noreferrer">{s.place}</a>
                </span>
              </div>
            ))}
          </>
        )}
      </Modal>

      {/* BOOK modal */}
      <Modal open={modal === 'book'} onClose={() => setModal(null)} title={<>Book <em>Robbie</em></>}>
        <p className="booking-intro">Listening bar, backyard wedding, Tuesday residency — if there&rsquo;s a room and a reason, he&rsquo;ll bring the songs.</p>
        <a href={`mailto:${artist.bookingEmail}`} className="booking-email">
          {artist.bookingEmail}
        </a>

        <form onSubmit={submitBooking} className="booking-form">
          <label className="modal-field">
            <span className="modal-field-label">Your name</span>
            <input name="name" required placeholder="Name" autoComplete="name" className="mono-field" />
          </label>
          <label className="modal-field">
            <span className="modal-field-label">Your email</span>
            <input name="email" type="email" required placeholder="you@email.com" autoComplete="email" className="mono-field" />
          </label>
          <label className="modal-field">
            <span className="modal-field-label">The room, date, occasion</span>
            <textarea name="message" required rows={3} placeholder="Tell Robbie what you have in mind" className="mono-field" />
          </label>
          <button type="submit" className="btn btn-hot booking-submit">Send it ↗</button>
        </form>

        {street.tipJar.links.length > 0 && (
          <div className="tip-jar">
            <p className="modal-label">Or just tip the tip jar</p>
            <div className="tip-links">
              {street.tipJar.links.map((l) => (
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="btn tip-link">{l.label}</a>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
