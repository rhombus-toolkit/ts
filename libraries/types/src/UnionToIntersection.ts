import { Func } from './func';

type Contravariant<T> = T extends any ? Func<[x: T], any> : never;

/**
 * `T`'s union members as an intersection.
 *
 * @remarks
 * Puts each member in a parameter position, where the checker's own
 * contravariance collapses the union to an intersection, then reads it back out.
 */
export type UnionToIntersection<T> = Contravariant<T> extends Func<[infer R], any> ? R : never;
