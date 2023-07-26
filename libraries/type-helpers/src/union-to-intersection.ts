import { Func } from "@rhombus-toolkit/func";

type Contravariant<T> = T extends any ? Func<[x: T], any> : never;
export type UnionToIntersection<T> = (T extends any ? Func<[T], any> : never) extends Func<[infer R], any> ? R : never;
