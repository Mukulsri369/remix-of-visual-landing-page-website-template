export type Motion = { position: number; velocity: number }

// Exact critically damped spring, stable across refresh rates with a soft release.
export function advanceMotion(state: Motion, target: number, seconds: number): Motion {
  const dt = Math.max(0, Math.min(seconds, 0.1))
  const frequency = 18
  const offset = state.position - target
  const impulse = state.velocity + frequency * offset
  const decay = Math.exp(-frequency * dt)
  const position = target + (offset + impulse * dt) * decay
  const velocity = (state.velocity - frequency * impulse * dt) * decay
  if (Math.abs(position - target) < 0.00001 && Math.abs(velocity) < 0.0001) {
    return { position: target, velocity: 0 }
  }
  return { position: Math.max(0, Math.min(1, position)), velocity }
}

export function seekLatest(video: HTMLVideoElement, progress: number) {
  if (video.readyState < 2 || video.seeking || !Number.isFinite(video.duration)) return
  const time = progress * Math.max(0, video.duration - 0.05)
  if (Math.abs(video.currentTime - time) > 1 / 90) video.currentTime = time
}
