import signatureRibbonBaselineRuntimeSpecimen from '../../exports/runtime/signature-ribbon-baseline.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const signatureRibbonBaselineRuntimeDocumentV0 =
  signatureRibbonBaselineRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const signatureRibbonBaselineRuntimeStorageKeyV0 = 'signature-ribbon-baseline'

export const signatureRibbonBaselineRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(signatureRibbonBaselineRuntimeSpecimen)).length
