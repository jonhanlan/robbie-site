import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'
import type { MorphRuntimeHostAdapterV0 } from './host-compatibility-core'
import { listMorphRuntimeExportsV0, type MorphRuntimeExportV0 } from './export-manifest'
import scrollDemoHostAdaptersJson from './scroll-demo-host-adapters.json'

export const MORPH_SCROLL_PAST_TRIGGER_PX_V0 = 240
export const MORPH_SCROLL_PAST_TRIGGER_VIEWPORT_RATIO_V0 = 0.25
export const MORPH_IN_VIEW_ROOT_MARGIN_V0 = '160px'
export const MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_SCHEMA_V0 = 'morph-runtime-host-adapters/v0' as const
export const MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_VERSION_V0 = 0 as const

export type MorphRuntimeScrollRangeMetricsV0 = {
  scrollY: number
  viewportHeight: number
  startTop: number
  endBottom: number
}

export type MorphRuntimePageScrollMetricsV0 = {
  scrollY: number
  viewportHeight: number
  scrollHeight: number
}

export type MorphRuntimeElementViewportMetricsV0 = {
  elementTop: number
  elementHeight: number
  viewportHeight: number
}

export type MorphRuntimeScrollPastTriggerLineMetricsV0 = {
  elementTop: number
  viewportHeight: number
}

export type MorphRuntimeScrollPastTriggerMetricsV0 = MorphRuntimeScrollPastTriggerLineMetricsV0 & {
  scrollY: number
}

export type MorphRuntimeHostAdapterEntryV0 = {
  storageKey: string
  adapter: MorphRuntimeHostAdapterV0
}

export type MorphRuntimeHostAdapterManifestV0 = {
  schema: typeof MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_SCHEMA_V0
  version: typeof MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_VERSION_V0
  sources: {
    scrollDemo: {
      schema: 'morph-scroll-demo-host-adapters/v0'
      targets: number
    }
  }
  targets: Record<string, MorphRuntimeHostAdapterV0>
}

export type MorphRuntimeHostAdapterValidationV0 = {
  ok: boolean
  runtimeEntries: number
  adapters: number
  failures: string[]
}

const scrollDemoHostAdapterManifestV0 = scrollDemoHostAdaptersJson as {
  schema: 'morph-scroll-demo-host-adapters/v0'
  targets: Record<string, MorphRuntimeHostAdapterV0>
}

export const morphRuntimeHostAdapterManifestV0 = {
  schema: MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_SCHEMA_V0,
  version: MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_VERSION_V0,
  sources: {
    scrollDemo: {
      schema: scrollDemoHostAdapterManifestV0.schema,
      targets: Object.keys(scrollDemoHostAdapterManifestV0.targets).length,
    },
  },
  targets: {
    ...scrollDemoHostAdapterManifestV0.targets,
  },
} as const satisfies MorphRuntimeHostAdapterManifestV0

export function resolveMorphRuntimeHostAdapterV0(storageKey: string): MorphRuntimeHostAdapterV0 | null {
  return morphRuntimeHostAdapterManifestV0.targets[storageKey] ?? null
}

export function listMorphRuntimeHostAdaptersV0(): MorphRuntimeHostAdapterEntryV0[] {
  return Object.entries(morphRuntimeHostAdapterManifestV0.targets)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([storageKey, adapter]) => ({ storageKey, adapter }))
}

export function validateMorphRuntimeHostAdapterManifestV0(
  runtimeExports: readonly MorphRuntimeExportV0[] = listMorphRuntimeExportsV0(),
  manifest: MorphRuntimeHostAdapterManifestV0 = morphRuntimeHostAdapterManifestV0,
): MorphRuntimeHostAdapterValidationV0 {
  const failures: string[] = []
  const runtimeByStorageKey = new Map(runtimeExports.map((runtimeExport) => [
    runtimeExport.entry.storageKey,
    runtimeExport.document,
  ]))
  const adapterKeys = Object.keys(manifest.targets)

  if (manifest.schema !== MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_SCHEMA_V0) {
    failures.push(`manifest schema expected ${MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_SCHEMA_V0} but found ${manifest.schema}`)
  }
  if (manifest.version !== MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_VERSION_V0) {
    failures.push(`manifest version expected ${MORPH_RUNTIME_HOST_ADAPTER_MANIFEST_VERSION_V0} but found ${manifest.version}`)
  }
  if (manifest.sources.scrollDemo.schema !== 'morph-scroll-demo-host-adapters/v0') {
    failures.push(`scroll-demo source schema expected morph-scroll-demo-host-adapters/v0 but found ${manifest.sources.scrollDemo.schema}`)
  }
  if (manifest.sources.scrollDemo.targets !== Object.keys(scrollDemoHostAdapterManifestV0.targets).length) {
    failures.push(
      `scroll-demo source target count expected ${Object.keys(scrollDemoHostAdapterManifestV0.targets).length} but found ${manifest.sources.scrollDemo.targets}`,
    )
  }

  for (const storageKey of adapterKeys) {
    const document = runtimeByStorageKey.get(storageKey)
    if (!document) {
      failures.push(`${storageKey} has a host adapter but no runtime export`)
      continue
    }
    validateRuntimeHostAdapterForDocument(storageKey, document, manifest.targets[storageKey], failures)
  }

  return {
    ok: failures.length === 0,
    runtimeEntries: runtimeExports.length,
    adapters: adapterKeys.length,
    failures,
  }
}

export function clampMorphRuntimeProgressV0(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function morphRuntimeScrollProgressForRangeV0(input: MorphRuntimeScrollRangeMetricsV0): number {
  const span = Math.max(1, input.endBottom - input.startTop - input.viewportHeight)
  return clampMorphRuntimeProgressV0((input.scrollY - input.startTop) / span)
}

export function morphRuntimePageScrollProgressV0(input: MorphRuntimePageScrollMetricsV0): number {
  const maxScrollY = Math.max(1, input.scrollHeight - input.viewportHeight)
  return clampMorphRuntimeProgressV0(input.scrollY / maxScrollY)
}

export function morphRuntimeElementViewportProgressV0(input: MorphRuntimeElementViewportMetricsV0): number {
  return clampMorphRuntimeProgressV0(
    (input.viewportHeight - input.elementTop) / (input.viewportHeight + input.elementHeight),
  )
}

export function morphRuntimeScrollPastTriggerLineV0(input: MorphRuntimeScrollPastTriggerLineMetricsV0): number {
  return Math.round(input.elementTop + input.viewportHeight * MORPH_SCROLL_PAST_TRIGGER_VIEWPORT_RATIO_V0)
}

export function morphRuntimeScrollPastTriggerReachedV0(input: MorphRuntimeScrollPastTriggerMetricsV0): boolean {
  return input.scrollY >= morphRuntimeScrollPastTriggerLineV0(input)
}

function validateRuntimeHostAdapterForDocument(
  storageKey: string,
  document: MorphRuntimeDocumentV0,
  adapter: MorphRuntimeHostAdapterV0,
  failures: string[],
) {
  const controller = document.controllers?.find((item) => item.id === adapter.controllerId)
  if (!controller) {
    failures.push(`${storageKey} host adapter references missing controller ${adapter.controllerId}`)
    return
  }

  if (adapter.kind === 'scroll-progress' || adapter.kind === 'scroll-progress-with-pointer-overlays') {
    if (controller.type !== 'slider' || controller.channel !== 'viewport') {
      failures.push(`${storageKey} scroll adapter controller must be a viewport slider`)
    }
    if (document.scene.scrub?.source !== adapter.source) {
      failures.push(`${storageKey} scrub source expected ${adapter.source} but found ${document.scene.scrub?.source}`)
    }
    if (adapter.source === 'section' && (!adapter.startId || !adapter.endId)) {
      failures.push(`${storageKey} section scroll adapter requires startId and endId`)
    }
  }

  if (adapter.kind === 'viewport-trigger') {
    if (controller.type !== 'trigger' || controller.channel !== 'viewport') {
      failures.push(`${storageKey} viewport trigger adapter controller must be a viewport trigger`)
    }
    const transition = document.scene.transitions?.find((item) => item.trigger === adapter.trigger)
    if (!transition) failures.push(`${storageKey} host adapter references missing trigger ${adapter.trigger}`)
    if (adapter.trigger === 'scroll-past' && transition?.atScrollPx !== adapter.thresholdPx) {
      failures.push(`${storageKey} scroll-past threshold expected ${adapter.thresholdPx} but found ${transition?.atScrollPx}`)
    }
    if (adapter.trigger === 'in-view' && !adapter.rootMargin) {
      failures.push(`${storageKey} in-view adapter requires a rootMargin`)
    }
  }

  if (adapter.kind === 'scroll-progress-with-pointer-overlays') {
    if (document.scene.composition?.mode !== 'scrub-additive-overlays') {
      failures.push(`${storageKey} overlay adapter requires scrub-additive-overlays composition`)
    }
    for (const overlay of adapter.overlays) {
      const trigger = overlay === 'hover' ? 'hover-on' : 'click'
      const hasTransition = document.scene.transitions?.some((item) => item.trigger === trigger)
      if (!hasTransition) failures.push(`${storageKey} overlay adapter references missing ${trigger} transition`)
    }
  }
}
