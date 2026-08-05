import { compileMorphRuntimeDocumentV0, type MorphRuntimeCompileResultV0 } from './export-compiler'
import {
  MORPH_RUNTIME_SCHEMA_V2,
  MORPH_RUNTIME_VERSION_V2,
  type MorphRuntimeDocumentV2,
  type MorphRuntimeBoilModeV0,
  type MorphRuntimeCapabilityV0,
  type MorphRuntimeControllerV0,
  type MorphRuntimeReducedMotionFallbackV0,
  type MorphRuntimeTimelineV2,
} from './runtime-contract'
import type { StateInterruptMode, StateTransitionRule } from './state-engine'
import {
  bakeMorphDocDeformationV1,
  type MorphDocDeformationV1,
} from '../document/morph-doc-deformation-v1'
import {
  createDrawableSignaturePathMorphProofV0,
  createDrawableSignatureRibbonBaselineV0,
  createDrawableSignatureRuntimeScene,
  drawableSignatureRuntimeStorageKeyV0,
  signatureInnerShade,
  signatureRenderProfile,
  type SignatureDataset,
  type SignatureRenderProfile,
} from './signature-specimen'

export const drawableSignatureRuntimeDatasetKindV0 = 'signature'
export const drawableSignatureRuntimeDatasetKeyV0 = 'signature'
export const drawableSignatureRuntimeDatasetDraftKeyV0 =
  'packages/morph/exports/datasets/signature.json#signature'
export const drawableSignatureRuntimeExportedAtV0 = '2026-06-29T00:00:00.000Z'
export const drawableSignatureClosedOutlineRuntimeStorageKeyV0 = 'signature-closed-outline'
export const drawableSignaturePathMorphProofRuntimeStorageKeyV0 = 'signature-path-morph-proof'
export const drawableSignatureRibbonBaselineRuntimeStorageKeyV0 = 'signature-ribbon-baseline'

export type SignatureRuntimeCompileOptionsV0 = {
  exportedAt?: string
}

export type SignatureMorphDocDatasetV1 = Omit<SignatureDataset, 'render'> & {
  render?: SignatureRenderProfile & {
    imageFillAssetId?: string
  }
}

export type SignatureMorphDocCompileInputV1 = {
  authoring?: {
    dataset?: {
      payload?: SignatureMorphDocDatasetV1
    }
  }
  assets?: Array<{
    id: string
    kind: string
    path: string
    sha256: string
    byteLength: number
  }>
  states?: {
    entry?: string
    ids?: string[]
    transitions?: Array<{
      id?: string
      from?: string
      to: string
      trigger?: string
      durationMs?: number
      delayMs?: number
      easing?: string
      fps?: number
      interrupt?: string
    }>
    controllers?: Array<{
      id: string
      type: string
      label?: string
      channel?: string
      default?: boolean | number | string | { x: number; y: number }
      min?: number
      max?: number
      options?: string[]
    }>
    scrub?: {
      track: string[]
      source: 'section' | 'page' | 'element'
      startId?: string
      endId?: string
      easing?: string
      smoothing?: number
    }
    composition?: {
      mode: 'scrub-additive-overlays'
    }
  }
  timeline?: MorphRuntimeTimelineV2
  deformation?: MorphDocDeformationV1
}

export type SignatureMorphDocRuntimeCompileResultV1 = Omit<MorphRuntimeCompileResultV0, 'document'> & {
  document: MorphRuntimeCompileResultV0['document'] | MorphRuntimeDocumentV2
}

export function compileSignatureRuntimeDocumentFromDatasetV0(
  dataset?: SignatureDataset,
  options: SignatureRuntimeCompileOptionsV0 = {},
): MorphRuntimeCompileResultV0 {
  return compileSignatureRibbonRuntimeDocument(dataset, drawableSignatureRuntimeStorageKeyV0, {
    title: 'Jon Hanlan signature',
    tags: ['morph-lab', 'signature', 'pressure-ribbon', 'site-player', 'svg-runtime'],
    generatedId: 'signature-ribbon-adapter',
    generatedOwner: 'morph-signature-ribbon-adapter',
    exportedAt: options.exportedAt,
  })
}

export function compileSignatureRuntimeDocumentFromMorphDocV1(
  document: SignatureMorphDocCompileInputV1,
  options: SignatureRuntimeCompileOptionsV0 = {},
): SignatureMorphDocRuntimeCompileResultV1 {
  const compiled: SignatureMorphDocRuntimeCompileResultV1 = compileSignatureRuntimeDocumentFromDatasetV0(document.authoring?.dataset?.payload, options)
  if (document.states?.controllers?.length || document.states?.scrub) {
    const controllers = document.states?.controllers?.map(controllerFromMorphDocV1) ?? []
    if (document.states?.scrub && !controllers.some((controller) => controller.id === 'scroll-progress')) {
      controllers.push(scrollProgressControllerV0())
    }
    compiled.document.controllers = controllers
  }

  const authoredStateIDs = document.states?.ids?.filter((id) => id.trim().length > 0)
  if (authoredStateIDs?.length) {
    const authoredStateIDSet = new Set(authoredStateIDs)
    const existingSceneDefinitions = compiled.document.scene.states ?? {}
    const sceneStateDefinitions = Object.fromEntries(authoredStateIDs.map((id) => [
      id,
      existingSceneDefinitions[id] ?? {},
    ]))
    const existingGraphDefinitions = compiled.document.scene.stateGraph?.states ?? {}
    const graphStateDefinitions = Object.fromEntries(authoredStateIDs.map((id) => [
      id,
      existingGraphDefinitions[id] ?? {
        kind: id === document.states?.entry ? 'rest' : 'variant',
        label: humanizeStateID(id),
      },
    ]))
    compiled.document.scene.states = sceneStateDefinitions
    for (const layer of compiled.document.scene.layers) {
      if (!layer.states) continue
      layer.states = Object.fromEntries(
        Object.entries(layer.states).filter(([id]) => authoredStateIDSet.has(id)),
      )
    }
    if (compiled.document.scene.stateGraph) {
      compiled.document.scene.stateGraph = {
        ...compiled.document.scene.stateGraph,
        states: graphStateDefinitions,
      }
    }
  }

  const stateGraph = compiled.document.scene.stateGraph
  if (stateGraph) {
    compiled.document.scene.stateGraph = {
      ...stateGraph,
      entry: document.states?.entry || stateGraph.entry,
      transitions: document.states?.transitions?.map(transitionFromMorphDocV1) ?? stateGraph.transitions,
    }
    if (document.states?.entry) compiled.document.scene.entry = document.states.entry
  }
  if (document.states?.scrub) {
    compiled.document.scene.scrub = { ...document.states.scrub }
    addOptionalRuntimeCapability(compiled.document, 'scroll-scrub')
  }
  if (document.states?.composition) {
    compiled.document.scene.composition = { ...document.states.composition }
    if (document.states.composition.mode === 'scrub-additive-overlays') {
      addOptionalRuntimeCapability(compiled.document, 'additive-overlays')
    }
  }
  applySignatureMorphDocImageFillV1(compiled.document, document)
  applySignatureMorphDocLayerLooksV1(compiled.document, document)
  bakeMorphDocDeformationV1(compiled.document.scene, document.deformation)

  if (document.timeline) {
    compiled.document = {
      ...compiled.document,
      schema: MORPH_RUNTIME_SCHEMA_V2,
      version: MORPH_RUNTIME_VERSION_V2,
      migration: {
        fromSchema: 'morph-runtime/v0',
        reason: 'timeline-keyframes',
        preservesPriorPlayback: true,
      },
      timeline: cloneTimelineV2(document.timeline),
    }
  }

  compiled.json = JSON.stringify(compiled.document)
  return compiled
}

function applySignatureMorphDocLayerLooksV1(
  runtimeDocument: SignatureMorphDocRuntimeCompileResultV1['document'],
  document: SignatureMorphDocCompileInputV1,
): void {
  const dataset = document.authoring?.dataset?.payload
  if (!dataset?.layers?.length || !dataset.strokes?.length) return
  const authoringLayers = new Map(dataset.layers.map((layer) => [layer.id, layer]))
  for (const runtimeLayer of runtimeDocument.scene.layers) {
    const match = /^signature-(?:ribbon|stroke)-(\d+)$/u.exec(runtimeLayer.id)
    if (!match) continue
    const sourceStroke = dataset.strokes[Number(match[1]) - 1]
    const authoringLayer = sourceStroke?.layerId ? authoringLayers.get(sourceStroke.layerId) : undefined
    const look = authoringLayer?.look
    if (!look) continue
    const edge = dataset.render?.edge
    const shade = dataset.render?.shade
    const resolved = signatureRenderProfile({
      ...dataset.render,
      edge: {
        ...edge,
        tooth: look.edgeTooth ?? edge?.tooth,
        wobble: look.edgeWobble ?? edge?.wobble,
      },
      shade: {
        ...shade,
        shadowIntensity: look.shadeShadowIntensity ?? shade?.shadowIntensity,
        highlightIntensity: look.shadeHighlightIntensity ?? shade?.highlightIntensity,
        markStyle: look.shadeMarkStyle ?? shade?.markStyle,
      },
    })
    const fill = runtimeLayer.fill!
    fill.fill = look.fill ?? fill.fill
    fill.opacity = look.opacity ?? fill.opacity
    runtimeLayer.edge = {
      ...(runtimeLayer.edge ?? resolved.edge),
      ...(look.edgeTooth != null ? { tooth: resolved.edge.tooth } : {}),
      ...(look.edgeWobble != null ? { wobble: resolved.edge.wobble } : {}),
    }
    const inner = signatureInnerShade(resolved.shade)
    if (inner) runtimeLayer.inner = inner
    else delete runtimeLayer.inner
    runtimeLayer.passes = {
      ...(runtimeLayer.passes ?? {}),
      innerShadow: Boolean(inner?.innerShadow),
      highlight: Boolean(inner?.highlight),
    }
  }
}

function cloneTimelineV2(timeline: MorphRuntimeTimelineV2): MorphRuntimeTimelineV2 {
  return {
    id: timeline.id,
    ...(timeline.label != null ? { label: timeline.label } : {}),
    durationMs: timeline.durationMs,
    ...(timeline.loop != null ? { loop: timeline.loop } : {}),
    tracks: timeline.tracks.map((track) => track.target.kind === 'state-progress'
      ? {
          id: track.id,
          ...(track.label != null ? { label: track.label } : {}),
          target: { ...track.target },
          keyframes: track.keyframes.map((keyframe) => ({ ...keyframe })),
        }
      : {
          id: track.id,
          ...(track.label != null ? { label: track.label } : {}),
          target: { ...track.target },
          keyframes: track.keyframes.map((keyframe) => ({ ...keyframe })),
        }),
  }
}

function applySignatureMorphDocImageFillV1(
  runtimeDocument: SignatureMorphDocRuntimeCompileResultV1['document'],
  document: SignatureMorphDocCompileInputV1,
): void {
  const assetId = document.authoring?.dataset?.payload?.render?.imageFillAssetId
  if (assetId == null) return
  const matches = (document.assets ?? []).filter((asset) => asset.id === assetId)
  if (matches.length !== 1) throw new Error(`Signature image-fill asset ${assetId} must resolve exactly once.`)
  const asset = matches[0]
  if (asset.kind !== 'image') throw new Error(`Signature image-fill asset ${assetId} must be an image.`)
  const pathMatch = /^assets\/([a-f0-9]{64})\.(png|jpg|webp)$/u.exec(asset.path)
  if (!pathMatch || pathMatch[1] !== asset.sha256) {
    throw new Error(`Signature image-fill asset ${assetId} must use its content-addressed package path.`)
  }
  if (runtimeDocument.scene.layers.length === 0) return
  const href = `morph-asset://${asset.sha256}`
  for (const layer of runtimeDocument.scene.layers) {
    layer.fill = {
      ...(layer.fill ?? {}),
      image: {
        href,
        preserveAspectRatio: 'xMidYMid slice',
      },
    }
  }
  addOptionalRuntimeCapability(runtimeDocument, 'image-fill')
}

function humanizeStateID(id: string): string {
  return id
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/[-_]+/gu, ' ')
    .replace(/\b\w/gu, (character) => character.toUpperCase())
}

function transitionFromMorphDocV1(
  transition: NonNullable<NonNullable<SignatureMorphDocCompileInputV1['states']>['transitions']>[number],
): StateTransitionRule {
  return {
    ...(transition.id != null ? { id: transition.id } : {}),
    ...(transition.from != null ? { from: transition.from } : {}),
    to: transition.to,
    ...(transition.trigger != null ? { trigger: transition.trigger } : {}),
    ...(transition.durationMs != null ? { durationMs: transition.durationMs } : {}),
    ...(transition.delayMs != null ? { delayMs: transition.delayMs } : {}),
    ...(transition.easing != null ? { easing: transition.easing } : {}),
    ...(transition.fps != null ? { fps: transition.fps } : {}),
    ...(transition.interrupt != null ? { interrupt: transition.interrupt as StateInterruptMode } : {}),
  } as StateTransitionRule
}

function addOptionalRuntimeCapability(
  document: SignatureMorphDocRuntimeCompileResultV1['document'],
  capability: MorphRuntimeCapabilityV0,
): void {
  if (!document.capabilities) return
  document.capabilities.optional = [...new Set([...(document.capabilities.optional ?? []), capability])]
}

function controllerFromMorphDocV1(controller: NonNullable<NonNullable<SignatureMorphDocCompileInputV1['states']>['controllers']>[number]): MorphRuntimeControllerV0 {
  return {
    id: controller.id,
    type: controller.type,
    ...(controller.label != null ? { label: controller.label } : {}),
    ...(controller.channel != null ? { channel: controller.channel } : {}),
    ...(controller.default != null ? { default: controller.default } : {}),
    ...(controller.min != null ? { min: controller.min } : {}),
    ...(controller.max != null ? { max: controller.max } : {}),
    ...(controller.options != null ? { options: [...controller.options] } : {}),
  }
}

function scrollProgressControllerV0(): MorphRuntimeControllerV0 {
  return {
    id: 'scroll-progress',
    type: 'slider',
    label: 'Scroll Progress',
    channel: 'viewport',
    default: 0,
    min: 0,
    max: 1,
  }
}

export function compileSignatureClosedOutlineRuntimeDocumentFromDatasetV0(
  dataset?: SignatureDataset,
  options: SignatureRuntimeCompileOptionsV0 = {},
): MorphRuntimeCompileResultV0 {
  return compileSignatureClosedOutlineRuntimeDocument(dataset, drawableSignatureClosedOutlineRuntimeStorageKeyV0, {
    title: 'Jon Hanlan signature closed-outline baseline',
    tags: ['morph-lab', 'signature', 'closed-outline', 'site-player', 'svg-runtime'],
    generatedId: 'signature-closed-outline-adapter',
    generatedOwner: 'morph-signature-closed-outline-adapter',
    exportedAt: options.exportedAt,
  })
}

function compileSignatureClosedOutlineRuntimeDocument(
  dataset: SignatureDataset | undefined,
  storageKey: string,
  options: {
    title: string
    tags: string[]
    generatedId: string
    generatedOwner: string
    exportedAt?: string
  },
): MorphRuntimeCompileResultV0 {
  const scene = createDrawableSignatureRuntimeScene(dataset)
  scene.id = storageKey

  const exportedAt = options.exportedAt ?? drawableSignatureRuntimeExportedAtV0
  const reducedMotionFallback = signatureReducedMotionFallback(dataset)
  const boilMode = signatureBoilMode(dataset)
  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt,
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey,
      draftKey: drawableSignatureRuntimeDatasetDraftKeyV0,
    },
    manifest: {
      title: options.title,
      tags: options.tags,
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['pointer-hover', 'pointer-press', 'focus', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: reducedMotionFallback },
    settings: { boil: boilMode },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
      { id: 'press', type: 'trigger', label: 'Press', channel: 'pointer' },
      { id: 'focus', type: 'trigger', label: 'Focus', channel: 'focus' },
    ],
    generated: [{
      id: options.generatedId,
      kind: 'baked',
      owner: options.generatedOwner,
      target: 'scene.layers',
      baked: true,
      clearable: false,
      createdAt: exportedAt,
    }],
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

export function compileSignatureRibbonBaselineRuntimeDocumentFromDatasetV0(
  dataset?: SignatureDataset,
  options: SignatureRuntimeCompileOptionsV0 = {},
): MorphRuntimeCompileResultV0 {
  return compileSignatureRibbonRuntimeDocument(dataset, drawableSignatureRibbonBaselineRuntimeStorageKeyV0, {
    title: 'Jon Hanlan signature ribbon baseline',
    tags: ['morph-lab', 'signature', 'ribbon-baseline', 'site-player', 'svg-runtime'],
    generatedId: 'signature-ribbon-baseline-adapter',
    generatedOwner: 'morph-signature-ribbon-baseline-adapter',
    exportedAt: options.exportedAt,
  })
}

function compileSignatureRibbonRuntimeDocument(
  dataset: SignatureDataset | undefined,
  storageKey: string,
  options: {
    title: string
    tags: string[]
    generatedId: string
    generatedOwner: string
    exportedAt?: string
  },
): MorphRuntimeCompileResultV0 {
  const baseline = createDrawableSignatureRibbonBaselineV0(dataset)
  const scene = baseline.ribbonCandidate.scene
  scene.id = storageKey

  const exportedAt = options.exportedAt ?? drawableSignatureRuntimeExportedAtV0
  const reducedMotionFallback = signatureReducedMotionFallback(dataset)
  const boilMode = signatureBoilMode(dataset)
  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt,
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey,
      draftKey: drawableSignatureRuntimeDatasetDraftKeyV0,
    },
    manifest: {
      title: options.title,
      tags: options.tags,
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['pointer-hover', 'pointer-press', 'focus', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: reducedMotionFallback },
    settings: { boil: boilMode },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
      { id: 'press', type: 'trigger', label: 'Press', channel: 'pointer' },
      { id: 'focus', type: 'trigger', label: 'Focus', channel: 'focus' },
    ],
    generated: [{
      id: options.generatedId,
      kind: 'baked',
      owner: options.generatedOwner,
      target: 'scene.layers',
      baked: true,
      clearable: false,
      createdAt: exportedAt,
    }],
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

export function compileSignaturePathMorphProofRuntimeDocumentFromDatasetV0(
  dataset?: SignatureDataset,
  options: SignatureRuntimeCompileOptionsV0 = {},
): MorphRuntimeCompileResultV0 {
  const proof = createDrawableSignaturePathMorphProofV0(dataset)
  const scene = proof.scene
  scene.id = drawableSignaturePathMorphProofRuntimeStorageKeyV0

  const exportedAt = options.exportedAt ?? drawableSignatureRuntimeExportedAtV0
  const reducedMotionFallback = signatureReducedMotionFallback(dataset)
  const boilMode = signatureBoilMode(dataset)
  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt,
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey: drawableSignaturePathMorphProofRuntimeStorageKeyV0,
      draftKey: drawableSignatureRuntimeDatasetDraftKeyV0,
    },
    manifest: {
      title: 'Jon Hanlan signature path morph proof',
      tags: ['morph-lab', 'signature', 'path-morph-proof', 'site-player', 'svg-runtime'],
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['pointer-hover', 'pointer-press', 'focus', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: reducedMotionFallback },
    settings: { boil: boilMode },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
      { id: 'press', type: 'trigger', label: 'Press', channel: 'pointer' },
      { id: 'focus', type: 'trigger', label: 'Focus', channel: 'focus' },
    ],
    generated: [{
      id: 'signature-path-morph-proof-adapter',
      kind: 'baked',
      owner: 'morph-signature-path-morph-proof-adapter',
      target: 'scene.layers',
      baked: true,
      clearable: false,
      createdAt: exportedAt,
    }],
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

function signatureReducedMotionFallback(dataset: SignatureDataset | undefined): MorphRuntimeReducedMotionFallbackV0 {
  const value = dataset?.motion?.reducedMotion
  return value === 'static' || value === 'first-frame' || value === 'freeze' || value === 'none'
    ? value as MorphRuntimeReducedMotionFallbackV0
    : 'first-frame'
}

function signatureBoilMode(dataset: SignatureDataset | undefined): MorphRuntimeBoilModeV0 {
  const value = dataset?.settings?.boil
  return value === 'always' || value === 'active-only' || value === 'off'
    ? value as MorphRuntimeBoilModeV0
    : 'active-only'
}
