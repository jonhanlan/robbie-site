import scrollDemoTravelRuntimeSpecimen from '../../exports/runtime/scroll-demo-travel.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoTravelRuntimeDocumentV0 =
  scrollDemoTravelRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoTravelRuntimeStorageKeyV0 = 'scroll-demo-travel'

export const scrollDemoTravelRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoTravelRuntimeSpecimen)).length
