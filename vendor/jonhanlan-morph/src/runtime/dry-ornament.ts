import dryOrnamentRuntimeSpecimen from '../../exports/runtime/dry-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const dryOrnamentRuntimeDocumentV0 =
  dryOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const dryOrnamentRuntimeStorageKeyV0 = 'dry-ornament'

export const dryOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(dryOrnamentRuntimeSpecimen)).length
