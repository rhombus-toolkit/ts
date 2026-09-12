import { memo } from './memo';

/** Whether `value` is a plain object or array, so its structure — not its identity — is what interning compares. */
function isPlainContainer(value: unknown): value is object {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === Array.prototype || prototype === null;
}

/** `value`'s own fields, described so a caller cannot tell `value` from any object built the same way. */
function* describeStructure(value: object, path: Set<object>): Generator<unknown> {
  if (path.has(value)) {
    throw new TypeError(
      'intern: the value reaches itself through plain objects or arrays, so it has no finite structure',
    );
  }
  path.add(value);
  try {
    if (Array.isArray(value)) {
      yield Array.prototype;
      yield value.length;
      for (let index = 0; index < value.length; index++) {
        yield* describeField(value[index], path);
      }
    } else {
      const entries = Object.entries(value).sort(([left], [right]) => left < right ? -1 : 1);
      yield Object.getPrototypeOf(value);
      yield entries.length;
      for (const [name, fieldValue] of entries) {
        yield name;
        yield* describeField(fieldValue, path);
      }
    }
  } finally {
    path.delete(value);
  }
}

/** `value` as it counts toward a structure: descended into when it is a plain container, held by identity otherwise. */
function* describeField(value: unknown, path: Set<object>): Generator<unknown> {
  if (isPlainContainer(value)) {
    yield* describeStructure(value, path);
    return;
  }
  yield value;
}

/**
 * The instance kept for each structurally equal value, so equal values become `===`.
 *
 * @remarks
 * Structure is the prototype plus the own enumerable string-keyed fields, in any order,
 * descending into plain objects and arrays; any other object counts by identity. A function is
 * its own instance. A value that reaches itself through plain containers throws. An instance
 * lives as long as its prototype and every object its structure refers to by identity; one made
 * only of primitives and plain containers lives as long as the module. A value is keyed as it
 * arrives; changing the kept instance afterwards does not re-key it, so a later value equal to
 * the original still gets that instance back.
 */
export const intern = (() => {
  /** Every value seen, under its described structure; the first seen is the instance kept. */
  const kept = memo((value: object) => value, value => [...describeStructure(value, new Set())]);

  return function intern<T extends object>(value: T): T {
    return typeof value === 'function' ? value : kept(value) as T;
  };
})();
