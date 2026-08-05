import markSetOrnamentRuntimeSpecimen from '../../exports/runtime/mark-set-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const markSetOrnamentRuntimeDocumentV0 =
  markSetOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const markSetOrnamentRuntimeStorageKeyV0 = 'mark-set-ornament'

export const markSetOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(markSetOrnamentRuntimeSpecimen)).length
