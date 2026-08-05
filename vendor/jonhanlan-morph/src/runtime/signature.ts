import signatureRuntimeSpecimen from '../../exports/runtime/signature.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const signatureRuntimeDocumentV0 =
  signatureRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const signatureRuntimeStorageKeyV0 = 'signature'

export const signatureRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(signatureRuntimeSpecimen)).length
