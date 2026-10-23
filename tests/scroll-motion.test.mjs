import { test } from 'node:test'
import assert from 'node:assert/strict'
import { advanceMotion, seekLatest } from '../src/lib/scroll-motion.ts'

test('motion continues after input stops, settles and reverses', () => {
  let state = { position: 0, velocity: 0 }
  state = advanceMotion(state, 0.8, 1 / 60)
  const first = state.position
  state = advanceMotion(state, 0.8, 1 / 60)
  assert.ok(state.position > first && state.position < 0.8)
  for (let i = 0; i < 120; i++) state = advanceMotion(state, 0.8, 1 / 60)
  assert.equal(state.position, 0.8)
  for (let i = 0; i < 120; i++) state = advanceMotion(state, 0.1, 1 / 60)
  assert.equal(state.position, 0.1)
})

test('response is independent of display refresh rate', () => {
  const sample = fps => {
    let state = { position: 0, velocity: 0 }
    for (let i = 0; i < fps / 2; i++) state = advanceMotion(state, 1, 1 / fps)
    return state.position
  }
  assert.ok(Math.abs(sample(60) - sample(144)) < 0.000001)
})

test('slow decoding coalesces changes and only seeks the newest target', () => {
  const video = { readyState: 4, seeking: true, duration: 10, currentTime: 0 }
  seekLatest(video, 0.8)
  seekLatest(video, 0.2)
  assert.equal(video.currentTime, 0)
  video.seeking = false
  seekLatest(video, 0.2)
  assert.equal(video.currentTime, 1.99)
  video.readyState = 0
  seekLatest(video, 0.9)
  assert.equal(video.currentTime, 1.99)
})
