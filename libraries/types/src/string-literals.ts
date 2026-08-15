/** Everything a template literal type can interpolate. */
export type ToStringable = string | number | bigint | boolean | null | undefined;

/**
 * `T` narrowed to its string part.
 *
 * @remarks
 * The idiom `string & T` in one name: it keeps a template literal slot happy
 * while preserving whatever literal type `T` already carried.
 */
export type AsString<T> = string & T;

/** The string literal `T` interpolates to — `ToStringLiteral<42>` is `'42'`. */
export type ToStringLiteral<T extends ToStringable> = `${T}`;

/**
 * `T`'s members interpolated and joined with `D`, empties dropped.
 *
 * ```ts
 * Join<['a', '', 'b'], '-'>   // -> 'a-b'
 * Join<[], '-'>               // -> ''
 * ```
 */
export type Join<T extends readonly ToStringable[], D extends string> = _Join<ClearEmpties<T>, D, undefined>;

/**
 * The accumulator carries `undefined` until the first member lands, which is
 * what keeps the delimiter *between* members instead of in front of the first.
 */
type _Join<T extends readonly ToStringable[], D extends string, Result extends string | undefined> = T extends
  readonly [infer Head extends ToStringable, ...infer Tail extends readonly ToStringable[]]
  ? _Join<Tail, D, Result extends undefined ? `${Head}` : `${Result}${D}${Head}`>
  : Result extends string ? Result
  : '';

/** `T` without its empty-string members. */
export type ClearEmpties<T extends readonly ToStringable[]> = _ClearEmpties<T, []>;
type _ClearEmpties<values extends readonly ToStringable[], Result extends readonly ToStringable[]> = values extends
  readonly [infer head extends ToStringable, ...infer tail extends readonly ToStringable[]]
  ? _ClearEmpties<tail, IfEmpty<head, Result, [...Result, head]>>
  : Result;

type IfEmpty<T, IsEmptyResult, NotEmptyResult> = T extends '' ? IsEmptyResult : NotEmptyResult;

/**
 * `T` cut at every `D`, empties dropped.
 *
 * ```ts
 * Split<'a-b--c', '-'>   // -> ['a', 'b', 'c']
 * ```
 */
export type Split<T extends string, D extends ToStringable> = _Split<T, D, []>;
type _Split<T, D extends ToStringable, Result extends readonly string[]> = T extends `${infer Head}${D}${infer Tail}`
  ? _Split<Tail, D, IfEmpty<Head, Result, [...Result, Head]>>
  : IfEmpty<T, Result, [...Result, T]>;
