import grainOrnamentRuntimeSpecimen from '../../exports/runtime/grain-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const grainOrnamentRuntimeDocumentV0 =
  grainOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const grainOrnamentRuntimeStorageKeyV0 = 'grain-ornament'

export const grainOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(grainOrnamentRuntimeSpecimen)).length
