// Typed counterparts of the `Object.*` statics. Each member pairs a type that
// computes the precise result with a wrapper function that casts the runtime
// call to it — import `obj` and call `obj.keys(x)` where the stock `Object.keys`
// typing is too loose. Nothing here augments the global `ObjectConstructor`.
//
// `obj` is written as a real `export namespace obj { ... }` rather than a barrel
// `export * as obj from './obj'`: rollup-plugin-dts flattens the latter by
// synthesizing `declare const obj_entries: typeof entries` for each merged
// type+function pair, which keeps the value but drops the TYPE half — so
// `obj.entries<T>` (type position) stops resolving in the published `.d.ts`
// even though `obj.entries(x)` (value position) still works. A real namespace
// is passed through as-is.

import type { Flatten, Func, Store, UnionToTuple } from '@rhombus-toolkit/types';

/** The keys `Object.keys` lists — string-named, so a symbol-named member never appears. */
type StringKey<T> = Extract<keyof T, string>;

/** A key the runtime hoists ahead of the others and lists in ascending numeric order. */
type IndexKey<T> = Extract<keyof T, number | `${number}`>;

/** A member declared with `?`, which the object at hand may or may not carry. */
type OptionalKey<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never; }[keyof T];

/**
 * Every reason `T`'s keys cannot be spelled as a tuple.
 *
 * @remarks
 * Where this is inhabited, {@link obj.keys} and {@link obj.entries} keep only their array arm. Each
 * member disqualifies for its own reason: an {@link IndexKey} is listed first and numerically rather
 * than in the order the type holds it, and sorting it into place is not something the type system
 * does cheaply; an {@link OptionalKey} may be absent at the call, so neither the length nor any
 * position after it is fixed; and a `string` index signature admits any number of keys, which would
 * otherwise be tupled as the single key `string`.
 *
 * `${number}` also matches spellings that are not array indices — `'1.5'`, `'-3'` — costing an
 * object keyed that way its tuple and nothing else.
 */
type Untuplable<T> = IndexKey<T> | OptionalKey<T> | (string extends StringKey<T> ? string : never);

type keyTuple<T extends {}> = UnionToTuple<StringKey<T>>;

type ShallowMerge<A, B> = A extends readonly any[] ? B extends readonly any[] ? MergeArrays<A, B> : MergeObjects<A, B>
  : MergeObjects<A, B>;

/**
 * `B` overlaid on `A` index-wise, walking one position at a time and stopping once both are spent.
 * The result is as long as the longer of the two, which is what leaves a short overlay's tail alone.
 *
 * @remarks
 * The walk's budget is a tuple peeled one cell per step rather than a number run down through
 * `Dec`. `Dec<N>` is `Length<Tail<Counter<N>>>` and `Counter` recurses without a bound while its
 * argument is still a parameter, so relating `Dec<TTL>` back to a `TTL extends number` constraint
 * fails at this declaration with "Excessive stack depth" — the same reason `counter`'s own
 * `Subtract` peels tuples instead of routing through `Skip`. It only compiled before because the
 * `Dec` in scope was a generated lookup table, which this package's move onto
 * `@rhombus-toolkit/types` retires.
 */
type MergeArrays<A extends readonly any[], B extends readonly any[]> = _MergeArrays<Store<15>, A, B, [], []>;
type _MergeArrays<TTL extends readonly any[], A extends readonly any[], B extends readonly any[],
  I extends readonly any[], Acc extends readonly any[]> = TTL extends readonly [any, ...infer TTLRest]
    ? Spent<A, B, I> extends true ? Acc
    : _MergeArrays<TTLRest, A, B, [...I, any], [...Acc, MergeValue<A, B, I['length']>]>
    : never;

/**
 * `B`'s element at this index, falling back to `A`'s where `B` has none.
 *
 * @remarks
 * `undefined` counts as "none". A tuple type cannot tell a hole (`[, 7]`) from an explicit
 * `undefined` — both read as `undefined` — so falling back is the only reading available, and it is
 * the one a sparse overlay wants. It does diverge from the runtime, where an explicit `undefined`
 * overwrites.
 */
type MergeValue<A extends readonly any[], B extends readonly any[], N extends number> = At<B, N> extends undefined
  ? At<A, N>
  : At<B, N>;

type MergeObjects<A, B> = Flatten<Omit<A, keyof B> & B>;

/** `T`'s element at `N`, or `undefined` where `T` is too short to have one. */
type At<T extends readonly any[], N extends number> = N extends keyof T ? T[N] : undefined;

/** Whether the walk has reached the end of both `A` and `B`. */
type Spent<A extends readonly any[], B extends readonly any[], I extends readonly any[]> = Covers<A, I> extends true
  ? Covers<B, I> extends true ? true : false
  : false;

/**
 * Whether `I` has walked past everything `T` can offer.
 *
 * @remarks
 * A length of `number` rather than a literal means an unbounded array, or a type parameter still
 * standing in for one. There is no index to walk to, so such an operand is covered from the start
 * and contributes nothing. Without that, a merge inside a generic function has no base case and
 * the checker gives up with an excessive-stack-depth error.
 */
type Covers<T extends readonly any[], I extends readonly any[]> = number extends T['length'] ? true
  : keyof T extends keyof I ? true
  : false;

export namespace obj {
  export type Entry<Key extends string = string, Value = any> = readonly [Key, Value];

  /**
   * The string keys `Object.keys` yields.
   *
   * @remarks
   * The tuple arm carries the order and is withheld whenever {@link Untuplable} finds a reason to
   * doubt it. The array arm is unconditional, so `map` and the rest stay reachable while `T` is still
   * a type parameter — a position where neither the tuple nor the test in front of it can be
   * evaluated, and an unevaluated conditional carries no members at all.
   */
  export type keys<T extends {}> = string & ([Untuplable<T>] extends [never] ? keyTuple<T> : unknown) & ReadonlyArray<
    StringKey<T>
  >;
  export function keys<T extends {}>(obj: T): keys<T> {
    return Object.keys(obj) as any;
  }

  /** The members `Object.values` yields, symbol-named ones excluded as the runtime excludes them. */
  export type values<T extends {}> = T[StringKey<T>];
  export function values<T extends {}>(obj: T): Array<values<T>> {
    return Object.values(obj) as any;
  }

  /** Every pair `T` can yield, each key carrying its own member type rather than the union of all. */
  export type AnyEntry<T extends {}> = { [K in StringKey<T>]: Entry<K, T[K]>; }[StringKey<T>];

  /**
   * The `[key, value]` pairs `Object.entries` yields, in the order {@link keys} lists them.
   *
   * @remarks
   * Withholds its tuple arm on the same condition as {@link keys}, and keeps its array arm for the
   * same reason.
   */
  export type entries<T extends {}> = ([Untuplable<T>] extends [never] ? keysToEntries<T, keyTuple<T>> : unknown)
    & ReadonlyArray<AnyEntry<T>>;
  export function entries<T extends {}>(obj: T): entries<T> {
    return Object.entries(obj) as any;
  }

  /**
   * `Keys` paired with the member each one names on `T`.
   *
   * @remarks
   * The key tuple arrives as a parameter rather than being computed inline so the mapped type reads
   * it as a tuple and hands back a tuple; mapping straight over an unevaluated conditional maps
   * something that contributes `length` and the array methods as members of its own.
   */
  export type keysToEntries<T extends {}, Keys extends ReadonlyArray<StringKey<T>>> = {
    [K in keyof Keys]: Entry<Keys[K], T[Keys[K]]>;
  };

  export type fromEntries<TUnion extends Entry> = { [T in TUnion as T[0]]: T[1]; };
  export function fromEntries<TEntry extends Entry>(entries: readonly TEntry[]): fromEntries<TEntry> {
    return Object.fromEntries(entries) as any;
  }

  /**
   * The result of `Object.assign(target, ...sources)`: each source shallow-merged over the one before
   * it, left to right.
   *
   * @remarks
   * Arrays and objects merge differently, so `ShallowMerge` dispatches on the pair. Two arrays
   * merge INDEX-WISE and the result is as long as the longer of them, which is what makes a short
   * overlay leave the tail alone. Anything else merges by key.
   */
  export type assign<Sources extends readonly any[]> = _assign<Sources, Sources[0] extends readonly any[] ? [] : {}>;
  export function assign<Target extends object, Sources extends any[]>(target: Target,
    ...sources: Sources): assign<[Target, ...Sources]>
  {
    return Object.assign(target, ...sources);
  }

  /**
   * Remaps every pair of `obj` through `fn`, keyed by whatever key each result carries.
   *
   * @remarks
   * `fn` takes the pair as ONE {@link AnyEntry} argument rather than as `(key, value)`, which is what
   * keeps its halves correlated: testing `entry[0]` narrows `entry[1]` to that key's own member type.
   * Spread across two parameters the checker widens them independently, and the callback body sees
   * every key beside every value with no way to tell which pairing it was handed.
   */
  export function mapEntries<Obj extends Record<string, any>, NewEntry extends Entry>(obj: Obj,
    fn: Func<[entry: AnyEntry<Obj>], NewEntry>): fromEntries<NewEntry>
  {
    return fromEntries(entries(obj).map(fn));
  }

  /** Every member of `obj` replaced by what `fn` returns for its pair, the keys left as they are. */
  export function mapValues<Obj extends Record<string, any>, NewValue>(obj: Obj,
    fn: Func<[entry: AnyEntry<Obj>], NewValue>): { [K in StringKey<Obj>]: NewValue; }
  {
    return Object.fromEntries(entries(obj).map(entry => [entry[0], fn(entry)])) as { [K in StringKey<Obj>]: NewValue; };
  }
}

type _assign<Sources extends readonly any[], Result extends {}> = Sources extends readonly [...infer Rest, infer Last]
  ? _assign<Rest, ShallowMerge<Last, Result>>
  : Result;

// export function assignDeep<A extends object, B extends object>(target: A, stuff: B): A & B {
//     if (!(target instanceof Object)) {
//       throw new RangeError('this function only useful on things with an Object prototype');
//     }
//     let current: any = target;
//     while (Reflect.getPrototypeOf(current)?.constructor && Reflect.getPrototypeOf(current)!.constructor !== Object) {
//       current = Reflect.getPrototypeOf(current)!;
//     }
//     Reflect.setPrototypeOf(current, Reflect.getPrototypeOf(stuff));
//     return Object.assign(target, stuff);
//   }
