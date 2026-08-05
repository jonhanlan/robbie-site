import scrollDemoCombinedRuntimeSpecimen from '../../exports/runtime/scroll-demo-combined.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoCombinedRuntimeDocumentV0 =
  scrollDemoCombinedRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoCombinedRuntimeStorageKeyV0 = 'scroll-demo-combined'

export const scrollDemoCombinedRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoCombinedRuntimeSpecimen)).length
