/**
 * Drawable Scene motion — pure helpers that turn a MotionPrimitiveConfig into the
 * per-layer CSS transform + transition (with stagger). Framework-agnostic; the site
 * driver and the lab preview both consume these so motion plays identically.
 */
import type { DrawableScene, MotionPrimitiveConfig, MotionTrigger } from './types'

const DEFAULT_DURATION_MS = 320
const DEFAULT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function motionTransform(transform: MotionPrimitiveConfig['transform']): string {
  if (!transform) return 'none'
  const tx = transform.tx ?? 0
  const ty = transform.ty ?? 0
  const scale = transform.scale ?? 1
  const rotate = transform.rotate ?? 0
  if (!tx && !ty && scale === 1 && !rotate) return 'none'
  return `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rotate}deg)`
}

/** Find the motion entry for a trigger ('rest' returns null = settle to neutral). */
export function motionForTrigger(scene: DrawableScene, trigger: MotionTrigger | string): MotionPrimitiveConfig | null {
  if (trigger === 'rest') return null
  return (scene.motion ?? []).find((m) => m.trigger === trigger) ?? null
}

export type LayerMotionStyle = { transform: string; transition: string; transitionDelay: string }

/** The inline style for one layer at a motion state (per-layer stagger by index). */
export function layerMotionStyle(motion: MotionPrimitiveConfig | null, layerIndex: number): LayerMotionStyle {
  const durationMs = motion?.durationMs ?? DEFAULT_DURATION_MS
  const easing = motion?.easing ?? DEFAULT_EASING
  const delay = Math.max(0, (motion?.delayMs ?? 0) * layerIndex)
  return {
    transform: motion ? motionTransform(motion.transform) : 'none',
    transition: `transform ${durationMs}ms ${easing}`,
    transitionDelay: `${delay}ms`,
  }
}
