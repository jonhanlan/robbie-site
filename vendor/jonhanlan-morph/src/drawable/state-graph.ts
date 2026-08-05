import type { DrawableScene, DrawableStateGraph, DrawableStateGraphLayer, DrawableStateTransition, MotionPrimitiveConfig } from './types'
import type { StateEngineDefinition, StateTransitionRule } from './state-engine'

export function drawableStateGraphForScene(scene: DrawableScene): DrawableStateGraph {
  return scene.stateGraph ?? {
    entry: scene.entry,
    states: scene.states,
    transitions: scene.transitions ?? legacyMotionTransitionsForScene(scene),
  }
}

export function drawableStateGraphLayersInPriorityOrder(graph: DrawableStateGraph): DrawableStateGraphLayer[] {
  return [...(graph.layers ?? [])]
    .filter((layer) => !layer.disabled)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id))
}

export function stateEngineDefinitionForDrawableScene(scene: DrawableScene, layerId?: string): StateEngineDefinition {
  const graph = drawableStateGraphForScene(scene)
  const layer = layerId ? (graph.layers ?? []).find((candidate) => candidate.id === layerId && !candidate.disabled) : undefined
  const states = {
    ...(graph.states ?? {}),
    ...(layer?.states ?? {}),
  }
  const graphTransitions = graph.transitions?.length
    ? graph.transitions
    : scene.transitions?.length
      ? scene.transitions
      : legacyMotionTransitionsForScene(scene)
  const transitions = [
    ...graphTransitions,
    ...(layer?.transitions ?? []),
  ].filter((transition) => !transition.disabled)

  return {
    entry: graph.entry ?? scene.entry,
    stateIds: Object.keys(states),
    transitions: transitions.map(toStateTransitionRule),
    scrub: scene.scrub,
    proximity: scene.proximity,
  }
}

export function legacyMotionTransitionsForScene(scene: DrawableScene): DrawableStateTransition[] {
  return (scene.motion ?? []).flatMap((motion) => legacyMotionTransitions(scene, motion))
}

function legacyMotionTransitions(scene: DrawableScene, motion: MotionPrimitiveConfig): DrawableStateTransition[] {
  const enter = toStateTransition(motion)
  const transitions: DrawableStateTransition[] = [enter]
  const trigger = motion.trigger === 'hover' ? 'hover-on' : motion.trigger

  if ((trigger === 'hover-on' || trigger === 'hover') && motion.to !== '@return') {
    transitions.push({
      id: motion.returnTo ? `${motion.to}-return` : `${motion.to}-hover-off`,
      from: motion.to,
      to: motion.returnTo ?? scene.returnTarget ?? scene.entry ?? 'rest',
      trigger: 'hover-off',
      durationMs: motion.returnDurationMs ?? motion.durationMs,
      easing: motion.easing,
      fps: motion.fps,
      fpsDivisor: motion.fpsDivisor,
      delayMs: motion.returnDelayMs,
      interrupt: motion.interrupt,
    })
  }

  return transitions
}

function toStateTransition(motion: MotionPrimitiveConfig): DrawableStateTransition {
  return {
    from: '*',
    to: motion.to,
    trigger: motion.trigger === 'hover' ? 'hover-on' : motion.trigger,
    durationMs: motion.durationMs,
    easing: motion.easing,
    fps: motion.fps,
    fpsDivisor: motion.fpsDivisor,
    delayMs: motion.delayMs,
    holdMs: motion.holdMs,
    returnTo: motion.returnTo,
    returnDelayMs: motion.returnDelayMs,
    returnDurationMs: motion.returnDurationMs,
    interrupt: motion.interrupt,
  }
}

function toStateTransitionRule(transition: DrawableStateTransition): StateTransitionRule {
  return {
    id: transition.id,
    from: transition.from,
    to: transition.to,
    trigger: transition.trigger,
    durationMs: transition.durationMs,
    easing: transition.easing,
    fps: transition.fps,
    fpsDivisor: transition.fpsDivisor,
    delayMs: transition.delayMs,
    holdMs: transition.holdMs,
    returnTo: transition.returnTo,
    returnDelayMs: transition.returnDelayMs,
    returnDurationMs: transition.returnDurationMs,
    interrupt: transition.interrupt,
    idleMs: transition.idleMs,
    atScrollPx: transition.atScrollPx,
    style: transition.style,
  }
}
