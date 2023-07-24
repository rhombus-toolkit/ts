export type Stringable = string | number | boolean | bigint | undefined | null;
export type Join<T extends readonly Stringable[], D extends string> = _Join<ClearEmpties<T>, D>;
type _Join<T extends readonly Stringable[], D extends string> =
  T extends [] ? '' :
  T extends [Stringable] ? `${T[0]}` :
  T extends [Stringable, ...infer U extends Stringable[]] ? `${T[0]}${D}${Join<U, D>}` :
  string;

export type ClearEmpties<T extends readonly Stringable[]> = _ClearEmpties<T, []>;
type _ClearEmpties<T extends readonly Stringable[], Result extends readonly Stringable[]> =
  T extends [infer X extends Stringable, ...infer Rest extends readonly Stringable[]] ? _ClearEmpties<Rest, IfEmpty<X, Result, [...Result, X]>> :
  Result;

type IfEmpty<T extends Stringable, IsEmptyResult, NotEmptyResult> = T extends "" ? IsEmptyResult : NotEmptyResult;

export type Split<S extends Stringable, D extends Stringable> = _Split<S, D, []>;
type _Split<S extends Stringable, D extends Stringable, Acc extends readonly string[]> =
  S extends `${infer T}${D}${infer U}` ? _Split<U, D, IfEmpty<T, Acc, [...Acc, T]>> : //  [T, ..._Split<U, D>] :
  IfEmpty<S, Acc, [...Acc, S]>;