import { test } from 'node:test'
import assert from 'node:assert/strict'
import { advanceMotion } from '../src/lib/scroll-motion.ts'

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


test('the softer release stays monotonic and reaches 99% within half a second', () => {
  let state = { position: 0, velocity: 0 }
  for (let i = 0; i < 30; i++) {
    const previous = state.position
    state = advanceMotion(state, 1, 1 / 60)
    assert.ok(state.position >= previous && state.position <= 1)
  }
  assert.ok(state.position > 0.99)
  assert.ok(state.position < 1, 'retain a gentle settling tail rather than snapping')
})
