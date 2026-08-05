import { layerMotionStyle, motionForTrigger, motionTransform } from './drawable/motion'
import { renderDrawableLayer, renderDrawableScene, renderMorphRuntimeDocumentV0 } from './drawable/render'
import { renderMorphRuntimeDocumentWithOverlaysV0 } from './drawable/render-overlays'
import { compileMorphRuntimeDocumentV0, serializeMorphRuntimeDocumentV0 } from './drawable/export-compiler'
import {
  compileScrollDemoRuntimeDocumentFromDatasetV0,
  scrollDemoRuntimeDatasetSpecV0,
  scrollDemoRuntimeDatasetSpecsV0,
} from './drawable/scroll-demo-runtime-export'
import {
  compileSignatureClosedOutlineRuntimeDocumentFromDatasetV0,
  compileSignaturePathMorphProofRuntimeDocumentFromDatasetV0,
  compileSignatureRibbonBaselineRuntimeDocumentFromDatasetV0,
  compileSignatureRuntimeDocumentFromDatasetV0,
  compileSignatureRuntimeDocumentFromMorphDocV1 as compileSignatureRuntimeDocumentFromMorphDocRuntimeV1,
} from './drawable/signature-runtime-export'
import { sampleMorphRuntimeTimelineV2 } from './runtime/timeline-v2'
import { renderMorphRuntimeTimelineFrameV2 } from './runtime/timeline-frame-renderer-v2'
import { compileFlowerOrnamentRuntimeDocumentFromDatasetV0 } from './drawable/flower-ornament-runtime-export'
import { compileDrawableOrnamentRuntimeDocumentFromDatasetV0 } from './drawable/ornament-runtime-export'
import { compileProceduralSceneRuntimeDocumentFromDatasetV0 } from './drawable/procedural-scene-runtime-export'
import { compileProfileMaskRuntimeDocumentFromDatasetV0 } from './legacy/profile-mask-runtime-source'
import {
  MORPH_RUNTIME_SCHEMA_V0,
  MORPH_RUNTIME_VERSION_V0,
  createMorphRuntimePlaybackMetadataV0,
  createMorphRuntimeDocumentV0,
  isMorphRuntimeDocumentV0,
  normalizeDrawableSceneForRuntimeV0,
  validateMorphRuntimeDocumentV0,
} from './drawable/runtime-contract'
import {
  morphRuntimeCachedFieldProgressesV0,
  morphRuntimeFieldCacheSourceLabelV0,
  morphRuntimeFieldCacheStatusV0,
} from './drawable/runtime-playback-policy'
import {
  drawableStateGraphForScene,
  legacyMotionTransitionsForScene,
  stateEngineDefinitionForDrawableScene,
} from './drawable/state-graph'
import {
  morphRuntimeWebviewOverlayStatesV0,
  morphRuntimeWebviewRenderStateV0,
  renderMorphRuntimeWebviewFrameV0,
} from './runtime/webview-player'

const runtime = {
  version: '0.1.0',
  MORPH_RUNTIME_SCHEMA_V0,
  MORPH_RUNTIME_VERSION_V0,
  createMorphRuntimePlaybackMetadataV0,
  createMorphRuntimeDocumentV0,
  compileDrawableOrnamentRuntimeDocumentFromDatasetV0,
  compileFlowerOrnamentRuntimeDocumentFromDatasetV0,
  compileProceduralSceneRuntimeDocumentFromDatasetV0,
  compileProfileMaskRuntimeDocumentFromDatasetV0,
  compileScrollDemoRuntimeDocumentFromDatasetV0,
  compileSignatureClosedOutlineRuntimeDocumentFromDatasetV0,
  compileSignaturePathMorphProofRuntimeDocumentFromDatasetV0,
  compileSignatureRibbonBaselineRuntimeDocumentFromDatasetV0,
  compileSignatureRuntimeDocumentFromDatasetV0,
  compileSignatureRuntimeDocumentFromMorphDocV1,
  compileMorphRuntimeDocumentV0,
  drawableStateGraphForScene,
  isMorphRuntimeDocumentV0,
  layerMotionStyle,
  legacyMotionTransitionsForScene,
  motionForTrigger,
  motionTransform,
  morphRuntimeWebviewOverlayStatesV0,
  morphRuntimeWebviewRenderStateV0,
  morphRuntimeCachedFieldProgressesV0,
  morphRuntimeFieldCacheSourceLabelV0,
  morphRuntimeFieldCacheStatusV0,
  normalizeDrawableSceneForRuntimeV0,
  renderDrawableLayer,
  renderDrawableScene,
  renderMorphRuntimeDocumentV0,
  renderMorphRuntimeDocumentWithOverlaysV0,
  renderMorphRuntimeWebviewFrameV0,
  serializeMorphRuntimeDocumentV0,
  sampleMorphRuntimeTimelineV2,
  renderMorphRuntimeTimelineFrameV2,
  scrollDemoRuntimeDatasetSpecV0,
  scrollDemoRuntimeDatasetSpecsV0,
  stateEngineDefinitionForDrawableScene,
  validateMorphRuntimeDocumentV0,
}

function compileSignatureRuntimeDocumentFromMorphDocV1(document: any) {
  const compiled = compileSignatureRuntimeDocumentFromMorphDocRuntimeV1(document)
  const layers = document?.authoring?.dataset?.payload?.layers
  const strokes = document?.authoring?.dataset?.payload?.strokes
  if (!Array.isArray(layers) || !Array.isArray(strokes)) return compiled
  const runtimeLayers = compiled.document.scene.layers
  compiled.document.scene.layers = [...layers].reverse().flatMap((layer) => layer.visible
    ? runtimeLayers.filter((_, index) => strokes[index]?.layerId === layer.id)
    : [])
  return compiled
}

const globalTarget = globalThis as typeof globalThis & {
  JonHanlanMorphRuntime?: typeof runtime
}

globalTarget.JonHanlanMorphRuntime = runtime

export type MorphLabRuntime = typeof runtime
export { runtime as morphLabRuntime }
