import signaturePathMorphProofRuntimeSpecimen from '../../exports/runtime/signature-path-morph-proof.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const signaturePathMorphProofRuntimeDocumentV0 =
  signaturePathMorphProofRuntimeSpecimen as unknown as MorphRuntimeDocumentV0

export const signaturePathMorphProofRuntimeStorageKeyV0 = 'signature-path-morph-proof'

export const signaturePathMorphProofRuntimeArtifactBytesV0 =
  new TextEncoder().encode(JSON.stringify(signaturePathMorphProofRuntimeSpecimen)).length
