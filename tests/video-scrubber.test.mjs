import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createVideoScrubber, frameForProgress } from '../src/lib/video-scrubber.ts'

function fixture(withFrames = true) {
  let id = 0
  const frames = new Map(), delays = new Map(), paints = new Map(), events = new Map()
  const seeks = [], waits = []
  let time = 0
  const video = {
    duration: 10, readyState: 4, seeking: false,
    get currentTime() { return time },
    set currentTime(value) { time = value; seeks.push(value); video.seeking = true },
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener: name => events.delete(name),
    ...(withFrames ? {
      requestVideoFrameCallback: callback => { paints.set(++id, callback); return id },
      cancelVideoFrameCallback: key => paints.delete(key),
    } : {}),
  }
  const timer = {
    request: callback => { frames.set(++id, callback); return id },
    cancel: key => frames.delete(key),
    delay: (callback, ms) => { waits.push(ms); delays.set(++id, callback); return id },
    clear: key => delays.delete(key),
  }
  const flush = map => { const batch = [...map.values()]; map.clear(); batch.forEach(callback => callback()) }
  let displayed = 0
  const player = createVideoScrubber(video, () => displayed++, timer)
  return {
    player, video, seeks, waits, frames, delays, paints, events,
    get displayed() { return displayed },
    tick: () => flush(frames),
    finishSeek: () => { video.seeking = false; events.get('seeked')?.() },
    paint: (mediaTime = time) => {
      const batch = [...paints.values()]; paints.clear()
      batch.forEach(callback => callback(0, { mediaTime }))
    },
    recover: () => flush(delays),
  }
}

test('all source frames remain addressable, with safe endpoints', () => {
  assert.equal(frameForProgress(-1, 10).frame, 0)
  assert.equal(frameForProgress(2, 10).frame, 239)
  assert.ok(frameForProgress(1, 10).time < 10)
  const frames = new Set(Array.from({ length: 240 }, (_, i) => frameForProgress(i / 239, 10).frame))
  assert.equal(frames.size, 240)
})

test('seek completion waits for paint and coalesces a rapid reversal', () => {
  const f = fixture()
  f.player.update(0.6); f.tick()
  assert.equal(f.seeks.length, 1)
  f.player.update(0.9); f.player.update(0.2); f.tick()
  assert.equal(f.seeks.length, 1)
  f.finishSeek(); f.tick()
  assert.equal(f.seeks.length, 1, 'seeked alone must not interrupt an unpainted frame')
  f.paint(); f.tick()
  assert.equal(f.seeks.length, 2)
  assert.equal(f.seeks[1], frameForProgress(0.2, 10).time)
  f.player.dispose()
})

test('high refresh inputs in the same source frame do not trigger more decoding', () => {
  const f = fixture()
  f.player.update(0.5); f.tick(); f.finishSeek(); f.paint(); f.tick()
  f.player.update(0.50001); f.tick()
  assert.equal(f.seeks.length, 1)
  assert.equal(f.frames.size, 0, 'no animation work remains when settled')
  f.player.dispose()
})

test('paused-seek fallback handles browsers without frame callbacks', () => {
  const f = fixture(false)
  f.player.update(0.7); f.tick(); f.finishSeek()
  f.player.update(0.3); f.tick()
  assert.equal(f.seeks.length, 1)
  f.recover(); f.tick()
  assert.equal(f.seeks.length, 2)
  f.player.dispose()
})

test('a missing frame callback recovers, stale callbacks cannot survive disposal', () => {
  const f = fixture()
  f.player.update(0.6); f.tick(); f.finishSeek()
  f.player.update(0.4); f.tick(); f.recover(); f.tick()
  assert.equal(f.seeks.length, 2)
  f.player.dispose()
  assert.equal(f.paints.size + f.frames.size + f.delays.size + f.events.size, 0)
})

test('an old compositor frame cannot release the next seek', () => {
  const f = fixture()
  f.player.update(0.7); f.tick()
  f.paint(0)
  f.finishSeek(); f.player.update(0.1); f.tick()
  assert.equal(f.seeks.length, 1)
  f.paint(); f.tick()
  assert.equal(f.seeks.length, 2)
  f.player.dispose()
})


test('a browser with broken paused-frame callbacks switches to a short paint fallback', () => {
  const f = fixture()
  for (const progress of [0.2, 0.4, 0.6]) {
    f.player.update(progress); f.tick(); f.finishSeek(); f.recover(); f.tick()
  }
  assert.deepEqual(f.waits, [48, 48, 17])
  f.player.dispose()
})
