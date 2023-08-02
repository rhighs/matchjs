# matchjs

**matchjs** is a JavaScript library that enables pattern matching based on value types or structures. It provides a `match` function that allows for pattern matching and conditional execution of expressions based on the matching patterns.

## Installation

To use the **matchjs** library in your project, you can include the `match.js` file directly:

```html
<script src="path/to/lib.js"></script>
```

## Function: `match(value)`

The `match` function allows pattern matching based on the value type or structure.

- `value` (any): The value to be matched against patterns.

**Returns**: (Function) Returns a function that takes pairs of patterns and expressions for pattern matching.

## Usage

Below is an example of how you can use the **matchjs** library:

```javascript
const value = { name: 'John', age: 30 } 

// Example 1: Simple objects
const result = match(value) (
  { name: 'John' },
  _ => 'Hello, John!', // Expression 1

  { age: 25 },
  _ => 'You are 25 years old!', // Expression 2

  null, _ => 'No match found!' // Default expression
) 

console.log(result)  // Output: "Hello, John!"

// Example 2: Simple primitives and default case
let result = match(42) (
  42, 'Pattern 1', // expression or callable function
  null, _ => 'default case'
) 
console.log(result)  // Output: "Pattern 1"

result = match('Hello') (
  Number, 'Pattern 2',
  String, 'Pattern 3',
  null, 'default case'
) 
console.log(result)  // Output: "Pattern 3"

// Example 3: Complex objects with nested matching
result = match({
  type: 'square',
  side: 4
}) (
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
) 
console.log(result)  // Output: "Area of square: 16"

// Example 4: Deeply nested objects
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

result = match(testObject) (
  {
    firstName: String,
    lastName: 'baz',
    points: [{ x: 10, y: match.Any }]
  },
  ({ firstName, points: [{ y }] }) => `${firstName} is at y: ${y}`,

  {
    firstName: String,
    lastName: match.Any
  },
  ({ firstName, lastName }) => `${firstName} has last name: ${lastName}`,

  null, _ => 'default case'
) 
console.log(result)  // Output: "foo is at y: 12"

// Example 5: Complex arrays with objects and nested matching
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

result = match(complexArray) (
  [[{ x: 10, y: Number }]],
  matched => matched.reduce((acc, v) => ([...acc, ...v.map(({ y }) => y)]), []).join(', '),

  [[{ x: match.Any }]],
  _ => console.log("Can't happen"),

  null, _ => 'default case'
) 
console.log(result)  // Output: "2, 2, 4"
```

## License

This project is licensed under the [MIT License]('./LICENSE.md')
