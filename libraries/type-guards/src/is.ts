import type { Func } from '@rhombus-toolkit/types';

// Two kinds of guard live in this file, and the distinction is the same one
// TypeScript's own lib draws between `Iterator` and `IteratorObject`:
//
//   CONTRACT guards ask "does this satisfy the protocol's shape?" — a duck-type
//   check for the required members. Anything hand-rolled passes.
//
//   PROTOTYPE guards ask "did this come from the intrinsic?" — a walk of the
//   prototype chain looking for the built-in that supplies the protocol. Only
//   runtime-produced values (and generators) pass, and passing means the
//   inherited extras (the ES2025 iterator helpers, `Symbol.dispose`) are there.
//
// Every guard is named for the type it narrows to, so which kind it is can be
// read off the name via the lib type.
//
// INVARIANT: no guard has side effects. None invokes a method on its argument
// — a predicate that runs user code to decide is not a predicate — and the
// intrinsics below are read without calling the seeds, so importing this module
// allocates nothing. The only unavoidable execution is a property *read*, which
// a getter or Proxy trap could observe; there is no structural check without it.

/** Every prototype is derived from these two seeds rather than named directly — the intrinsics have no global bindings. */
function* generatorSeed(): Generator<never> {}
async function* asyncGeneratorSeed(): AsyncGenerator<never> {}

const GeneratorFunctionPrototype: object = Object.getPrototypeOf(generatorSeed);
const AsyncGeneratorFunctionPrototype: object = Object.getPrototypeOf(asyncGeneratorSeed);

/**
 * `%GeneratorPrototype%`, reached through the seed's own `prototype` rather than
 * by calling it — `generatorSeed.prototype` is the object a generator instance
 * would inherit, so its prototype is the intrinsic, and no generator is created.
 */
const GeneratorPrototype: object = Object.getPrototypeOf(generatorSeed.prototype);
const AsyncGeneratorPrototype: object = Object.getPrototypeOf(asyncGeneratorSeed.prototype);

/** `%IteratorPrototype%` — what `Generator` and every built-in iterator inherit from. */
const IteratorPrototype: object = Object.getPrototypeOf(GeneratorPrototype);
const AsyncIteratorPrototype: object = Object.getPrototypeOf(AsyncGeneratorPrototype);

/** The `GeneratorFunction` constructor. Named `…Ctor` so it does not shadow the lib interface of the same name. */
export const GeneratorFunctionCtor: GeneratorFunctionConstructor = generatorSeed
  .constructor as GeneratorFunctionConstructor;
export const AsyncGeneratorFunctionCtor: AsyncGeneratorFunctionConstructor = asyncGeneratorSeed
  .constructor as AsyncGeneratorFunctionConstructor;

/**
 * Whether `value` inherits from `prototype`.
 *
 * @remarks
 * `Object(value)` boxes primitives, so a `string` or `number` walks a real chain
 * instead of throwing. `null` and `undefined` have no chain at all.
 */
function inheritsFrom(value: unknown, prototype: object): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  for (let current = Object.getPrototypeOf(Object(value)); current; current = Object.getPrototypeOf(current)) {
    if (current === prototype) {
      return true;
    }
  }
  return false;
}

/** Whether `value` carries a callable `key`. Boxing makes this safe on primitives; nullish is always false. */
function hasMethod<K extends PropertyKey>(value: unknown, key: K): value is Record<K, Func<unknown[], unknown>> {
  return hasMember(value, key) && isFunction(value[key]);
}

/**
 * Whether `value` carries `key` at all, whatever it holds.
 *
 * @remarks
 * `K` is a type parameter rather than a plain `PropertyKey` so the narrowing names the key that was
 * actually checked: a literal argument makes the result `Record<'foo', unknown>`, where a widened
 * `PropertyKey` would collapse to an index signature that admits every other key too.
 *
 * `Object(value)` boxes primitives, since `in` demands an object where a property read would have
 * boxed on its own. Testing the member's *value* instead would conflate absence with a falsy
 * member — `''` carries `length`.
 */
export function hasMember<K extends PropertyKey>(value: unknown, key: K): value is Record<K, unknown> {
  return hasValue(value) && key in Object(value);
}

/**
 * `value`'s `Symbol.toStringTag`, or its specification class name.
 *
 * @remarks
 * Used as a cross-realm fallback beside the prototype checks: a generator from
 * an iframe, worker, or `vm` context inherits *that* realm's intrinsics, so a
 * prototype comparison against this realm's fails while the tag still reads
 * `Generator`. Spoofable, which is why it is only ever a fallback.
 */
function typeTag(value: unknown): string {
  return Object.prototype.toString.call(value).slice(8, -1);
}
export function isObject(value: any): value is object {
  return hasValue(value) && typeof value === 'object';
}
export function isReadonlyArray(value: any): value is readonly unknown[] {
  return isArray(value);
}
export function isArray(value: any): value is unknown[] {
  return Array.isArray(value);
}

export function isUndefined(value: any): value is undefined {
  return value === undefined;
}
/** Whether `value` is anything other than `undefined` — `null` is a defined value, so it passes. Use {@link hasValue} to exclude both. */
export function isDefined<T>(p: T | undefined): p is T {
  return p !== undefined;
}

export function hasValue<T>(p: T | null | undefined): p is T {
  return isDefined(p) && p !== null;
}

/**
 * Whether `value` is callable.
 *
 * @remarks
 * Narrows to an unconstrained signature deliberately. `typeof` witnesses that something is callable
 * and nothing about what it accepts or returns, so letting a caller name those would dress an
 * unchecked assertion up as a guard — a caller who needs a signature should spell the cast out.
 */
export function isFunction(value: unknown): value is Func<unknown[], unknown> {
  return typeof value === 'function';
}

/** CONTRACT. Whether `value` is thenable, whatever produced it. */
export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return isPromise(value) || hasMethod(value, 'then');
}

/** PROTOTYPE. Whether `value` is a real `Promise`, so `catch`/`finally` are present. A thenable from another realm reads as {@link isPromiseLike} only. */
export function isPromise(value: any): value is Promise<unknown> {
  return isObject(value) && value instanceof Promise;
}

// `URL` is the single identifier in this file that lives in lib.dom, and naming
// it forced the entire DOM lib onto this package and onto anything type-checking
// its declarations. One guard is not worth that, so it is parked rather than
// deleted. It belongs in `platform`, where a structural `Url` type plus a typed
// `globalThis.URL` lookup gives it back without the lib.
//
// export function isUrl(url: any): url is URL {
//     return url instanceof URL;
// }

/** CONTRACT. Whether `value` has a `next`. Sync and async iterators are indistinguishable by shape — use {@link isAsyncIteratorObject} or {@link isAsyncIterable} to tell them apart. */
export function isIterator(value: any): value is Iterator<unknown> {
  return hasMethod(value, 'next');
}

/** CONTRACT. Whether `value` yields an iterator when asked. Strings, arrays, `Map` and `Set` all pass. */
export function isIterable(value: any): value is Iterable<unknown> {
  return isFunction(value?.[Symbol.iterator]);
}

/** CONTRACT. Whether `value` is an iterator that is also iterable, the shape a `for…of` accepts directly. */
export function isIterableIterator(value: any): value is IterableIterator<unknown> {
  return isDefined(value) && isIterator(value) && isIterable(value);
}

/** CONTRACT. Whether `value` yields an async iterator when asked. */
export function isAsyncIterable(value: any): value is AsyncIterable<unknown> {
  return isFunction(value?.[Symbol.asyncIterator]);
}

/** CONTRACT. Whether `value` is an async iterator that is also async-iterable. */
export function isAsyncIterableIterator(value: any): value is AsyncIterableIterator<unknown> {
  return isIterator(value) && isAsyncIterable(value);
}

/**
 * PROTOTYPE. Whether `value` inherits `%IteratorPrototype%`, so the ES2025
 * iterator helpers (`map`, `filter`, `take`, `drop`, `toArray`, …) are present.
 *
 * @remarks
 * A hand-rolled `{ next() { … } }` is an {@link isIterator} but not this.
 */
export function isIteratorObject(value: any): value is IteratorObject<unknown> {
  return inheritsFrom(value, IteratorPrototype);
}

/** PROTOTYPE. The async counterpart of {@link isIteratorObject}. */
export function isAsyncIteratorObject(value: any): value is AsyncIteratorObject<unknown> {
  return inheritsFrom(value, AsyncIteratorPrototype);
}

/** PROTOTYPE. Whether `value` is a generator *object* — what calling a generator function returns, not the function itself. */
export function isGenerator(value: any): value is Generator<unknown> {
  return inheritsFrom(value, GeneratorPrototype) || typeTag(value) === 'Generator';
}

/** PROTOTYPE. Whether `value` is an async generator object. Never true for a sync generator — the two have distinct intrinsics. */
export function isAsyncGenerator(value: any): value is AsyncGenerator<unknown> {
  return inheritsFrom(value, AsyncGeneratorPrototype) || typeTag(value) === 'AsyncGenerator';
}

/** PROTOTYPE. Whether `value` is a generator *function* — the thing you call to get a generator. */
export function isGeneratorFunction(value: any): value is GeneratorFunction {
  if (!isFunction(value)) {
    return false;
  }
  return Object.getPrototypeOf(value) === GeneratorFunctionPrototype || typeTag(value) === 'GeneratorFunction';
}

/** PROTOTYPE. Whether `value` is an async generator function. */
export function isAsyncGeneratorFunction(value: any): value is AsyncGeneratorFunction {
  if (!isFunction(value)) {
    return false;
  }
  return (Object.getPrototypeOf(value) === AsyncGeneratorFunctionPrototype
    || typeTag(value) === 'AsyncGeneratorFunction');
}
