# matchjs

A simple library that enables pattern matching based on value types or structure patterns.

## Installing

```bash
$ npm install --save @rhighs/matchjs
```

```html
<script src="path/to/lib.js"></script>
```

## Examples

```js
const match = require('@rhighs/matchjs')

const value = { name: 'Rob', age: 23 } 
const result = match(
  { name: 'Rob' },
  _ => 'Hello, Rob!',

  { age: 23 },
  _ => 'You are 23 years old!',

  null, _ => 'No match found!'
)(value) 

console.log(result) 
> Hello, Rob!
```

```js
const result = match(
  42, 'Pattern 1',
  null, _ => 'default case'
)(42)

console.log(result) 
> Pattern 1
```

```js
const result = match(
  Number, 'Pattern 2',
  String, 'Pattern 3',
  null, 'default case'
)('Hello')  

console.log(result)
> Pattern 3
```

```js
const result = match(
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

  null, 'default case'
)({
  type: 'square',
  side: 4
})  

console.log(result)
> Area of square: 16
```

```js
const testObject = {
  firstName: 'foo',
  lastName: 'baz',
  points: [
    { x: 10, y: 12 },
    { x: 0, y: 1 }
  ],
  timeMetrics: {
    range: { from: 0, to: 100 },
    units: 'seconds',
    target: 12
  }
} 

const result = match(
  {
    firstName: String,
    lastName: 'baz',
    points: [{ x: 10, y: match.any }]
  },
  ({ firstName, points: [{ y }] }) => `${firstName} is at y: ${y}`,

  {
    firstName: String,
    lastName: match.any
  },
  ({ firstName, lastName }) => `${firstName} has last name: ${lastName}`,

  null, _ => 'default case'
)(testObject)  

console.log(result)
> foo is at y: 12
```

```js
const complexArray = [
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

const result = match(
  [[{ x: 10, y: Number }]],
  matched => matched.reduce((acc, v) => ([...acc, ...v.map(({ y }) => y)]), []).join(', '),

  [[{ x: match.any }]],
  _ => console.log("Can't happen"),

  null, _ => 'default case'
)(complexArray)  

console.log(result)
> 2, 2, 4
```

```js
const testObject = {
  name: 'Alice',
  height: 185,
  age: 35,
  occupation: 'Software Engineer'
}

const result = match(
  {
    name: String,
    height: match.cond(v => v > 170),
    age: match.cond(v => v >= 30),
    occupation: String
  },
  ({ name, height, age, occupation }) => `${name} is ${height}cm tall, ${age} years old, and works as a ${occupation}.`,

  null, _ => 'default case'
)(testObject)

console.log(result)
> Alice is 185cm tall, 35 years old, and works as a Software Engineer.
```

```js
const testObject = {
  name: 'Rob',
  age: 23,
  city: 'Lucerne',
  interests: ['Gaming', 'Reading', 'Cooking']
}

const result = match(
  {
    name: String,
    city: String,
    age: match.cond(v => v < 30),
    interests: match.cond(v => Array.isArray(v) && v.length > 2)
  },
  ({ name, age, interests }) => `${name} is ${age} years old and has diverse interests: ${interests.join(', ')}.`,

  null, _ => 'default case'
)(testObject)

console.log(result)
> Rob is 23 years old and has diverse interests: Gaming, Reading, Cooking.
```
