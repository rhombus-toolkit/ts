import { isFunction } from '@rhombus-toolkit/type-guards';
import type { Cast, Dec, DeepDictionary, DeepDictionaryItem, DeepRecord, DeepRecordItem, Falsy, Func, Inc,
  Store } from '@rhombus-toolkit/types';
import { obj } from './obj';
// type _flattenMap<T extends DeepDictionaryItem<Func>, prefix extends string = '', CurrentDepth extends number = 0> =
//   CurrentDepth extends 10 ? never :
//   T extends DeepDictionary<Func> ? {
//     [K in keyof T]: _flattenMap<T[K], prefix extends '' ? K : `${prefix}.${Cast<K, string>}`, Inc<CurrentDepth>>
//   }[keyof T] : [prefix, T]

// export type flattenMap<T extends DeepDictionary<Func>> = fromEntries<_flattenMap<T>>;
// export function flattenMap<T extends DeepDictionary<Func>>(map: T): flattenMap<T> {
//   const result: any = {};
//   const stack = Object.entries(map);
//   while (stack.length) {
//     const [prefix, mapOrFun] = stack.pop()!;
//     if (typeof mapOrFun === 'function') {
//       result[prefix] = mapOrFun;
//     } else {
//       for (const [key, p] of Object.entries(mapOrFun)) {
//         stack.push([join(prefix, key), p]);
//       }
//     }
//   }
//   return result;
// }

function join<S1 extends string, S2 extends string>(a: S1, b: S2) {
  return [a, b].filter(Boolean).join('.') as join<S1, S2>;
}
/** `A` and `B` dot-joined, either one being empty giving the other back on its own. */
// Every arm is `string`-shaped, `Cast<B, string>` included: a `B` of `symbol` or `number` has no
// literal spelling, so it widens to `string` rather than escaping as a non-string key — otherwise
// the empty-`A` arm would hand a bare `PropertyKey` to `_flattenMap`'s `prefix extends string`.
type join<A extends string, B extends PropertyKey> = A extends Falsy ? Cast<B, string>
  : B extends Falsy ? A : `${A}.${Cast<B, string>}`;

/** `T`'s leaves keyed by the dot-joined path each one sits at. */
export type flattenMap<T extends DeepDictionary<any>, TLeaf = Func, MaxDepth extends number = 10> = obj.fromEntries<
  _flattenMap<T, TLeaf, '', Store<MaxDepth>>
>;

/** The descent, `Budget` spending one cell per level. */
// `Budget` is a tuple rather than a number run down through `Dec`: `Dec<N>` is
// `Length<Tail<Counter<N>>>`, and relating that back to a `number`-constrained parameter drags
// `Counter`'s unbounded recursion into the comparison, which fails here with "Excessive stack
// depth". `Store<MaxDepth>` does the number-to-tuple conversion once, at the public entry, so the
// depth stays a plain number for a caller.
type _flattenMap<T extends DeepDictionary<any>, Leaf, prefix extends string, Budget extends readonly any[]> =
  Budget extends readonly [any, ...infer Rest]
    ? T extends Leaf ? [prefix, T]
    : T extends Record<any, any> ? { [K in keyof T]: _flattenMap<T[K], Leaf, join<prefix, K>, Rest>; }[keyof T]
    : never
    : never;

/** Flattens `map`, treating functions as leaves. */
export function flattenMap<T extends DeepDictionary<Func>>(map: T): flattenMap<T>;

/** Flattens `map`, `leafPredicate` deciding what counts as a leaf. */
export function flattenMap<T extends DeepDictionary<Leaf>, Leaf>(map: T,
  leafPredicate: (p: any) => p is Leaf): flattenMap<T, Leaf>;

export function flattenMap(map: DeepDictionary<any>, leafPredicate: (p: any) => boolean = isFunction): any {
  const result: Array<obj.Entry<string, any>> = [];
  const stack = Object.entries(map);
  while (stack.length) {
    const [prefix, branchOrLeaf] = stack.pop()!;
    if (leafPredicate(branchOrLeaf)) {
      result.push([prefix, branchOrLeaf]);
    } else {
      Object.entries(branchOrLeaf).forEach(([key, p]) => stack.push([join(prefix, key), p]));
    }
  }
  return obj.fromEntries(result);
}
