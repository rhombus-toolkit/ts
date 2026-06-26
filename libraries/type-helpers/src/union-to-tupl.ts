import { Func } from '@rhombus-toolkit/func';

type Contravariant<T> = Func<[T]>;
type ForceCV<T> = T extends unknown ? Contravariant<T> : never;
type ExtractCV<T> = T extends Contravariant<infer I> ? I : never;

type UnionToIntersection<T> = ForceCV<T> extends Contravariant<infer I> ? I : never;
type LastInUnion<T> = ExtractCV<UnionToIntersection<ForceCV<T>>>; // extends Contravariant<infer R> ? R : never;
export type UnionToTuple<T> = UnionToTupleWithTailCall<T>;

type UnionToTupleTake1<T> = _UnionToTupleTake1<T, LastInUnion<T>>;
type _UnionToTupleTake1<T, Last> = [T] extends [never] ? [] : [...UnionToTupleTake1<Exclude<T, Last>>, Last];

type UnionToTupleWithTailCall<T, Result extends unknown[] = []> = _UnionToTupleWithTailCall<T, LastInUnion<T>, Result>;
type _UnionToTupleWithTailCall<T, Last, Result extends unknown[]> =
    [T] extends [never] ? Result : UnionToTupleWithTailCall<Exclude<T, Last>, [Last, ...Result]>;

export type TupleToUnion<T extends readonly unknown[]> = T[number];
