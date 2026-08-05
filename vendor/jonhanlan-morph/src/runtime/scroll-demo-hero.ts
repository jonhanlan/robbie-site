import scrollDemoHeroRuntimeSpecimen from '../../exports/runtime/scroll-demo-hero.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const scrollDemoHeroRuntimeDocumentV0 =
  scrollDemoHeroRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const scrollDemoHeroRuntimeStorageKeyV0 = 'scroll-demo-hero'

export const scrollDemoHeroRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(scrollDemoHeroRuntimeSpecimen)).length
