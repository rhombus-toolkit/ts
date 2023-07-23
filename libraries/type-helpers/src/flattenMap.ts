import { Func } from '@rhombus-toolkit/func';
import { Cast } from './cast';
import { Inc } from './counter';
import { DeepDictionary, DeepDictionaryItem } from './deep-record';
import { fromEntries } from './obj';
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
  return [a, b].filter(Boolean).join(".") as join<S1, S2>;
}
type join<A extends string, B extends PropertyKey> =
  A extends '' ? B :
  B extends '' ? A :
  `${A}.${Cast<B, string>}`;

export type flattenMap<T, TLeaf> = fromEntries<_flattenMap<T, TLeaf, ''>>;
type _flattenMap<T, Leaf, prefix extends string> =
  T extends Leaf ? [prefix, T] :
  T extends Record<any, any> ? {
    [K in keyof T]: _flattenMap<T[K], Leaf, join<prefix, K>>
  }[keyof T] :
  never;

export function flattenMap<T extends DeepDictionary<Leaf>, Leaf>(map: T, leafPredicate: (p: any) => p is Leaf): flattenMap<T, Leaf> {
  const result: (readonly [string, Leaf])[] = [];
  const stack = Object.entries(map);
  while (stack.length) {
    const [prefix, branchOrLeaf] = stack.pop()!;
    if (leafPredicate(branchOrLeaf)) {
      result.push([prefix, branchOrLeaf]);
    } else {
      Object.entries(branchOrLeaf).forEach(([key, p]) => stack.push([join(prefix, key), p]));
    }
  }
  return fromEntries(result) as flattenMap<T, Leaf>;
}
