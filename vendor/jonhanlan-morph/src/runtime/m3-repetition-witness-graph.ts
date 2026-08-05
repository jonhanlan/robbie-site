import graphRuntimeSpecimen from '../../exports/runtime/m3-repetition-witness-graph.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const m3RepetitionWitnessGraphRuntimeDocumentV0 =
  graphRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const m3RepetitionWitnessGraphRuntimeStorageKeyV0 = 'm3-repetition-witness-graph'

export const m3RepetitionWitnessGraphRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(graphRuntimeSpecimen)).length
