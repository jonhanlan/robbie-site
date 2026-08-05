import { compileMorphRuntimeDocumentV0 } from './export-compiler'
import type { DrawableScene } from './types'

export const proceduralSceneRuntimeStorageKeyV0 = 'procedural-scene'
export const proceduralSceneRuntimeDatasetKindV0 = 'proceduralScene'
export const proceduralSceneRuntimeDatasetKeyV0 = 'proceduralScene'
export const proceduralSceneRuntimeSourceDatasetV0 = 'packages/morph/exports/datasets/procedural-scene.json#proceduralScene'

export function compileProceduralSceneRuntimeDocumentFromDatasetV0(
  source: DrawableScene,
  options: { exportedAt?: string } = {},
) {
  const scene = cloneProceduralScene(source)
  scene.id = proceduralSceneRuntimeStorageKeyV0

  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt: options.exportedAt ?? '2026-06-29T00:00:00.000Z',
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey: proceduralSceneRuntimeStorageKeyV0,
      draftKey: proceduralSceneRuntimeSourceDatasetV0,
    },
    manifest: {
      title: 'Procedural scene specimen',
      tags: ['morph-lab', 'site-player', 'svg-runtime'],
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['svg-cache', 'procedural-marks', 'field-cache'],
    },
    renderTier: 'svg-cache',
    quality: 'high',
    fallbacks: { reducedMotion: 'first-frame' },
    settings: { boil: 'active-only' },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
    ],
    includeFieldCache: true,
    fieldCacheProgressSamples: [0.5],
  })
}

function cloneProceduralScene(scene: DrawableScene): DrawableScene {
  return JSON.parse(JSON.stringify(scene)) as DrawableScene
}
