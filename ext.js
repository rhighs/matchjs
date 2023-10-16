import match from './lib.js'

/**
 * Matches the receiver object against specified patterns.
 *
 * @param {...Function} patterns - The patterns functions to match against the receiver.
 * @returns {any} The result of matching against the patterns.
 */
Object.prototype.matchme = function (...patterns) {
  return match(Object(this))(...patterns);
}

/**
 * Matches each element in an array against specified patterns.
 *
 * @param {...any} patterns - The patterns to match against the array elements.
 */
Array.prototype.matchme = function (...patterns) {
  Array.prototype.forEach.call(this, value => match(value)(...patterns));
}

/**
 * Matches a number against specified patterns.
 *
 * @param {...any} patterns - The patterns to match against the number.
 * @returns {any} The result of matching against the patterns.
 */
Number.prototype.matchme = function (...patterns) {
  return match(Number(this))(...patterns);
}

/**
 * Matches a string against specified patterns.
 *
 * @param {...any} patterns - The patterns to match against the string.
 * @returns {any} The result of matching against the patterns.
 */
String.prototype.matchme = function (...patterns) {
  return match(String(this))(...patterns);
}
