import { compileMorphRuntimeDocumentV0 } from './export-compiler'
import {
  MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0,
  type MorphRuntimeBoilModeV0,
  type MorphRuntimeCapabilityV0,
  type MorphRuntimeReducedMotionFallbackV0,
} from './runtime-contract'
import {
  createScrollDemoCueScene,
  createScrollDemoScrubScene,
  type ScrollDemoCueDataset,
  type ScrollDemoScrubDataset,
} from './scroll-demo-target'

export type ScrollDemoRuntimeDatasetSpecV0 = {
  kind: string
  storageKey: string
  sourceDataset: string
  type: 'scrub' | 'cue'
}

export type ScrollDemoRuntimeDatasetEntryV0 = ScrollDemoCueDataset | ScrollDemoScrubDataset

const REDUCED_MOTION_FALLBACKS = new Set<string>(MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0)
const BOIL_MODES = new Set<string>(['always', 'active-only', 'off'])

export const scrollDemoRuntimeDatasetSpecsV0: Record<string, ScrollDemoRuntimeDatasetSpecV0> = {
  'scroll-demo-combined': {
    kind: 'scrollDemoCombined',
    storageKey: 'scrollDemoCombined',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-combined.json#scrollDemoCombined',
    type: 'scrub',
  },
  'scroll-demo-cue-in-view': {
    kind: 'scrollDemoCueInView',
    storageKey: 'scrollDemoCueInView',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-cue-in-view.json#scrollDemoCueInView',
    type: 'cue',
  },
  'scroll-demo-hero': {
    kind: 'scrollDemoHero',
    storageKey: 'scrollDemoHero',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-hero.json#scrollDemoHero',
    type: 'scrub',
  },
  'scroll-demo-page': {
    kind: 'scrollDemoPage',
    storageKey: 'scrollDemoPage',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-page.json#scrollDemoPage',
    type: 'scrub',
  },
  'scroll-demo-scroll-past': {
    kind: 'scrollDemoScrollPast',
    storageKey: 'scrollDemoScrollPast',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-scroll-past.json#scrollDemoScrollPast',
    type: 'cue',
  },
  'scroll-demo-travel': {
    kind: 'scrollDemoTravel',
    storageKey: 'scrollDemoTravel',
    sourceDataset: 'packages/morph/exports/datasets/scroll-demo-travel.json#scrollDemoTravel',
    type: 'scrub',
  },
}

export function scrollDemoRuntimeDatasetSpecV0(storageKey: string) {
  return scrollDemoRuntimeDatasetSpecsV0[storageKey] ?? null
}

export function compileScrollDemoRuntimeDocumentFromDatasetV0(
  storageKey: string,
  entry: ScrollDemoRuntimeDatasetEntryV0,
) {
  const spec = scrollDemoRuntimeDatasetSpecV0(storageKey)
  if (!spec) throw new Error(`No dataset-backed runtime compiler for ${storageKey}.`)

  const scene = spec.type === 'cue'
    ? createScrollDemoCueScene(entry as ScrollDemoCueDataset, spec.sourceDataset)
    : createScrollDemoScrubScene(entry as ScrollDemoScrubDataset, spec.sourceDataset)
  scene.id = storageKey

  const overlays = Array.isArray((entry as { overlays?: unknown }).overlays)
    ? (entry as { overlays: Array<{ trigger?: unknown; label?: unknown }> }).overlays
    : []
  const tags = spec.type === 'cue'
    ? ['morph-lab', 'scroll-demo', 'scroll-cue', 'site-player', 'svg-runtime']
    : [
        'morph-lab',
        'scroll-demo',
        'scroll-scrub',
        ...(overlays.length ? ['layered-gesture'] : []),
        'site-player',
        'svg-runtime',
      ]
  const controllers = spec.type === 'cue'
    ? [{
        id: String((entry as ScrollDemoCueDataset).trigger?.id || 'in-view'),
        type: 'trigger' as const,
        label: String((entry as ScrollDemoCueDataset).trigger?.label || 'Viewport Trigger'),
        channel: 'viewport' as const,
      }]
    : [
        { id: 'scroll-progress', type: 'slider' as const, label: 'Scroll Progress', channel: 'viewport' as const, default: 0, min: 0, max: 1 },
        ...overlays.map((overlay) => ({
          id: String(overlay.trigger || 'overlay').replace(/-(on|off)$/u, ''),
          type: 'trigger' as const,
          label: String(overlay.label || overlay.trigger || 'Overlay'),
          channel: 'pointer' as const,
        })),
      ]
  const optionalCapabilities: MorphRuntimeCapabilityV0[] = spec.type === 'cue'
    ? ['procedural-marks', 'image-fill']
    : ['scroll-scrub']
  if (spec.type !== 'cue' && overlays.length) {
    optionalCapabilities.push('additive-overlays', 'pointer-hover')
  }
  if (spec.type !== 'cue' && overlays.some((overlay) => overlay.trigger === 'click')) {
    optionalCapabilities.push('pointer-press')
  }
  if (spec.type !== 'cue') {
    optionalCapabilities.push('procedural-marks', 'image-fill')
  }
  const reducedMotionFallback = scrollDemoReducedMotionFallback(entry)
  const boilMode = scrollDemoBoilMode(entry)

  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt: '2026-06-29T00:00:00.000Z',
    keepSceneMeta: true,
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey,
      draftKey: spec.sourceDataset,
    },
    manifest: {
      title: String((entry as { title?: unknown }).title || storageKey),
      tags,
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: optionalCapabilities,
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: reducedMotionFallback },
    settings: { boil: boilMode },
    controllers,
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

function scrollDemoReducedMotionFallback(entry: ScrollDemoRuntimeDatasetEntryV0): MorphRuntimeReducedMotionFallbackV0 {
  const value = (entry as { motion?: { reducedMotion?: unknown } }).motion?.reducedMotion
  return typeof value === 'string' && REDUCED_MOTION_FALLBACKS.has(value) ? value as MorphRuntimeReducedMotionFallbackV0 : 'first-frame'
}

function scrollDemoBoilMode(entry: ScrollDemoRuntimeDatasetEntryV0): MorphRuntimeBoilModeV0 {
  const value = (entry as { settings?: { boil?: unknown } }).settings?.boil
  return typeof value === 'string' && BOIL_MODES.has(value) ? value as MorphRuntimeBoilModeV0 : 'active-only'
}
