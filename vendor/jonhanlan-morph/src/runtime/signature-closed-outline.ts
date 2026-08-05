import signatureClosedOutlineRuntimeSpecimen from '../../exports/runtime/signature-closed-outline.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const signatureClosedOutlineRuntimeDocumentV0 =
  signatureClosedOutlineRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const signatureClosedOutlineRuntimeStorageKeyV0 = 'signature-closed-outline'

export const signatureClosedOutlineRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(signatureClosedOutlineRuntimeSpecimen)).length
