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

/** Whether `value` carries a callable `key`; a primitive reads through its box, nullish reads nothing. */
function hasMethod<K extends PropertyKey>(value: any, key: K): value is Record<K, Func<unknown[], unknown>> {
  return isFunction(value?.[key]);
}

/**
 * Whether `value` carries `key` at all, whatever it holds.
 *
 * @remarks
 * `K` is a type parameter (not a plain `PropertyKey`) so a literal key narrows to `Record<'foo',
 * unknown>` instead of collapsing to an index signature. `Object(value)` boxes primitives, since
 * testing the member's value instead would conflate absence with a falsy member — `''` carries
 * `length`.
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
  return value !== null && typeof value === 'object';
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
  return p !== null && p !== undefined;
}

/** The function members of `T`, or a callable `T` when it names none; `Function` rather than `Func` because `Func`'s contravariant parameters would reject a `Func<[T], U>` member. */
type FunctionOf<T> = Extract<T, Function> extends infer F ? [F] extends [never] ? T & Func
  : Function extends F ? F & Func
  : F
  : never;

/** Whether `value` is callable; a type argument can only restate what `value` already is. */
export function isFunction<T>(value: T): value is T & FunctionOf<T> {
  return typeof value === 'function';
}

/** CONTRACT. Whether `value` is thenable, whatever produced it. */
export function isPromiseLike(value: any): value is PromiseLike<unknown> {
  return hasMethod(value, 'then');
}

/** PROTOTYPE. Whether `value` is a real `Promise`, so `catch`/`finally` are present. A thenable from another realm reads as {@link isPromiseLike} only. */
export function isPromise(value: any): value is Promise<unknown> {
  return value instanceof Promise;
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
  return isIterator(value) && isIterable(value);
}

/** CONTRACT. Whether `value` yields an async iterator when asked. */
export function isAsyncIterable(value: any): value is AsyncIterable<unknown> {
  return isFunction(value?.[Symbol.asyncIterator]);
}

/** CONTRACT. Whether `value` is an async iterator that is also async-iterable. */
export function isAsyncIterableIterator(value: any): value is AsyncIterableIterator<unknown> {
  return isIterator(value) && isAsyncIterable(value);
}

/** The `Symbol.toStringTag` of every built-in sync iterator kind, the cross-realm fallback of {@link isIteratorObject}. */
const IteratorTags: ReadonlySet<string> = new Set(['Iterator', 'Array Iterator', 'Map Iterator', 'Set Iterator',
  'String Iterator', 'RegExp String Iterator', 'Iterator Helper', 'Generator']);

/**
 * PROTOTYPE. Whether `value` inherits `%IteratorPrototype%`, so the ES2025
 * iterator helpers (`map`, `filter`, `take`, `drop`, `toArray`, …) are present
 * — and carries the `next` they pull through, so calling one works.
 *
 * @remarks
 * A hand-rolled `{ next() { … } }` is an {@link isIterator} but not this.
 * `Object.create(Iterator.prototype)` and `class B extends Iterator {}` are the
 * mirror case: they inherit the helpers with no `next` to drive them, and every
 * helper throws, so they fail here too. A built-in iterator from another realm
 * is recognised by its tag, as {@link isGenerator} does.
 */
export function isIteratorObject<T>(value: Iterator<T> | Iterable<T>): value is IteratorObject<T>;
export function isIteratorObject(value: unknown): value is IteratorObject<unknown>;
export function isIteratorObject(value: any) {
  return (inheritsFrom(value, IteratorPrototype) || IteratorTags.has(typeTag(value))) && isIterator(value);
}

/** PROTOTYPE. The async counterpart of {@link isIteratorObject}; across realms only an async generator carries a tag to fall back on. */
export function isAsyncIteratorObject(value: any): value is AsyncIteratorObject<unknown> {
  return inheritsFrom(value, AsyncIteratorPrototype) || typeTag(value) === 'AsyncGenerator';
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

/**
 * Whether every element of `items` is present — none are `undefined`.
 *
 * @remarks
 * Takes an array rather than any `Iterable`: deciding this reads to the end, and a one-shot source
 * would be spent by the call.
 */
export function isAllThere<T>(items: Array<T | undefined>): items is T[];
export function isAllThere<T>(items: ReadonlyArray<T | undefined>): items is readonly T[];
export function isAllThere(items: readonly unknown[]): boolean {
  return items.every(item => item !== undefined);
}
