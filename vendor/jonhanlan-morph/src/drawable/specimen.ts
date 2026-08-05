import dryOrnamentDatasetJson from '../../exports/datasets/dry-ornament.json'
import flowOrnamentDatasetJson from '../../exports/datasets/flow-ornament.json'
import grainOrnamentDatasetJson from '../../exports/datasets/grain-ornament.json'
import markSetOrnamentDatasetJson from '../../exports/datasets/mark-set-ornament.json'
import proceduralSceneDatasetJson from '../../exports/datasets/procedural-scene.json'
import relitMarkSetOrnamentDatasetJson from '../../exports/datasets/relit-mark-set-ornament.json'
import scratchOrnamentDatasetJson from '../../exports/datasets/scratch-ornament.json'
import stippleOrnamentDatasetJson from '../../exports/datasets/stipple-ornament.json'
import type { DrawableScene, InnerShaderPassConfig, InnerShaderPassFieldInputs, InnerShaderPassRole, InnerShaderPipelinePass } from './types'

function cloneDrawableScene(scene: DrawableScene): DrawableScene {
  return JSON.parse(JSON.stringify(scene)) as DrawableScene
}

function authoredShadePassMarkBudget(config: InnerShaderPassConfig): number {
  const coverage = Math.max(0.08, Math.min(1.2, config.coverage ?? 0.72))
  const intensity = Math.max(0.08, Math.min(1.25, config.intensity ?? 0.4))
  let stateMultiplier = 1
  if (config.markState) {
    for (const key in config.markState) {
      const value = config.markState[key]
      if (Number.isFinite(value)) stateMultiplier = Math.max(stateMultiplier, value)
    }
  }
  const base = 196 * coverage * (0.72 + intensity * 0.48) * Math.max(0, stateMultiplier) * 1.35
  const passBudget = (density: number, scale: number) => (
    (base * Math.max(0.18, Math.min(1.8, density))) / Math.max(0.35, Math.min(2.5, scale))
  )
  if (config.markSet?.length) {
    let total = 0
    for (const mark of config.markSet) total += passBudget((config.densityEdge ?? 0.72) * (mark[1] ?? 1), (config.textureScale ?? 1) * (mark[2] ?? 1))
    return Math.ceil(total)
  }
  return Math.ceil(passBudget(config.densityEdge ?? 0.72, config.textureScale ?? 1))
}

function authoredShadePass(id: string, role: InnerShaderPassRole, lit: boolean, seedOffset: number, config: InnerShaderPassConfig, fieldInputs?: InnerShaderPassFieldInputs): InnerShaderPipelinePass {
  return {
    ...config,
    id,
    role,
    lit,
    seedOffset,
    markBudget: authoredShadePassMarkBudget(config),
    cacheKeyContribution: `${role}:${id}`,
    ...(fieldInputs ? { fieldInputs } : {}),
  }
}

export function createDrawableFieldSpecimenScene(): DrawableScene {
  return {
    id: 'field-engine-specimen',
    kind: 'animate',
    viewBox: [180, 180],
    entry: 'rest',
    states: {
      rest: { kind: 'rest', label: 'Rest' },
      hover: { kind: 'hover', label: 'Hover' },
    },
    motion: [{
      trigger: 'hover',
      to: 'hover',
      durationMs: 420,
      easing: 'easeOutCubic',
      returnTo: 'rest',
      returnDelayMs: 120,
      returnDurationMs: 640,
      interrupt: 'restart',
    }],
    layers: [{
      id: 'field-blob',
      name: 'Field blob',
      geometry: {
        kind: 'closed',
        points: [
          { x: 82, y: 22 },
          { x: 127, y: 35 },
          { x: 148, y: 82 },
          { x: 120, y: 136 },
          { x: 63, y: 142 },
          { x: 27, y: 105 },
          { x: 34, y: 54 },
        ],
      },
      states: {
        hover: {
          kind: 'closed',
          points: [
            { x: 76, y: 19 },
            { x: 137, y: 33 },
            { x: 143, y: 91 },
            { x: 123, y: 128 },
            { x: 66, y: 148 },
            { x: 21, y: 100 },
            { x: 38, y: 47 },
          ],
        },
      },
      resolution: 40,
      smoothing: 0.58,
      edge: {
        intensity: 3.2,
        wobble: 0.12,
        tooth: 0.44,
        breakup: 0.3,
        shortMarks: 0.02,
        rake: 0.04,
        flecks: 0.12,
        speckles: 0.1,
        grain: 0.12,
        fineFibers: 0,
        erosion: 0.14,
        clustering: 0.22,
        detailScale: 0.7,
        outerEdge: 0.9,
        innerEdge: 0.55,
        cornerBite: 0.22,
        inkBleed: 0.14,
        edgeWeight: 0.1,
        dryBrush: 0.18,
        fiberAngle: 0,
        fiberFlow: 0.25,
        clusterScale: 1,
        boilAmount: 0,
        jitterFps: 0,
      },
      fill: {
        fill: '#df7654',
        opacity: 1,
        grain: 0.08,
        hatching: { angle: -16, spacing: 9, weight: 0.45 },
      },
      inner: {
        innerShadow: {
          angle: 180,
          offset: 0.08,
          intensity: 0.62,
          style: 'dots',
          spread: 1.12,
          textureScale: 0.82,
          contourAlign: 0.82,
          coverage: 0.82,
          fieldDepth: 1.22,
          fieldSoftness: 0.92,
          fieldContrast: 0.22,
          densityEdge: 0.84,
          densityFalloff: 0.9,
          sizeFalloff: 0.82,
          lengthFalloff: 0.78,
          cornerSmoothing: 0.62,
          hardStop: false,
        },
        highlight: {
          angle: 180,
          offset: 0.1,
          intensity: 0.34,
          style: 'stipple',
          spread: 1.08,
          textureScale: 0.7,
          contourAlign: 0.7,
          coverage: 0.72,
          fieldDepth: 1,
          fieldSide: 'outside',
          fieldOffset: 0.16,
          fieldSoftness: 0.86,
          fieldContrast: 0.1,
          densityEdge: 0.56,
          densityFalloff: 0.82,
          sizeFalloff: 0.72,
          lengthFalloff: 0.82,
          cornerSmoothing: 0.5,
          hardStop: false,
        },
        autoBalance: {
          enabled: true,
          shadowCoverage: 0.72,
          highlightCoverage: 0.5,
          overlap: 0.16,
          separation: 0.12,
          curvedFormBias: 0.7,
        },
      },
      passes: {
        fill: true,
        edge: true,
        innerShadow: true,
        highlight: true,
        grain: true,
        hatching: true,
      },
    }],
  }
}

export function createDrawablePublicRuntimeSpecimenScene(): DrawableScene {
  return cloneDrawableScene(proceduralSceneDatasetJson.proceduralScene as unknown as DrawableScene)
}

export function createDrawableScratchOrnamentScene(): DrawableScene {
  return cloneDrawableScene(scratchOrnamentDatasetJson.scratchOrnament as unknown as DrawableScene)
}

export function createDrawableStippleOrnamentScene(): DrawableScene {
  return cloneDrawableScene(stippleOrnamentDatasetJson.stippleOrnament as unknown as DrawableScene)
}

export function createDrawableFlowOrnamentScene(): DrawableScene {
  return cloneDrawableScene(flowOrnamentDatasetJson.flowOrnament as unknown as DrawableScene)
}

export function createDrawableGrainOrnamentScene(): DrawableScene {
  return cloneDrawableScene(grainOrnamentDatasetJson.grainOrnament as unknown as DrawableScene)
}

export function createDrawableDryOrnamentScene(): DrawableScene {
  return cloneDrawableScene(dryOrnamentDatasetJson.dryOrnament as unknown as DrawableScene)
}

export function createDrawableMarkSetOrnamentScene(): DrawableScene {
  return cloneDrawableScene(markSetOrnamentDatasetJson.markSetOrnament as unknown as DrawableScene)
}

export function createDrawableRelitMarkSetOrnamentScene(): DrawableScene {
  return cloneDrawableScene(relitMarkSetOrnamentDatasetJson.relitMarkSetOrnament as unknown as DrawableScene)
}
