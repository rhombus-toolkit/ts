import { Func } from "@rhombus-toolkit/func";

type Contravariant<T> = T extends any ? Func<[x: T], any> : never;
export type UnionToIntersection<T> = Contravariant<T> extends Func<[infer R], any> ? R : never;
