import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'
import { scrollDemoCombinedRuntimeDocumentV0 } from './scroll-demo-combined'
import { scrollDemoCueInViewRuntimeDocumentV0 } from './scroll-demo-cue-in-view'
import { scrollDemoHeroRuntimeDocumentV0 } from './scroll-demo-hero'
import { scrollDemoPageRuntimeDocumentV0 } from './scroll-demo-page'
import { scrollDemoScrollPastRuntimeDocumentV0 } from './scroll-demo-scroll-past'
import { scrollDemoTravelRuntimeDocumentV0 } from './scroll-demo-travel'
import scrollDemoHostAdaptersJson from './scroll-demo-host-adapters.json'

export const morphScrollDemoRuntimeStorageKeysV0 = [
  'scroll-demo-hero',
  'scroll-demo-combined',
  'scroll-demo-page',
  'scroll-demo-travel',
  'scroll-demo-cue-in-view',
  'scroll-demo-scroll-past',
] as const

export type MorphScrollDemoRuntimeStorageKeyV0 = typeof morphScrollDemoRuntimeStorageKeysV0[number]

export type MorphScrollDemoRuntimeHostAdapterV0 =
  | {
      kind: 'scroll-progress'
      source: 'section' | 'page' | 'element'
      controllerId: 'scroll-progress'
      startId?: string
      endId?: string
    }
  | {
      kind: 'viewport-trigger'
      trigger: 'in-view' | 'scroll-past'
      controllerId: 'in-view' | 'scroll-past'
      rootMargin?: string
      thresholdPx?: number
    }
  | {
      kind: 'scroll-progress-with-pointer-overlays'
      source: 'section'
      controllerId: 'scroll-progress'
      startId: string
      endId: string
      overlays: readonly ('hover' | 'click')[]
    }

export type MorphScrollDemoRuntimeTargetV0 = {
  storageKey: MorphScrollDemoRuntimeStorageKeyV0
  title: string
  document: MorphRuntimeDocumentV0
  hostAdapter: MorphScrollDemoRuntimeHostAdapterV0
}

export type MorphScrollDemoHostAdapterManifestV0 = {
  schema: 'morph-scroll-demo-host-adapters/v0'
  targets: Record<MorphScrollDemoRuntimeStorageKeyV0, MorphScrollDemoRuntimeHostAdapterV0>
}

export type MorphScrollDemoHostAdapterValidationV0 = {
  ok: boolean
  targets: number
  adapters: number
  failures: string[]
}

export const morphScrollDemoHostAdapterManifestV0 =
  scrollDemoHostAdaptersJson as MorphScrollDemoHostAdapterManifestV0

export const morphScrollDemoHeroRuntimeTargetV0 = {
  storageKey: 'scroll-demo-hero',
  title: 'Scrub pinned to this section',
  document: scrollDemoHeroRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-hero'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoCombinedRuntimeTargetV0 = {
  storageKey: 'scroll-demo-combined',
  title: 'Combined · scroll + hover + click',
  document: scrollDemoCombinedRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-combined'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoPageRuntimeTargetV0 = {
  storageKey: 'scroll-demo-page',
  title: 'Scrub whole-page progress',
  document: scrollDemoPageRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-page'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoTravelRuntimeTargetV0 = {
  storageKey: 'scroll-demo-travel',
  title: 'Scrub this shape through the screen',
  document: scrollDemoTravelRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-travel'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoCueInViewRuntimeTargetV0 = {
  storageKey: 'scroll-demo-cue-in-view',
  title: 'Cue scrolls into view',
  document: scrollDemoCueInViewRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-cue-in-view'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoScrollPastRuntimeTargetV0 = {
  storageKey: 'scroll-demo-scroll-past',
  title: 'Cue scroll passes a height',
  document: scrollDemoScrollPastRuntimeDocumentV0,
  hostAdapter: morphScrollDemoHostAdapterManifestV0.targets['scroll-demo-scroll-past'],
} as const satisfies MorphScrollDemoRuntimeTargetV0

export const morphScrollDemoRuntimeTargetsV0 = [
  morphScrollDemoHeroRuntimeTargetV0,
  morphScrollDemoCombinedRuntimeTargetV0,
  morphScrollDemoPageRuntimeTargetV0,
  morphScrollDemoTravelRuntimeTargetV0,
  morphScrollDemoCueInViewRuntimeTargetV0,
  morphScrollDemoScrollPastRuntimeTargetV0,
] as const satisfies readonly MorphScrollDemoRuntimeTargetV0[]

export const morphScrollDemoRuntimeTargetsByStorageKeyV0 =
  Object.fromEntries(morphScrollDemoRuntimeTargetsV0.map((target) => [target.storageKey, target])) as Record<
    MorphScrollDemoRuntimeStorageKeyV0,
    MorphScrollDemoRuntimeTargetV0
  >

export function resolveMorphScrollDemoRuntimeTargetV0(storageKey: string): MorphScrollDemoRuntimeTargetV0 | null {
  return morphScrollDemoRuntimeTargetsByStorageKeyV0[storageKey as MorphScrollDemoRuntimeStorageKeyV0] ?? null
}

export function validateMorphScrollDemoHostAdapterManifestV0(
  targets: readonly MorphScrollDemoRuntimeTargetV0[] = morphScrollDemoRuntimeTargetsV0,
  manifest: MorphScrollDemoHostAdapterManifestV0 = morphScrollDemoHostAdapterManifestV0,
): MorphScrollDemoHostAdapterValidationV0 {
  const failures: string[] = []
  const expectedKeys = targets.map((target) => target.storageKey)
  const adapterKeys = Object.keys(manifest.targets)

  if (manifest.schema !== 'morph-scroll-demo-host-adapters/v0') {
    failures.push(`manifest schema expected morph-scroll-demo-host-adapters/v0 but found ${manifest.schema}`)
  }

  for (const storageKey of expectedKeys) {
    if (!manifest.targets[storageKey]) failures.push(`${storageKey} is missing a host adapter`)
  }
  for (const storageKey of adapterKeys) {
    if (!expectedKeys.includes(storageKey as MorphScrollDemoRuntimeStorageKeyV0)) {
      failures.push(`${storageKey} has a host adapter but no runtime target`)
    }
  }

  for (const target of targets) {
    const adapter = manifest.targets[target.storageKey]
    if (!adapter) continue
    validateTargetAdapter(target, adapter, failures)
  }

  return {
    ok: failures.length === 0,
    targets: targets.length,
    adapters: adapterKeys.length,
    failures,
  }
}

function validateTargetAdapter(
  target: MorphScrollDemoRuntimeTargetV0,
  adapter: MorphScrollDemoRuntimeHostAdapterV0,
  failures: string[],
) {
  const controller = target.document.controllers?.find((item) => item.id === adapter.controllerId)
  if (!controller) {
    failures.push(`${target.storageKey} host adapter references missing controller ${adapter.controllerId}`)
    return
  }

  if (adapter.kind === 'scroll-progress' || adapter.kind === 'scroll-progress-with-pointer-overlays') {
    if (controller.type !== 'slider' || controller.channel !== 'viewport') {
      failures.push(`${target.storageKey} scroll adapter controller must be a viewport slider`)
    }
    if (target.document.scene.scrub?.source !== adapter.source) {
      failures.push(`${target.storageKey} scrub source expected ${adapter.source} but found ${target.document.scene.scrub?.source}`)
    }
    if (adapter.source === 'section' && (!adapter.startId || !adapter.endId)) {
      failures.push(`${target.storageKey} section scroll adapter requires startId and endId`)
    }
  }

  if (adapter.kind === 'viewport-trigger') {
    if (controller.type !== 'trigger' || controller.channel !== 'viewport') {
      failures.push(`${target.storageKey} viewport trigger adapter controller must be a viewport trigger`)
    }
    const transition = target.document.scene.transitions?.find((item) => item.trigger === adapter.trigger)
    if (!transition) {
      failures.push(`${target.storageKey} host adapter references missing trigger ${adapter.trigger}`)
    }
    if (adapter.trigger === 'scroll-past' && transition?.atScrollPx !== adapter.thresholdPx) {
      failures.push(`${target.storageKey} scroll-past threshold expected ${adapter.thresholdPx} but found ${transition?.atScrollPx}`)
    }
    if (adapter.trigger === 'in-view' && !adapter.rootMargin) {
      failures.push(`${target.storageKey} in-view adapter requires a rootMargin`)
    }
  }

  if (adapter.kind === 'scroll-progress-with-pointer-overlays') {
    if (target.document.scene.composition?.mode !== 'scrub-additive-overlays') {
      failures.push(`${target.storageKey} overlay adapter requires scrub-additive-overlays composition`)
    }
    for (const overlay of adapter.overlays) {
      const trigger = overlay === 'hover' ? 'hover-on' : 'click'
      const hasTransition = target.document.scene.transitions?.some((item) => item.trigger === trigger)
      if (!hasTransition) failures.push(`${target.storageKey} overlay adapter references missing ${trigger} transition`)
    }
  }
}
