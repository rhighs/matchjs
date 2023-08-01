import { test } from 'node:test'
import assert from 'node:assert'
import match from './lib.js'

// Test for 'match' function
test('match should correctly match patterns and return expressions', t => {
  const matcher1 = match(42)
  const result1 = matcher1(42, 'Pattern 1', null, 'default case')

  const matcher2 = match('Hello')
  const result2 = matcher2(
    Number,
    'Pattern 2',
    String,
    'Pattern 3',
    null,
    'default case'
  )

  const matcher3 = match(true)
  const result3 = matcher3(
    true,
    'Pattern 4',
    false,
    'Pattern 5',
    null,
    'default case'
  )

  const matcher4 = match({ type: 'square', side: 4 })
  const result4 = matcher4(
    { type: 'square', side: Number },
    shape => `Area of square: ${shape.side ** 2}`,
    { type: 'circle', radius: Number },
    shape => `Area of circle: ${Math.PI * shape.radius ** 2}`,
    null,
    'default case'
  )

  assert.equal(result1, 'Pattern 1')
  assert.equal(result2, 'Pattern 3')
  assert.equal(result3, 'Pattern 4')
  assert.equal(result4, 'Area of square: 16')
})
