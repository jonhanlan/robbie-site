import { compileMorphRuntimeDocumentV0 } from './export-compiler'
import type { DrawableScene } from './types'

export type DrawableOrnamentRuntimeDatasetSpecV0 = {
  runtimeStorageKey: string
  kind: string
  datasetStorageKey: string
  sourceDataset: string
  title: string
  tags: string[]
}

export const drawableOrnamentRuntimeDatasetSpecsV0: Record<string, DrawableOrnamentRuntimeDatasetSpecV0> = {
  'dry-ornament': {
    runtimeStorageKey: 'dry-ornament',
    kind: 'dryOrnament',
    datasetStorageKey: 'dryOrnament',
    sourceDataset: 'packages/morph/exports/datasets/dry-ornament.json#dryOrnament',
    title: 'Dry ornament specimen',
    tags: ['morph-lab', 'dry', 'ornament', 'site-player', 'svg-runtime'],
  },
  'flow-ornament': {
    runtimeStorageKey: 'flow-ornament',
    kind: 'flowOrnament',
    datasetStorageKey: 'flowOrnament',
    sourceDataset: 'packages/morph/exports/datasets/flow-ornament.json#flowOrnament',
    title: 'Flow ornament specimen',
    tags: ['morph-lab', 'flow', 'ornament', 'site-player', 'svg-runtime'],
  },
  'grain-ornament': {
    runtimeStorageKey: 'grain-ornament',
    kind: 'grainOrnament',
    datasetStorageKey: 'grainOrnament',
    sourceDataset: 'packages/morph/exports/datasets/grain-ornament.json#grainOrnament',
    title: 'Grain ornament specimen',
    tags: ['morph-lab', 'grain', 'ornament', 'site-player', 'svg-runtime'],
  },
  'mark-set-ornament': {
    runtimeStorageKey: 'mark-set-ornament',
    kind: 'markSetOrnament',
    datasetStorageKey: 'markSetOrnament',
    sourceDataset: 'packages/morph/exports/datasets/mark-set-ornament.json#markSetOrnament',
    title: 'Mark set ornament specimen',
    tags: ['morph-lab', 'mark-set', 'ornament', 'site-player', 'svg-runtime'],
  },
  'relit-mark-set-ornament': {
    runtimeStorageKey: 'relit-mark-set-ornament',
    kind: 'relitMarkSetOrnament',
    datasetStorageKey: 'relitMarkSetOrnament',
    sourceDataset: 'packages/morph/exports/datasets/relit-mark-set-ornament.json#relitMarkSetOrnament',
    title: 'Relit mark set ornament specimen',
    tags: ['morph-lab', 'mark-set', 'lighting', 'shade-pipeline', 'ornament', 'site-player', 'svg-runtime'],
  },
  'scratch-ornament': {
    runtimeStorageKey: 'scratch-ornament',
    kind: 'scratchOrnament',
    datasetStorageKey: 'scratchOrnament',
    sourceDataset: 'packages/morph/exports/datasets/scratch-ornament.json#scratchOrnament',
    title: 'Scratch ornament specimen',
    tags: ['morph-lab', 'scratch', 'ornament', 'site-player', 'svg-runtime'],
  },
  'stipple-ornament': {
    runtimeStorageKey: 'stipple-ornament',
    kind: 'stippleOrnament',
    datasetStorageKey: 'stippleOrnament',
    sourceDataset: 'packages/morph/exports/datasets/stipple-ornament.json#stippleOrnament',
    title: 'Stipple ornament specimen',
    tags: ['morph-lab', 'stipple', 'ornament', 'site-player', 'svg-runtime'],
  },
}

export function drawableOrnamentRuntimeDatasetSpecV0(storageKey: string) {
  return drawableOrnamentRuntimeDatasetSpecsV0[storageKey] ?? null
}

export function drawableOrnamentRuntimeDatasetSpecForKindV0(kind: string) {
  return Object.values(drawableOrnamentRuntimeDatasetSpecsV0).find((spec) => spec.kind === kind) ?? null
}

export function compileDrawableOrnamentRuntimeDocumentFromDatasetV0(
  storageKey: string,
  source: DrawableScene,
  options: { exportedAt?: string } = {},
) {
  const spec = drawableOrnamentRuntimeDatasetSpecV0(storageKey)
  if (!spec) throw new Error(`No ornament dataset-backed runtime compiler for ${storageKey}.`)

  const scene = cloneDrawableOrnamentScene(source)
  scene.id = storageKey

  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt: options.exportedAt ?? '2026-06-29T00:00:00.000Z',
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey,
      draftKey: spec.sourceDataset,
    },
    manifest: {
      title: spec.title,
      tags: spec.tags,
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['pointer-hover', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: 'first-frame' },
    settings: { boil: 'active-only' },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
    ],
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

function cloneDrawableOrnamentScene(scene: DrawableScene): DrawableScene {
  return JSON.parse(JSON.stringify(scene)) as DrawableScene
}
