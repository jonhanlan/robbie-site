import profileMaskDataset from '../../exports/datasets/profile-mask.json'
import type { HandDrawnMorphEdgeStyle, HandDrawnMorphPathInput } from '../hand-drawn-morph-engine'
import type { MorphMachineDef, MorphPoseDef, MorphScrubDef, MorphTransitionDef } from '../morph-machine'

export const PROFILE_MASK_STORAGE_KEY_V0 = 'jonhanlan-profile-mask-v2'
export const PROFILE_MASK_FALLBACK_IMAGE_V0 = '/images/profile-portrait-treated.webp'

export type ProfileMaskLegacySpecimenV0 = {
  label?: string
  where?: string
  image?: string
  pathA?: HandDrawnMorphPathInput
  pathB?: HandDrawnMorphPathInput
  edgeStyle?: Partial<HandDrawnMorphEdgeStyle>
  fps?: number
  poses?: MorphPoseDef[]
  entry?: string
  transitions?: MorphTransitionDef[]
  scrub?: MorphScrubDef | null
}

export const profileMaskLegacySpecimenV0 =
  profileMaskDataset.profileMask as unknown as ProfileMaskLegacySpecimenV0

export function profileMaskLegacyMachineV0(entry: ProfileMaskLegacySpecimenV0): MorphMachineDef | undefined {
  if (!entry.poses?.length) return undefined
  return {
    poses: entry.poses,
    entry: entry.entry,
    transitions: entry.transitions ?? [],
    scrub: entry.scrub ?? undefined,
  }
}
