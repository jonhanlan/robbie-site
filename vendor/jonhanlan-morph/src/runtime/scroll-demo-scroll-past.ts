import scrollDemoScrollPastRuntimeSpecimen from '../../exports/runtime/scroll-demo-scroll-past.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoScrollPastRuntimeDocumentV0 =
  scrollDemoScrollPastRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoScrollPastRuntimeStorageKeyV0 = 'scroll-demo-scroll-past'

export const scrollDemoScrollPastRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoScrollPastRuntimeSpecimen)).length
