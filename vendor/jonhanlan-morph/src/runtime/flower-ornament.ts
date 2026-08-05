import flowerOrnamentRuntimeSpecimen from '../../exports/runtime/flower-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const flowerOrnamentRuntimeDocumentV0 =
  flowerOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const flowerOrnamentRuntimeStorageKeyV0 = 'flower-ornament'

export const flowerOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(flowerOrnamentRuntimeSpecimen)).length
