import type { Func } from './func';
import type { UnionToIntersection } from './UnionToIntersection';

type Contravariant<T> = Func<[T]>;
type ForceCV<T> = T extends unknown ? Contravariant<T> : never;
type ExtractCV<T> = T extends Contravariant<infer I> ? I : never;

// `ExtractCV`'s `infer` position carries no bound, so its result reads as `unknown` while `T` is
// still a type parameter. Filtering over `T` here restates that bound, which is what lets the
// caller index by the tuple's elements.
type LastInUnion<T> = Extract<T, ExtractCV<UnionToIntersection<ForceCV<T>>>>;

/**
 * `T`'s union members as a tuple.
 *
 * @remarks
 * Member order is whatever order the compiler's union-to-intersection conversion produces, not
 * declaration order — treat it as unordered unless `T` has exactly one member.
 */
export type UnionToTuple<T> = _UnionToTuple<T, T, readonly []>;

/**
 * `Members` is the full union, held fixed while `T` is eaten one member at a time, so the growing
 * `Result` keeps a bound the shrinking `T` can no longer state.
 */
type _UnionToTuple<Members, T extends Members, Result extends readonly Members[],
  Last extends Members = LastInUnion<T>> = [T] extends [never] ? Result
    : _UnionToTuple<Members, Exclude<T, Last>, readonly [Last, ...Result]>;

export type TupleToUnion<T extends readonly unknown[]> = T[number];
