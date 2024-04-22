const isNullOrUndefined = (v) => v === null || v === undefined;

class MatchAny {}

class MatchCond {
  constructor(expr, isFunc) {
    this.isFunc = isFunc;
    this.expr = expr;
  }

  eval(value) {
    if (this.isFunc) {
      return !!this.expr(value);
    }
    return !!this.expr;
  }
}

const ofClass = (classDef, instance) => {
  if (classDef !== null && classDef !== undefined && instance === null)
    return false;

  if (typeof classDef === "function" && typeof instance === "object") {
    return new classDef().constructor === instance.constructor;
  }

  if (classDef === Number) return typeof instance === "number";
  if (classDef === String) return typeof instance === "string";
  if (classDef === Boolean) return typeof instance === "boolean";

  return false;
};

const hasMatchingStructure = (testStruct, againstStruct) => {
  if (ofClass(testStruct, againstStruct)) return true;

  const testIsArray = ofClass(Array, testStruct);
  const againstIsArray = ofClass(Array, againstStruct);

  if (typeof testStruct === "object" && testIsArray && againstIsArray) {
    return testStruct.every((t) =>
      againstStruct.some((a) => hasMatchingStructure(t, a))
    );
  }

  if (
    typeof testStruct === "object" &&
    typeof againstStruct === "object" &&
    !testIsArray &&
    !againstIsArray &&
    !isNullOrUndefined(testStruct) &&
    !isNullOrUndefined(againstStruct)
  ) {
    return includesAllFields(testStruct, againstStruct);
  }

  return againstStruct === testStruct;
};

const resolveMatchingStructure = (patternStruct, againstStruct) => {
  if (
    typeof patternStruct === "object" &&
    ofClass(Array, patternStruct) &&
    ofClass(Array, againstStruct)
  ) {
    const collection = new Set();

    for (const p of patternStruct)
      for (const a of againstStruct)
        if (hasMatchingStructure(p, a))
          collection.add(resolveMatchingStructure(p, a));

    const out = Array.from(collection);
    return out;
  }

  if (typeof patternStruct === "object" && typeof againstStruct === "object") {
    const keys = Object.keys(patternStruct);
    const result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      result[key] = resolveMatchingStructure(
        patternStruct[key],
        againstStruct[key]
      );
    }
    return result;
  }

  return againstStruct;
};

const includesField = (key, value, against) => {
  if (value === MatchAny) return Object.keys(against).includes(key);
  if (value instanceof MatchCond) return value.eval(against[key]);
  return hasMatchingStructure(value, against[key]);
};

const includesAllFields = (testObject, againstObject) =>
  Object.entries(testObject).every(([k, v]) =>
    includesField(k, v, againstObject)
  );

const isBadArrayPattern = (pattern) =>
  ofClass(Array, pattern) &&
  pattern.length > 1 &&
  pattern.some((o) => o instanceof Object);

const isBadPattern = (pattern) =>
  pattern instanceof Object
    ? Object.values(pattern).some((v) => isBadPattern(v))
    : isBadArrayPattern(pattern);

const destructureMatchParams = (...args) => {
  let defaultExpr = null;
  const pairs = [];

  for (let i = 0; i < args.length; i += 2) {
    const pattern = args[i];
    const expr = args[i + 1];

    if (isBadPattern(pattern))
      throw new Error(
        "[match]: cannot use more than entry when matching arrays for objects"
      );

    if (pattern === null) {
      if (defaultExpr !== null)
        throw new Error(
          "[match]: duplicate default case detected (null pattern)"
        );
      defaultExpr = expr;
      continue;
    }

    pairs.push([pattern, expr]);
  }

  return [pairs, defaultExpr];
};

/**
 * Allows pattern matching based on the value type or structure.
 * @param {...any} args - Pairs of patterns and expressions for pattern matching.
 * @returns {Function} - Returns a function that takes a value to match patterns on.
 * @throws {Error} - Throws an error if the number of arguments passed to the function is not even.
 */
const match = (...args) => {
  if (args.length % 2 !== 0)
    throw new Error("[match]: number of arguments must be even");
  const [pairs, defaultExpr] = destructureMatchParams(...args);

  return (value) => {
    for (const [pattern, expression] of pairs) {
      if (ofClass(pattern, value))
        return typeof expression === "function"
          ? expression(value)
          : expression;

      if (typeof value !== typeof pattern) continue;

      if (hasMatchingStructure(pattern, value)) {
        if (typeof expression === "function") {
          const arg = resolveMatchingStructure(pattern, value);
          return expression(arg);
        }

        return expression;
      }

      if (value === pattern)
        return typeof expression === "function"
          ? expression(value)
          : expression;
    }

    return typeof defaultExpr === "function" ? defaultExpr(value) : defaultExpr;
  };
};

match.any = MatchAny;
match.cond = (pred) =>
  new MatchCond(pred, typeof pred === "function" && pred.call);

export default match;
