import scrollDemoPageRuntimeSpecimen from '../../exports/runtime/scroll-demo-page.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoPageRuntimeDocumentV0 =
  scrollDemoPageRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoPageRuntimeStorageKeyV0 = 'scroll-demo-page'

export const scrollDemoPageRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoPageRuntimeSpecimen)).length
