import { Func } from '@rhombus-toolkit/func';

type Contravariant<T> = Func<[T]>;
type ForceCV<T> = T extends unknown ? Contravariant<T> : never;
type ExtractCV<T> = T extends Contravariant<infer I> ? I : never;

type UnionToIntersection<T> = ForceCV<T> extends Contravariant<infer I> ? I : never;
type LastInUnion<T> = ExtractCV<UnionToIntersection<ForceCV<T>>>; // extends Contravariant<infer R> ? R : never;
export type UnionToTuple<T, Last = LastInUnion<T>> =
    [T] extends [never] ? readonly [] : readonly [...UnionToTuple<Exclude<T, Last>>, Last];
