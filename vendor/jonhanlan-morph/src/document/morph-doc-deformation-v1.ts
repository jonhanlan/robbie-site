import { deformPressureRibbonWithTwoPinOneBone } from '../deformation/two-pin-one-bone'
import type { DrawableScene, GeometryPrimitive } from '../drawable/types'

export const MORPH_DOC_DEFORMATION_SCHEMA_V0 = 'morph-deformation/v0'

export type MorphDocDeformationPointV0 = {
  x: number
  y: number
}

export type MorphDocTwoPinOneBoneRigV0 = {
  id: string
  kind: 'two-pin-one-bone'
  pins: {
    root: MorphDocDeformationPointV0
    tip: MorphDocDeformationPointV0
  }
  bone: {
    radius: number
    falloff: number
  }
  targetLayerIds: string[]
  poses: Array<{
    id: string
    posedTip: MorphDocDeformationPointV0
  }>
}

export type MorphDocDeformationV1 = {
  schema: typeof MORPH_DOC_DEFORMATION_SCHEMA_V0
  rigs: MorphDocTwoPinOneBoneRigV0[]
}

export type MorphDocDeformationLayerSummaryV0 = {
  id: string
  geometryKind: GeometryPrimitive['kind']
  stateIds: string[]
}

export function validateMorphDocDeformationV1(
  value: unknown,
  documentStateIds: ReadonlySet<string>,
  layers: readonly MorphDocDeformationLayerSummaryV0[],
): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Morph document deformation must be an object.']
  validateKnownKeys(value, 'deformation', ['rigs', 'schema'], problems)
  if (value.schema !== MORPH_DOC_DEFORMATION_SCHEMA_V0) {
    problems.push(`Morph document deformation schema must be ${MORPH_DOC_DEFORMATION_SCHEMA_V0}.`)
  }
  if (!Array.isArray(value.rigs) || value.rigs.length === 0) {
    problems.push('Morph document deformation rigs must contain at least one rig.')
    return problems
  }

  const layerById = new Map(layers.map((layer) => [layer.id, layer]))
  const rigIds = new Set<string>()
  const claimedTargets = new Set<string>()
  for (const [rigIndex, rig] of value.rigs.entries()) {
    const label = `Morph document deformation rig ${rigIndex + 1}`
    if (!isRecord(rig)) {
      problems.push(`${label} must be an object.`)
      continue
    }
    validateKnownKeys(rig, `deformation.rigs[${rigIndex}]`, ['bone', 'id', 'kind', 'pins', 'poses', 'targetLayerIds'], problems)
    if (!isNonEmptyString(rig.id)) {
      problems.push(`${label} id must be a non-empty string.`)
    } else if (rigIds.has(rig.id)) {
      problems.push(`Morph document deformation rig id "${rig.id}" must be unique.`)
    } else {
      rigIds.add(rig.id)
    }
    if (rig.kind !== 'two-pin-one-bone') problems.push(`${label} kind must be two-pin-one-bone.`)

    const pins = validatePins(rig.pins, label, problems)
    validateBone(rig.bone, label, problems)
    const targets = validateTargets(rig.targetLayerIds, label, layerById, claimedTargets, problems)
    validatePoses(rig.poses, label, pins?.root, documentStateIds, targets, problems)
  }
  return problems
}

/** Bake authoring rigs into ordinary runtime ribbon state geometry. */
export function bakeMorphDocDeformationV1(scene: DrawableScene, deformation: MorphDocDeformationV1 | undefined): void {
  if (!deformation) return
  const claimedTargets = new Set<string>()
  for (const rig of deformation.rigs) {
    for (const layerId of rig.targetLayerIds) {
      if (claimedTargets.has(layerId)) throw new Error(`Deformation target layer ${layerId} belongs to more than one rig.`)
      claimedTargets.add(layerId)
      const layer = scene.layers.find((candidate) => candidate.id === layerId)
      if (!layer || layer.geometry.kind !== 'ribbon') {
        throw new Error(`Deformation target layer ${layerId} must resolve to a ribbon layer.`)
      }
      for (const pose of rig.poses) {
        if (layer.states?.[pose.id] != null) {
          throw new Error(`Deformation pose ${pose.id} collides with existing state geometry on ${layerId}.`)
        }
        const geometry = deformPressureRibbonWithTwoPinOneBone({
          geometry: layer.geometry,
          root: rig.pins.root,
          tip: rig.pins.tip,
          posedTip: pose.posedTip,
          radius: rig.bone.radius,
          falloff: rig.bone.falloff,
        })
        layer.states = {
          ...(layer.states ?? {}),
          [pose.id]: geometry,
        }
      }
    }
  }
}

function validatePins(
  value: unknown,
  label: string,
  problems: string[],
): { root: MorphDocDeformationPointV0; tip: MorphDocDeformationPointV0 } | null {
  if (!isRecord(value)) {
    problems.push(`${label} pins must be an object.`)
    return null
  }
  validateKnownKeys(value, `${label} pins`, ['root', 'tip'], problems)
  const root = validatePoint(value.root, `${label} root pin`, problems)
  const tip = validatePoint(value.tip, `${label} tip pin`, problems)
  if (root && tip && Math.hypot(tip.x - root.x, tip.y - root.y) <= 0) {
    problems.push(`${label} rest bone length must be greater than zero.`)
  }
  return root && tip ? { root, tip } : null
}

function validateBone(value: unknown, label: string, problems: string[]): void {
  if (!isRecord(value)) {
    problems.push(`${label} bone must be an object.`)
    return
  }
  validateKnownKeys(value, `${label} bone`, ['falloff', 'radius'], problems)
  if (!isFiniteNumber(value.radius) || value.radius <= 0) problems.push(`${label} bone radius must be finite and greater than zero.`)
  if (!isFiniteNumber(value.falloff) || value.falloff <= 0) problems.push(`${label} bone falloff must be finite and greater than zero.`)
}

function validateTargets(
  value: unknown,
  label: string,
  layerById: ReadonlyMap<string, MorphDocDeformationLayerSummaryV0>,
  claimedTargets: Set<string>,
  problems: string[],
): MorphDocDeformationLayerSummaryV0[] {
  if (!Array.isArray(value) || value.length === 0) {
    problems.push(`${label} targetLayerIds must contain at least one layer id.`)
    return []
  }
  const local = new Set<string>()
  const targets: MorphDocDeformationLayerSummaryV0[] = []
  for (const layerId of value) {
    if (!isNonEmptyString(layerId)) {
      problems.push(`${label} targetLayerIds must contain non-empty strings.`)
      continue
    }
    if (local.has(layerId)) problems.push(`${label} target layer ${layerId} must be unique.`)
    local.add(layerId)
    if (claimedTargets.has(layerId)) problems.push(`Morph document deformation target layer ${layerId} may belong to only one rig.`)
    claimedTargets.add(layerId)
    const target = layerById.get(layerId)
    if (!target || target.geometryKind !== 'ribbon') {
      problems.push(`${label} target layer ${layerId} must resolve to a ribbon layer.`)
    } else {
      targets.push(target)
    }
  }
  return targets
}

function validatePoses(
  value: unknown,
  label: string,
  root: MorphDocDeformationPointV0 | undefined,
  documentStateIds: ReadonlySet<string>,
  targets: readonly MorphDocDeformationLayerSummaryV0[],
  problems: string[],
): void {
  if (!Array.isArray(value) || value.length === 0) {
    problems.push(`${label} poses must contain at least one named pose.`)
    return
  }
  const poseIds = new Set<string>()
  for (const [poseIndex, pose] of value.entries()) {
    const poseLabel = `${label} pose ${poseIndex + 1}`
    if (!isRecord(pose)) {
      problems.push(`${poseLabel} must be an object.`)
      continue
    }
    validateKnownKeys(pose, `${poseLabel}`, ['id', 'posedTip'], problems)
    if (!isNonEmptyString(pose.id)) {
      problems.push(`${poseLabel} id must be a non-empty string.`)
    } else {
      if (poseIds.has(pose.id)) problems.push(`${label} pose id "${pose.id}" must be unique.`)
      poseIds.add(pose.id)
      if (!documentStateIds.has(pose.id)) problems.push(`${poseLabel} id must name a document state.`)
      for (const target of targets) {
        if (target.stateIds.includes(pose.id)) problems.push(`${poseLabel} id collides with existing state geometry on ${target.id}.`)
      }
    }
    const posedTip = validatePoint(pose.posedTip, `${poseLabel} posedTip`, problems)
    if (root && posedTip && Math.hypot(posedTip.x - root.x, posedTip.y - root.y) <= 0) {
      problems.push(`${poseLabel} posed bone length must be greater than zero.`)
    }
  }
}

function validatePoint(value: unknown, label: string, problems: string[]): MorphDocDeformationPointV0 | null {
  if (!isRecord(value)) {
    problems.push(`${label} must be an object.`)
    return null
  }
  validateKnownKeys(value, label, ['x', 'y'], problems)
  if (!isFiniteNumber(value.x) || !isFiniteNumber(value.y)) {
    problems.push(`${label} must have finite x/y.`)
    return null
  }
  return { x: value.x, y: value.y }
}

function validateKnownKeys(value: Record<string, unknown>, path: string, allowed: string[], problems: string[]): void {
  const allowedSet = new Set(allowed)
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) problems.push(`${path} has unknown field ${key}.`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
