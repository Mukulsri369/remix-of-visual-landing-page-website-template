import { clampProgress } from './scroll-motion.ts'

// The films contain 24 distinct frames per second. Seek once per source frame,
// rather than asking the phone decoder to reproduce the same frame at 60/120Hz.
export function frameForProgress(progress: number, duration: number, fps = 24) {
  const count = Math.max(1, Math.round(duration * fps))
  const frame = Math.round(clampProgress(progress) * (count - 1))
  return { frame, time: (frame + 0.5) / fps }
}

export type ScrubVideo = Pick<HTMLVideoElement,
  'currentTime' | 'duration' | 'readyState' | 'seeking' | 'addEventListener' | 'removeEventListener'> &
  Partial<Pick<HTMLVideoElement, 'requestVideoFrameCallback' | 'cancelVideoFrameCallback'>>

export type ScrubClock = {
  request: (callback: () => void) => number
  cancel: (id: number) => void
  delay: (callback: () => void, ms: number) => number
  clear: (id: number) => void
}
const clock: ScrubClock = {
  request: callback => requestAnimationFrame(callback),
  cancel: id => cancelAnimationFrame(id),
  delay: (callback, ms) => window.setTimeout(callback, ms),
  clear: id => window.clearTimeout(id),
}

export function createVideoScrubber(video: ScrubVideo, onFrame: () => void, timer = clock) {
  let progress = 0
  let requested = -1
  let busy = false
  let painted = false
  let disposed = false
  let raf = 0
  let fallback = 0
  let frameCallback = 0
  let framesReliable = Boolean(video.requestVideoFrameCallback)
  let missedPaints = 0
  const schedule = () => {
    if (!disposed && !raf) raf = timer.request(pump)
  }
  const complete = () => {
    if (disposed) return
    if (fallback) timer.clear(fallback)
    if (frameCallback) video.cancelVideoFrameCallback?.(frameCallback)
    fallback = frameCallback = 0
    busy = false
    onFrame()
    schedule()
  }
  const pump = () => {
    raf = 0
    if (disposed || busy || video.seeking || video.readyState < 1 || !Number.isFinite(video.duration)) return
    const target = frameForProgress(progress, video.duration)
    if (target.frame === requested) return
    requested = target.frame
    // The already-loaded first frame does not need another decoder round trip.
    if (Math.abs(video.currentTime - target.time) < 1 / 48 && video.readyState >= 2) {
      onFrame()
      return
    }
    busy = true
    painted = false
    if (framesReliable && video.requestVideoFrameCallback) {
      const waitForFrame = () => {
        frameCallback = video.requestVideoFrameCallback((_, metadata) => {
          frameCallback = 0
          if (Math.abs(metadata.mediaTime - target.time) > 1 / 24) { waitForFrame(); return }
          missedPaints = 0
          painted = true
          if (!video.seeking) complete()
        })
      }
      waitForFrame()
    }
    try { video.currentTime = target.time } catch {
      busy = false
      requested = -1
      if (frameCallback) video.cancelVideoFrameCallback?.(frameCallback)
      frameCallback = 0
    }
  }
  const seeked = () => {
    if (!busy) { schedule(); return }
    if (painted) complete()
    // Some browsers omit frame callbacks for paused seeks. Give the compositor
    // a chance to paint, then recover without blocking subsequent input forever.
    else if (!fallback) fallback = timer.delay(() => {
      if (framesReliable && ++missedPaints >= 2) framesReliable = false
      complete()
    }, framesReliable ? 48 : 17)
  }
  video.addEventListener('seeked', seeked)
  video.addEventListener('loadeddata', schedule)
  video.addEventListener('loadedmetadata', schedule)
  return {
    update(value: number, force = false) { progress = value; if (force) requested = -1; schedule() },
    dispose() {
      disposed = true
      timer.cancel(raf)
      timer.clear(fallback)
      if (frameCallback) video.cancelVideoFrameCallback?.(frameCallback)
      video.removeEventListener('seeked', seeked)
      video.removeEventListener('loadeddata', schedule)
      video.removeEventListener('loadedmetadata', schedule)
    },
  }
}
