import type { ProfileMaskLegacySpecimenV0 } from './profile-mask'
import { compileMorphRuntimeDocumentV0, type MorphRuntimeCompileResultV0 } from '../drawable/export-compiler'
import type { DrawablePoint, DrawableScene, DrawableStateDefinition, DrawableStateTransition, EdgeShaderConfig, GeometryPrimitive } from '../drawable/types'

export const PROFILE_MASK_STORAGE_KEY_V0 = 'jonhanlan-profile-mask-v2'
export const PROFILE_MASK_FALLBACK_IMAGE_V0 = '/images/profile-portrait-treated.webp'
export const PROFILE_MASK_RUNTIME_STORAGE_KEY_V0 = 'profile-mask'
export const PROFILE_MASK_RUNTIME_DATASET_KIND_V0 = 'profileMask'
export const PROFILE_MASK_RUNTIME_DATASET_KEY_V0 = 'profileMask'
export const PROFILE_MASK_RUNTIME_SOURCE_DATASET_V0 = 'packages/morph/exports/datasets/profile-mask.json#profileMask'

const SOURCE_VIEWBOX: [number, number] = [720, 960]
const FIT_PADDING = 32

function points(value: unknown): DrawablePoint[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (point): point is DrawablePoint =>
      typeof point === 'object' &&
      point !== null &&
      typeof (point as DrawablePoint).x === 'number' &&
      typeof (point as DrawablePoint).y === 'number',
  )
}

function profileStates(source: ProfileMaskLegacySpecimenV0): Record<string, DrawableStateDefinition> {
  const states: Record<string, DrawableStateDefinition> = {}
  for (const pose of source.poses ?? []) {
    states[pose.id] = {
      label: pose.label,
      kind: pose.id === 'rest' ? 'rest' : 'pose',
    }
  }
  return states
}

function allProfilePaths(source: ProfileMaskLegacySpecimenV0) {
  return [
    points(source.pathA),
    points(source.pathB),
    ...(source.poses ?? []).map((pose) => points(pose.path)),
  ].filter((path) => path.length >= 3)
}

function clampFitAxis(min: number, size: number, maxSize: number) {
  if (size >= maxSize) return { min: 0, size: maxSize }
  return { min: Math.min(Math.max(min, 0), maxSize - size), size }
}

function fitViewBox(source: ProfileMaskLegacySpecimenV0) {
  const paths = allProfilePaths(source)
  const flattened = paths.flat()
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const point of flattened) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }

  const aspect = SOURCE_VIEWBOX[0] / SOURCE_VIEWBOX[1]
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  let width = Math.max(1, maxX - minX + FIT_PADDING * 2)
  let height = Math.max(1, maxY - minY + FIT_PADDING * 2)

  if (width / height < aspect) width = height * aspect
  else height = width / aspect

  const x = clampFitAxis(centerX - width / 2, width, SOURCE_VIEWBOX[0])
  const y = clampFitAxis(centerY - height / 2, height, SOURCE_VIEWBOX[1])
  return { x: x.min, y: y.min, width: x.size, height: y.size }
}

function shiftPoints(path: DrawablePoint[], fit: ReturnType<typeof fitViewBox>) {
  return path.map((point) => ({
    x: point.x - fit.x,
    y: point.y - fit.y,
  }))
}

function profileLayerStates(
  source: ProfileMaskLegacySpecimenV0,
  fit: ReturnType<typeof fitViewBox>,
): Record<string, GeometryPrimitive> {
  const states: Record<string, GeometryPrimitive> = {}
  for (const pose of source.poses ?? []) {
    const path = points(pose.path)
    if (path.length >= 3) states[pose.id] = { kind: 'closed', points: shiftPoints(path, fit) }
  }
  return states
}

export function createProfileMaskRuntimeSourceSceneV0(
  source: ProfileMaskLegacySpecimenV0,
): DrawableScene {
  const fit = fitViewBox(source)
  const viewBox: [number, number] = [fit.width, fit.height]
  return {
    id: PROFILE_MASK_RUNTIME_STORAGE_KEY_V0,
    kind: 'mask',
    viewBox,
    entry: source.entry ?? 'rest',
    states: profileStates(source),
    transitions: (source.transitions ?? []) as DrawableStateTransition[],
    layers: [
      {
        id: 'profile-portrait',
        name: 'Profile portrait',
        geometry: {
          kind: 'closed',
          points: shiftPoints(points(source.pathA), fit),
        },
        states: profileLayerStates(source, fit),
        resolution: 192,
        smoothing: 0.65,
        edge: source.edgeStyle as EdgeShaderConfig | undefined,
        fill: {
          image: {
            href: source.image ?? PROFILE_MASK_FALLBACK_IMAGE_V0,
            x: -fit.x,
            y: -fit.y,
            width: SOURCE_VIEWBOX[0],
            height: SOURCE_VIEWBOX[1],
          },
        },
        passes: {
          fill: true,
          edge: true,
          innerShadow: false,
          highlight: false,
          grain: false,
          hatching: false,
        },
      },
    ],
  }
}

export function compileProfileMaskRuntimeDocumentFromDatasetV0(
  source: ProfileMaskLegacySpecimenV0,
  options: { exportedAt?: string } = {},
): MorphRuntimeCompileResultV0 {
  const scene = createProfileMaskRuntimeSourceSceneV0(source)
  const viewBox = scene.viewBox
  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt: options.exportedAt ?? '2026-06-29T00:00:00.000Z',
    keepSceneMeta: true,
    source: {
      app: 'Morph Lab',
      documentKind: 'mask',
      storageKey: PROFILE_MASK_RUNTIME_STORAGE_KEY_V0,
      draftKey: PROFILE_MASK_RUNTIME_SOURCE_DATASET_V0,
    },
    manifest: {
      title: 'Profile mask',
      tags: ['morph-lab', 'site-player', 'profile-mask', 'image-fill'],
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['image-fill', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'medium',
    fallbacks: {
      reducedMotion: 'first-frame',
      static: {
        kind: 'webp',
        href: source.image ?? PROFILE_MASK_FALLBACK_IMAGE_V0,
        width: viewBox[0],
        height: viewBox[1],
      },
    },
    settings: { boil: 'active-only' },
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

export type { ProfileMaskLegacySpecimenV0 }
