import scratchOrnamentRuntimeSpecimen from '../../exports/runtime/scratch-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scratchOrnamentRuntimeDocumentV0 =
  scratchOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scratchOrnamentRuntimeStorageKeyV0 = 'scratch-ornament'

export const scratchOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scratchOrnamentRuntimeSpecimen)).length
