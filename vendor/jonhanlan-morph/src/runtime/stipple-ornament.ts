import stippleOrnamentRuntimeSpecimen from '../../exports/runtime/stipple-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const stippleOrnamentRuntimeDocumentV0 =
  stippleOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const stippleOrnamentRuntimeStorageKeyV0 = 'stipple-ornament'

export const stippleOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(stippleOrnamentRuntimeSpecimen)).length
