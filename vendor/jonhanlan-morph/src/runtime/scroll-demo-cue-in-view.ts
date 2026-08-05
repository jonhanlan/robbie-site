import scrollDemoCueInViewRuntimeSpecimen from '../../exports/runtime/scroll-demo-cue-in-view.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoCueInViewRuntimeDocumentV0 =
  scrollDemoCueInViewRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoCueInViewRuntimeStorageKeyV0 = 'scroll-demo-cue-in-view'

export const scrollDemoCueInViewRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoCueInViewRuntimeSpecimen)).length
