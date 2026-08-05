import proceduralSceneRuntimeSpecimen from '../../exports/runtime/procedural-scene.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const proceduralSceneRuntimeDocumentV0 =
  proceduralSceneRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const proceduralSceneRuntimeStorageKeyV0 = 'procedural-scene'

export const proceduralSceneRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(proceduralSceneRuntimeSpecimen)).length
