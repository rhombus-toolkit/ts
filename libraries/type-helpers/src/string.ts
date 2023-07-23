export type Stringable = string | number | boolean | bigint | undefined | null;

export type Join<T extends unknown[], D extends string> =
  T extends [] ? '' :
  T extends [Stringable] ? `${T[0]}` :
  T extends [Stringable, ...infer U] ? `${T[0]}${D}${Join<U, D>}` :
  string;

type IfEmpty<T extends string, IsEmptyResult, NotEmptyResult> = T extends "" ? IsEmptyResult : NotEmptyResult;

export type Split<S extends string, D extends string> = _Split<S, D, []>;
type _Split<S extends string, D extends string, Acc extends string[]> =
  S extends `${infer T}${D}${infer U}` ? _Split<U, D, IfEmpty<T, Acc, [...Acc, T]>> : //  [T, ..._Split<U, D>] :
  IfEmpty<S, Acc, [...Acc, S]>;


type a = Split<' sdfg', ' '>
type b = 'qwer asdf' extends `${infer T} ${infer U}` ? [T, U] : never;


