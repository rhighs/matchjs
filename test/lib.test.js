import { test } from 'node:test'
import assert from 'node:assert'
import match from '../lib.js'

test('match simple objects and primitves', _ => {
  // prettier-ignore
  let result = match(42) (
    42, 'Pattern 1',
    null, 'default case'
  )
  assert.equal(result, 'Pattern 1')

  // prettier-ignore
  result = match('Hello') (
    Number, 'Pattern 2',
    String, 'Pattern 3',
    null,   'default case'
  )
  assert.equal(result, 'Pattern 3')

  // prettier-ignore
  result = match('Hello') (
    Number, 'Pattern 2',
    'Hello', 'Pattern 3',
    null,   'default case'
  )
  assert.equal(result, 'Pattern 3')

  // prettier-ignore
  result = match (true) (
    true,   'Pattern 4',
    false,  'Pattern 5',
    null,   'default case'
  )
  assert.equal(result, 'Pattern 4')

  // prettier-ignore
  result = match({ type: 'square', side: 4 }) (
    {
      type: 'square',
      side: Number
    },
    shape => `Area of square: ${shape.side ** 2}`,

    { 
      type: 'circle',
      radius: Number
    },
    shape => `Area of circle: ${Math.PI * shape.radius ** 2}`,

    null, _ => 'default case'
  )
  assert.equal(result, 'Area of square: 16')
})

test('match deeply nested objects', _ => {
  const testObject = {
    firstName: 'foo',
    lastName: 'baz',
    points: [
      {
        x: 10,
        y: 12
      },
      {
        x: 0,
        y: 1
      }
    ],
    timeMetrics: {
      range: {
        from: 0,
        to: 100
      },
      units: 'seconds',
      target: 12
    }
  }

  // prettier-ignore
  let result = match(testObject) (
    {
      firstName: String,
      lastName: 'baz',
      points: [{
        x: 10, y: match.Any
      }]
    },
    ({ firstName, points: [{ y }] }) => `${firstName} is at y: ${y}`,

    { 
      firstName: String,
      lastName: match.Any
    },
    ({ firstName, lastName }) => `${firstName} has last name: ${lastName}`,

    null, _ => 'default case'
  )
  assert.equal(result, 'foo is at y: 12')

  // prettier-ignore
  result = match(testObject) (
    {
      timeMetrics: {
        range: {
          from: match.Any,
          to: 100,
        },
        units: String,
        target: Number
      }
    },
    ({ timeMetrics: { range: { from, to }, units, target }}) =>
    `to reach ${to} in ${target} ${units} we need to start at position ${from}`,

    {
      timeMetrics: {
        target: String,
          lol: [
              {}, {}
          ]
      }
    }, ({ timeMetrics: target }) => `our target is ${target}`,

    [
      {
        timeMetrics: match.Any,
      }
    ], ([{ timeMetrics }]) => `timeMetrics: ${timeMetrics}`,

    null, _ => 'default case'
  )
  assert.equal(
    result,
    'to reach 100 in 12 seconds we need to start at position 0'
  )
})

test('match simple arrays', _ => {
  let testObject = [...Array.from({ length: 10 }).map((_, i) => i)]

  // prettier-ignore
  let result = match(testObject) (
        [
            1, 2, 3
        ], ([one, two, three]) => `${one} ${two} ${three}`,

        [
            11, 12
        ], ([ eleven, twelve ]) => `${eleven} + ${twelve}`,

        [
            {}
        ], matched => matched,
        
        null, _ => 'default'
    )
  assert.equal(result, `1 2 3`)

  // prettier-ignore
  result = match(testObject.map(v => v += 10)) (
        [
            1, 2, 3
        ], ([one, two, three]) => `${one} ${two} ${three}`,

        [
            11, 12
        ], ([ eleven, twelve ]) => `${eleven} + ${twelve}`,

        [
            {}
        ], matched => matched,
        
        null, _ => 'default'
    )
  assert.equal(result, `11 + 12`)
})

test('match complex arrays (with objects and arrays)', _ => {
  let testObject = [
    {
      name: 'foo',
      height: { value: 183, unit: 'cm' }
    },
    {
      name: 'bar',
      height: { value: 6, unit: 'ft' }
    },
    {
      name: 'baz',
      height: { value: 172, unit: 'cm' }
    }
  ]

  // prettier-ignore
  let result = match(testObject) (
    [
        1
    ], _ => 'can\'t happen',

    [
        {
            name: String,
            height: { value: match.Any, unit: 'cm' }
        }
    ], matched =>
        'people with height in cm have names: ' + matched.map(({ name }) => name).join(', '),
    
    null, _ => 'default case'
  )
  assert.equal(result, 'people with height in cm have names: foo, baz')

  testObject = [
    [
      { x: 2, y: 1 },
      { x: 10, y: 2 }
    ],
    [
      { x: 7, y: 3 },
      { x: 10, y: 2 }
    ],
    [
      { x: 10, y: 4 },
      { x: 11, y: 0 },
      { x: 12, y: 6 },
      { x: 13, y: 9 },
      { x: 14, y: 2 }
    ]
  ]

  // prettier-ignore
  result = match (testObject) (
    [
        [
            { x: 10, y: Number }
        ]
    ], matched => matched.reduce((acc, v) => ([...acc, ...v.map(({ y }) => y)]), []).join(', '),

    [
        [
            { x: match.Any }
        ]
    ], _ => console.log('can\'t happen'),

    null, _ => 'default case'
  )

  assert.equal(result, '2, 2, 4')
})
