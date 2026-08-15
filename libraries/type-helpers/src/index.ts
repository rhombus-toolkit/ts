/**
 * @deprecated Split up. The types are `@rhombus-toolkit/types`, `obj` and `flattenMap` are
 * `@rhombus-toolkit/obj`, and `restify`/`unrestify` are `@rhombus-toolkit/restify`. This package is
 * a re-export shim over those three and will not be developed further.
 *
 * @remarks
 * A shim over a package that shipped runtime cannot be a pure re-export, and cannot pretend the
 * major is invisible. What changed for a caller who does nothing:
 *
 * - `CheapRingBuffer`, `range`/`rangeArray`, `nodeCallbackToAsync`, `tuple` and `identity` are gone
 *   rather than moved. Code using them breaks, which is what the major number is for.
 * - `Take` and `Skip` return what they always documented. They used to hand back the whole input
 *   array, so anything that had adapted to the old answer is now wrong.
 * - `Inc`/`Dec` resolve to the recursive counter instead of the generated 4096-entry lookup table.
 *   The one visible difference is `Dec<0>`, which is `never` where the table gave `-1`.
 * - Every name below that was renamed keeps its old spelling HERE and only here; the new home
 *   exports it under the new name.
 *
 * Never part of this barrel even before the split: `curry`, `Lazy` and `tuple` were commented out
 * of it. The `Curry` type is in `@rhombus-toolkit/types`, `Lazy` is `@rhombus-toolkit/singleton`'s,
 * and the rest of that runtime goes with this major.
 */

export { flattenMap, obj } from '@rhombus-toolkit/obj';
export { restify, unrestify } from '@rhombus-toolkit/restify';
export type { Cast, Dec, DeepDictionary, DeepDictionaryItem, DeepRecord, DeepRecordItem, Dictionary, Except, Falsy,
  Flatten, IfEquals, Inc, MakeRequired, Mutable, ReadonlyKeys, Simplify, Truthy, UnionToIntersection, UnionToTuple,
  WritableKeys, WritablePart } from '@rhombus-toolkit/types';
export type { Body, Head, Last, Length, PartialList, Skip, Slice, SplitArray, Tail,
  Take } from '@rhombus-toolkit/types/array';
export type { ClearEmpties, Join, Split } from '@rhombus-toolkit/types/string';

// The renames. Each old name is a misnomer the types package fixed at the definition -- `Opaque`
// because `Brand` is the community term, the `is*` pair because they select a branch rather than
// answering a question, and the string pair because `Str`/`Stringable` said neither what they take
// nor what they give back.
export type { Brand as Opaque, IfFalsy as isFalsy, IfTruthy as isTruthy } from '@rhombus-toolkit/types';
export type { AsString as Str, ToStringable as Stringable } from '@rhombus-toolkit/types/string';
