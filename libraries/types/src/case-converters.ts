import { DigitChar, LowerCaseChar, UpperCaseChar } from './chars';
import { Join, Split } from './string-literals';

/** A tuple whose length is `N`, so `N` can be counted down by popping cells instead of by arithmetic. */
type Budget<N extends number, Acc extends unknown[] = []> = Acc['length'] extends N ? Acc
  : Budget<N, [...Acc, unknown]>;

// #region the word tuple

/** A parsed identifier as its words, each keeping the casing it was written with. */
export type Words = readonly string[];

// #endregion

// #region capital-boundary segmentation

/** True when a word boundary falls before `C`, given the previous char `Prev` and the following chars `R`. */
type IsBoundary<Prev extends string, C extends string, R extends string> = C extends UpperCaseChar
  ? Prev extends LowerCaseChar ? true
  : Prev extends UpperCaseChar | DigitChar ? R extends `${LowerCaseChar}${string}` ? true : false
  : false
  : C extends DigitChar ? Prev extends LowerCaseChar ? LeadsToAcronym<`${C}${R}`> extends true ? true : false : false
  : false;

/** True when the leading digit run of `S` is followed by an acronym rather than a lowercase-initial word. */
type LeadsToAcronym<S extends string> = S extends `${DigitChar}${infer R}` ? LeadsToAcronym<R>
  : S extends `${UpperCaseChar}${infer R2}` ? R2 extends `${LowerCaseChar}${string}` ? false : true
  : false;

/** `S` with a space inserted before every word boundary. */
type Scan<S extends string, Prev extends string = '', Acc extends string = ''> = S extends `${infer C}${infer R}`
  ? Scan<R, C, IsBoundary<Prev, C, R> extends true ? `${Acc} ${C}` : `${Acc}${C}`>
  : Acc;

/** True when `W` contains a lowercase letter, marking it a word to keep rather than an acronym run to chunk. */
type HasLower<W extends string> = W extends `${string}${LowerCaseChar}${string}` ? true : false;

/** Each segment kept as-is if it holds a lowercase letter, else chunked into acronym pieces. */
type ChunkSegments<Segs extends readonly string[], N extends number> = Segs extends
  readonly [infer H extends string, ...infer T extends string[]]
  ? [...(HasLower<H> extends true ? [H] : ChunkRun<H, N>), ...ChunkSegments<T, N>]
  : [];

/** A capital run chunked greedily from the left into pieces of at most `N` letters, digits uncounted. */
type ChunkRun<Run extends string, N extends number> = number extends N ? [Run]
  : _ChunkRun<Run, Budget<N>, '', Budget<N>>;

type _ChunkRun<Run extends string, N extends unknown[], Acc extends string, Left extends unknown[]> = Run extends
  `${infer C}${infer Rest}`
  ? C extends DigitChar ? _ChunkRun<Rest, N, `${Acc}${C}`, Left>
  : Left extends [unknown, ...infer LRest extends unknown[]] ? _ChunkRun<Rest, N, `${Acc}${C}`, LRest>
  : [Acc, ..._ChunkRun<Rest, N, C, N extends [unknown, ...infer NRest extends unknown[]] ? NRest : []>]
  : Acc extends '' ? []
  : [Acc];

// #endregion

// #region capital-boundary parsers

/** `'FooBar'` to `['Foo', 'Bar']`; a capital run before a lowercase gives its last capital away, the rest chunk by `N`. */
export type FromPascalCase<S extends string, N extends number = 2> = ChunkSegments<Split<Scan<S>, ' '>, N>;

/** {@link FromPascalCase} under its UpperCamel name. */
export type FromUpperCamelCase<S extends string, N extends number = 2> = FromPascalCase<S, N>;

/** {@link FromPascalCase} under its Studly name. */
export type FromStudlyCase<S extends string, N extends number = 2> = FromPascalCase<S, N>;

/** `'fooBar'` to `['foo', 'Bar']`; the leading lowercase run is the first word, then the {@link FromPascalCase} rules. */
export type FromCamelCase<S extends string, N extends number = 2> = FromPascalCase<S, N>;

/** {@link FromCamelCase} under its LowerCamel name. */
export type FromLowerCamelCase<S extends string, N extends number = 2> = FromCamelCase<S, N>;

/** {@link FromCamelCase} under its Dromedary name. */
export type FromDromedaryCase<S extends string, N extends number = 2> = FromCamelCase<S, N>;

// #endregion

// #region separator parsers

/** `'foo_bar'` to `['foo', 'bar']`; splits on `_`, drops empties, ignores casing. */
export type FromSnakeCase<S extends string> = Split<S, '_'>;

/** {@link FromSnakeCase} under its Pothole name. */
export type FromPotholeCase<S extends string> = FromSnakeCase<S>;

/** `'FOO_BAR'` to `['FOO', 'BAR']`; splits on `_`, drops empties, ignores casing. */
export type FromScreamingSnakeCase<S extends string> = Split<S, '_'>;

/** {@link FromScreamingSnakeCase} under its Constant name. */
export type FromConstantCase<S extends string> = FromScreamingSnakeCase<S>;

/** {@link FromScreamingSnakeCase} under its Macro name. */
export type FromMacroCase<S extends string> = FromScreamingSnakeCase<S>;

/** {@link FromScreamingSnakeCase} under its UpperSnake name. */
export type FromUpperSnakeCase<S extends string> = FromScreamingSnakeCase<S>;

/** `'foo-bar'` to `['foo', 'bar']`; splits on `-`, drops empties, ignores casing. */
export type FromKebabCase<S extends string> = Split<S, '-'>;

/** {@link FromKebabCase} under its Dash name. */
export type FromDashCase<S extends string> = FromKebabCase<S>;

/** {@link FromKebabCase} under its Spinal name. */
export type FromSpinalCase<S extends string> = FromKebabCase<S>;

/** {@link FromKebabCase} under its Lisp name. */
export type FromLispCase<S extends string> = FromKebabCase<S>;

/** {@link FromKebabCase} under its Param name. */
export type FromParamCase<S extends string> = FromKebabCase<S>;

/** {@link FromKebabCase} under its Hyphen name. */
export type FromHyphenCase<S extends string> = FromKebabCase<S>;

/** `'Content-Type'` to `['Content', 'Type']`; splits on `-`, drops empties, ignores casing. */
export type FromTrainCase<S extends string> = Split<S, '-'>;

/** {@link FromTrainCase} under its HttpHeader name. */
export type FromHttpHeaderCase<S extends string> = FromTrainCase<S>;

/** {@link FromTrainCase} under its PascalKebab name. */
export type FromPascalKebabCase<S extends string> = FromTrainCase<S>;

/** `'FOO-BAR'` to `['FOO', 'BAR']`; splits on `-`, drops empties, ignores casing. */
export type FromScreamingKebabCase<S extends string> = Split<S, '-'>;

/** {@link FromScreamingKebabCase} under its Cobol name. */
export type FromCobolCase<S extends string> = FromScreamingKebabCase<S>;

/** {@link FromScreamingKebabCase} under its UpperKebab name. */
export type FromUpperKebabCase<S extends string> = FromScreamingKebabCase<S>;

/** `'Foo_Bar'` to `['Foo', 'Bar']`; splits on `_`, drops empties, ignores casing. */
export type FromCamelSnakeCase<S extends string> = Split<S, '_'>;

/** {@link FromCamelSnakeCase} under its PascalSnake name. */
export type FromPascalSnakeCase<S extends string> = FromCamelSnakeCase<S>;

/** {@link FromCamelSnakeCase} under its Ada name. */
export type FromAdaCase<S extends string> = FromCamelSnakeCase<S>;

/** `'foo.bar.baz'` to `['foo', 'bar', 'baz']`; splits on `.`, drops empties, ignores casing. */
export type FromDotCase<S extends string> = Split<S, '.'>;

/** `'foo/bar'` to `['foo', 'bar']`; splits on `/`, drops empties, ignores casing. */
export type FromPathCase<S extends string> = Split<S, '/'>;

// #endregion

// #region best guess

/** `S` with every separator normalized to `_`. */
type ReplaceAll<S extends string, From extends string, To extends string> = S extends `${infer X}${From}${infer Y}`
  ? `${X}${To}${ReplaceAll<Y, From, To>}`
  : S;

type ParseGuessPieces<Pieces extends readonly string[]> = Pieces extends
  readonly [infer H extends string, ...infer T extends string[]]
  ? [...FromPascalCase<H, number>, ...ParseGuessPieces<T>]
  : [];

/** Splits on every separator (`_ - . /`) and applies the unbounded capital-boundary rules to each piece. */
export type FromBestGuessCase<S extends string> = ParseGuessPieces<
  Split<ReplaceAll<ReplaceAll<ReplaceAll<S, '-', '_'>, '.', '_'>, '/', '_'>, '_'>
>;

// #endregion

// #region per-word rendering

/** True when `W`'s letters are all uppercase and number at most `N`, digits ignored. */
type IsAcronym<W extends string, N extends number> = Uppercase<W> extends W ? FitsN<W, N> : false;

type FitsN<W extends string, N extends number> = number extends N ? true : _FitsN<W, Budget<N>>;

type _FitsN<W extends string, Left extends unknown[]> = W extends `${infer C}${infer R}`
  ? C extends DigitChar ? _FitsN<R, Left>
  : Left extends [unknown, ...infer LRest extends unknown[]] ? _FitsN<R, LRest> : false
  : true;

/** `W` lowercased with its first letter capitalized, leaving any leading digits in place. */
type CapWord<W extends string> = W extends `${infer C}${infer R}`
  ? C extends DigitChar ? `${C}${CapWord<R>}` : Capitalize<Lowercase<`${C}${R}`>>
  : W;

/** `W` kept verbatim when it is a short acronym, else normalized to its capitalized-word form. */
type PascalWord<W extends string, N extends number> = IsAcronym<W, N> extends true ? W : CapWord<W>;

type RenderPascalWords<W extends Words, N extends number> = { [K in keyof W]: PascalWord<W[K] & string, N>; };

// #endregion

// #region renderers

/** `['Proper', 'ID4', 'Form']` to `'ProperID4Form'`; joins the per-word Pascal casing with no separator. */
export type ToPascalCase<W extends Words, N extends number = 2> = Join<RenderPascalWords<W, N>, ''>;

/** {@link ToPascalCase} under its UpperCamel name. */
export type ToUpperCamelCase<W extends Words, N extends number = 2> = ToPascalCase<W, N>;

/** {@link ToPascalCase} under its Studly name. */
export type ToStudlyCase<W extends Words, N extends number = 2> = ToPascalCase<W, N>;

/** `['Proper', 'ID4', 'Form']` to `'properID4Form'`; like {@link ToPascalCase} but the first word is always lowercase. */
export type ToCamelCase<W extends Words, N extends number = 2> = W extends
  readonly [infer H extends string, ...infer T extends string[]] ? `${Lowercase<H>}${Join<RenderPascalWords<T, N>, ''>}`
  : '';

/** {@link ToCamelCase} under its LowerCamel name. */
export type ToLowerCamelCase<W extends Words, N extends number = 2> = ToCamelCase<W, N>;

/** {@link ToCamelCase} under its Dromedary name. */
export type ToDromedaryCase<W extends Words, N extends number = 2> = ToCamelCase<W, N>;

/** `['Proper', 'ID4', 'Form']` to `'Proper-ID4-Form'`; joins the per-word Pascal casing with `-`. */
export type ToTrainCase<W extends Words, N extends number = 2> = Join<RenderPascalWords<W, N>, '-'>;

/** {@link ToTrainCase} under its HttpHeader name. */
export type ToHttpHeaderCase<W extends Words, N extends number = 2> = ToTrainCase<W, N>;

/** {@link ToTrainCase} under its PascalKebab name. */
export type ToPascalKebabCase<W extends Words, N extends number = 2> = ToTrainCase<W, N>;

/** `['Proper', 'ID4', 'Form']` to `'Proper_ID4_Form'`; joins the per-word Pascal casing with `_`. */
export type ToCamelSnakeCase<W extends Words, N extends number = 2> = Join<RenderPascalWords<W, N>, '_'>;

/** {@link ToCamelSnakeCase} under its PascalSnake name. */
export type ToPascalSnakeCase<W extends Words, N extends number = 2> = ToCamelSnakeCase<W, N>;

/** {@link ToCamelSnakeCase} under its Ada name. */
export type ToAdaCase<W extends Words, N extends number = 2> = ToCamelSnakeCase<W, N>;

/** `['Proper', 'ID4', 'Form']` to `'proper_id4_form'`; lowercases and joins with `_`. */
export type ToSnakeCase<W extends Words> = Lowercase<Join<W, '_'>>;

/** {@link ToSnakeCase} under its Pothole name. */
export type ToPotholeCase<W extends Words> = ToSnakeCase<W>;

/** `['Proper', 'ID4', 'Form']` to `'PROPER_ID4_FORM'`; uppercases and joins with `_`. */
export type ToScreamingSnakeCase<W extends Words> = Uppercase<Join<W, '_'>>;

/** {@link ToScreamingSnakeCase} under its Constant name. */
export type ToConstantCase<W extends Words> = ToScreamingSnakeCase<W>;

/** {@link ToScreamingSnakeCase} under its Macro name. */
export type ToMacroCase<W extends Words> = ToScreamingSnakeCase<W>;

/** {@link ToScreamingSnakeCase} under its UpperSnake name. */
export type ToUpperSnakeCase<W extends Words> = ToScreamingSnakeCase<W>;

/** `['Proper', 'ID4', 'Form']` to `'proper-id4-form'`; lowercases and joins with `-`. */
export type ToKebabCase<W extends Words> = Lowercase<Join<W, '-'>>;

/** {@link ToKebabCase} under its Dash name. */
export type ToDashCase<W extends Words> = ToKebabCase<W>;

/** {@link ToKebabCase} under its Spinal name. */
export type ToSpinalCase<W extends Words> = ToKebabCase<W>;

/** {@link ToKebabCase} under its Lisp name. */
export type ToLispCase<W extends Words> = ToKebabCase<W>;

/** {@link ToKebabCase} under its Param name. */
export type ToParamCase<W extends Words> = ToKebabCase<W>;

/** {@link ToKebabCase} under its Hyphen name. */
export type ToHyphenCase<W extends Words> = ToKebabCase<W>;

/** `['Proper', 'ID4', 'Form']` to `'PROPER-ID4-FORM'`; uppercases and joins with `-`. */
export type ToScreamingKebabCase<W extends Words> = Uppercase<Join<W, '-'>>;

/** {@link ToScreamingKebabCase} under its Cobol name. */
export type ToCobolCase<W extends Words> = ToScreamingKebabCase<W>;

/** {@link ToScreamingKebabCase} under its UpperKebab name. */
export type ToUpperKebabCase<W extends Words> = ToScreamingKebabCase<W>;

/** `['Proper', 'ID4', 'Form']` to `'proper.id4.form'`; lowercases and joins with `.`. */
export type ToDotCase<W extends Words> = Lowercase<Join<W, '.'>>;

/** `['Proper', 'ID4', 'Form']` to `'proper/id4/form'`; lowercases and joins with `/`. */
export type ToPathCase<W extends Words> = Lowercase<Join<W, '/'>>;

/** `['Proper', 'ID4', 'Form']` to `'properid4form'`; lowercases and joins with nothing. */
export type ToFlatCase<W extends Words> = Lowercase<Join<W, ''>>;

/** `['Proper', 'ID4', 'Form']` to `'PROPERID4FORM'`; uppercases and joins with nothing. */
export type ToUpperFlatCase<W extends Words> = Uppercase<Join<W, ''>>;

// #endregion
