import relitMarkSetOrnamentRuntimeSpecimen from '../../exports/runtime/relit-mark-set-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const relitMarkSetOrnamentRuntimeDocumentV0 =
  relitMarkSetOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const relitMarkSetOrnamentRuntimeStorageKeyV0 = 'relit-mark-set-ornament'

export const relitMarkSetOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(relitMarkSetOrnamentRuntimeSpecimen)).length
