/**
 * Checks if an object instance belongs to a particular class.
 * @param {Function|Number|String|Boolean} classDef - The class definition to compare against.
 * @param {Object|Number|String|Boolean} instance - The instance to check the class against.
 * @returns {boolean} - Returns true if the instance belongs to the class; otherwise, false.
 */
const ofClass = (classDef, instance) => {
  if (typeof classDef === 'function' && typeof instance === 'object') {
    return new classDef().constructor === instance.constructor
  }

  if (classDef === Number) return typeof instance === 'number'
  if (classDef === String) return typeof instance === 'string'
  if (classDef === Boolean) return typeof instance === 'boolean'

  return false
}

/**
 * Checks if the structure of the test object matches the structure of the against object.
 * The comparison can be done based on class type or recursively on nested objects.
 *
 * @param {any} testStruct - The object or class definition to test.
 * @param {any} againstStruct - The object or class definition to test against.
 * @returns {boolean} - Returns true if the structure of the test object matches the against object; otherwise, false.
 */
const hasMatchingStructure = (testStruct, againstStruct) => {
  if (ofClass(testStruct, againstStruct)) return true

  if (typeof testStruct === 'object' && typeof againstStruct === 'object')
    return includesAllFields(testStruct, againstStruct)

  return againstStruct === testStruct
}

/**
 * Checks if a given key and value pair is included in the target object based on the value's structure.
 * If the value is a true boolean, it checks if the key exists in the target object.
 * Otherwise, it performs a recursive structure comparison on the value against the corresponding key in the target object.
 *
 * @param {string} key - The key to be checked for existence in the target object.
 * @param {any} value - The value to be compared against the target object's corresponding key.
 * @param {Object} against - The target object to check for the key-value pair.
 * @returns {boolean} - Returns true if the key-value pair is included in the target object; otherwise, false.
 */
const includesField = (key, value, against) => {
  if (value === true) return Object.keys(against).includes(key)
  return hasMatchingStructure(value, against[key])
}

/**
 * Checks if the test object includes all the fields from the against object.
 * @param {Object} testStruct - The object to test.
 * @param {Object} againstStruct - The object to test against.
 * @returns {boolean} - Returns true if all fields of the test object are included in the against object; otherwise, false.
 */
const includesAllFields = (testObject, againstObject) =>
  Object.entries(testObject).every(([k, v]) =>
    includesField(k, v, againstObject)
  )

/**
 * Destructures the parameters of the match function.
 * @param  {...any} args - The arguments passed to the match function.
 * @returns {Array} - Returns an array containing pairs of patterns and expressions, and a default expression if provided.
 * @throws {Error} - Throws an error if duplicate default case detected (null pattern) or the number of arguments is not even.
 */
const destructureMatchParams = (...args) => {
  let defaultExpr = null
  const pairs = []

  for (let i = 0; i < args.length; i += 2) {
    const pattern = args[i]
    const expr = args[i + 1]

    if (pattern === null) {
      if (defaultExpr !== null)
        throw new Error(
          '[match]: duplicate default case detected (null pattern)'
        )
      defaultExpr = expr
      continue
    }

    pairs.push([pattern, expr])
  }

  return [pairs, defaultExpr]
}

/**
 * The match function allows pattern matching based on the value type or structure.
 * @param {any} value - The value to be matched against patterns.
 * @returns {Function} - Returns a function that takes pairs of patterns and expressions for pattern matching.
 * @throws {Error} - Throws an error if the number of arguments passed to the function is not even.
 */
const match =
  value =>
  (...args) => {
    if (value === undefined || value === null) return null

    if (args.length % 2 !== 0)
      throw new Error('[match]: number of arguments must be even')

    const [pairs, defaultExpr] = destructureMatchParams(...args)

    for (const [pattern, expression] of pairs) {
      if (ofClass(pattern, value))
        return typeof expression === 'function' ? expression(value) : expression

      if (typeof value !== typeof pattern) continue

      if (hasMatchingStructure(pattern, value)) {
        if (typeof expression === 'function') {
          const arg =
            value instanceof Object
              ? Object.keys(pattern).reduce(
                  (acc, k) => ({ ...acc, [k]: value[k] }),
                  {}
                )
              : value
          return expression(arg)
        }

        return expression
      }

      if (value === pattern)
        return typeof expression === 'function' ? expression(value) : expression
    }

    return typeof defaultExpr === 'function' ? defaultExpr(value) : defaultExpr
  }

export default match
