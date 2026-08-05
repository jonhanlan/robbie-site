import flowOrnamentRuntimeSpecimen from '../../exports/runtime/flow-ornament.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const flowOrnamentRuntimeDocumentV0 =
  flowOrnamentRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const flowOrnamentRuntimeStorageKeyV0 = 'flow-ornament'

export const flowOrnamentRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(flowOrnamentRuntimeSpecimen)).length
