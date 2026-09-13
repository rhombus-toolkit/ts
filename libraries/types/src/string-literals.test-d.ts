import { AsString, ClearEmpties, Join, Split, ToStringable, ToStringLiteral } from './string-literals';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace joinTest {
  // @ts-expect-no-error
  isAssignable<Join<['a', 'b', 'c'], '-'>, 'a-b-c'>;
  // @ts-expect-no-error
  isAssignable<'a-b-c', Join<['a', 'b', 'c'], '-'>>;

  // one member, no delimiter
  // @ts-expect-no-error
  isAssignable<Join<['a'], '-'>, 'a'>;
  // no members, nothing to delimit -- matches `[].join('-')`
  // @ts-expect-no-error
  isAssignable<Join<[], '-'>, ''>;

  // empties are cleared first, so the delimiter never doubles up
  // @ts-expect-no-error
  isAssignable<Join<['a', '', 'b'], '-'>, 'a-b'>;

  // every ToStringable interpolates
  // @ts-expect-no-error
  isAssignable<Join<[1, true, null], ','>, '1,true,null'>;
}

namespace clearEmptiesTest {
  // @ts-expect-no-error
  isAssignable<ClearEmpties<['a', '', 'b', '']>, ['a', 'b']>;
  // @ts-expect-no-error
  isAssignable<['a', 'b'], ClearEmpties<['a', '', 'b', '']>>;
}

namespace splitTest {
  // @ts-expect-no-error
  isAssignable<Split<'a-b-c', '-'>, ['a', 'b', 'c']>;
  // @ts-expect-no-error
  isAssignable<['a', 'b', 'c'], Split<'a-b-c', '-'>>;

  // a doubled delimiter leaves no empty behind
  // @ts-expect-no-error
  isAssignable<Split<'a--b', '-'>, ['a', 'b']>;

  // nothing to split on
  // @ts-expect-no-error
  isAssignable<Split<'a', '-'>, ['a']>;
}

namespace stringableTest {
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<42>, '42'>;
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<true>, 'true'>;
  // @ts-expect-no-error
  isAssignable<AsString<'x'>, 'x'>;
  // @ts-expect-no-error
  isAssignable<'x', AsString<'x'>>;
}

/** Exactly what a template literal accepts: the primitives, `null` and `undefined`. */
namespace toStringableTest {
  // @ts-expect-no-error
  isAssignable<string | number | bigint | boolean | null | undefined, ToStringable>;
  // @ts-expect-error
  isAssignable<symbol, ToStringable>;
  // @ts-expect-error
  isAssignable<object, ToStringable>;
  // @ts-expect-error
  isAssignable<() => void, ToStringable>;
}

/** `AsString` keeps the string part and drops the rest. */
namespace asStringNarrowsTest {
  // @ts-expect-no-error
  isAssignable<AsString<'a' | 1>, 'a'>;
  // @ts-expect-no-error
  isAssignable<'a', AsString<'a' | 1>>;
  // @ts-expect-no-error
  isAssignable<AsString<number>, never>;
  // @ts-expect-no-error
  isAssignable<AsString<string>, string>;
  // @ts-expect-no-error
  isAssignable<string, AsString<string>>;

  // what it is for: a template literal position that stays satisfied while `T` is still a parameter
  type Tag<T> = `#${AsString<T>}`;
  // @ts-expect-no-error
  isAssignable<Tag<'x'>, '#x'>;
  // @ts-expect-no-error
  isAssignable<'#x', Tag<'x'>>;
}

namespace toStringLiteralEdgesTest {
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<null>, 'null'>;
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<undefined>, 'undefined'>;
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<10n>, '10'>;
  // a wide input stays wide
  // @ts-expect-no-error
  isAssignable<ToStringLiteral<number>, `${number}`>;
  // @ts-expect-error
  isAssignable<ToStringLiteral<42>, 42>;
}

/** Empties never survive: leading, trailing and doubled delimiters all vanish. */
namespace splitEdgesTest {
  // @ts-expect-no-error
  isAssignable<Split<'', '-'>, []>;
  // @ts-expect-no-error
  isAssignable<[], Split<'', '-'>>;
  // @ts-expect-no-error
  isAssignable<Split<'-a-', '-'>, ['a']>;
  // @ts-expect-no-error
  isAssignable<['a'], Split<'-a-', '-'>>;
  // @ts-expect-no-error
  isAssignable<Split<'---', '-'>, []>;
  // a non-string delimiter interpolates
  // @ts-expect-no-error
  isAssignable<Split<'a1b', 1>, ['a', 'b']>;
  // @ts-expect-error
  isAssignable<Split<'a-b', '-'>, ['a', '-', 'b']>;
}

namespace joinAndClearEdgesTest {
  // a readonly tuple joins too
  // @ts-expect-no-error
  isAssignable<Join<readonly ['a', 'b'], '.'>, 'a.b'>;
  // an empty delimiter concatenates
  // @ts-expect-no-error
  isAssignable<Join<['a', 'b'], ''>, 'ab'>;
  // @ts-expect-error
  isAssignable<Join<['a', 'b'], '-'>, 'a b'>;

  // @ts-expect-no-error
  isAssignable<ClearEmpties<[]>, []>;
  // @ts-expect-no-error
  isAssignable<ClearEmpties<['', '']>, []>;
  // @ts-expect-no-error
  isAssignable<[], ClearEmpties<['', '']>>;
  // only the empty string is empty: `0`, `false` and `null` stay
  // @ts-expect-no-error
  isAssignable<ClearEmpties<[0, false, null, '']>, [0, false, null]>;
  // @ts-expect-no-error
  isAssignable<[0, false, null], ClearEmpties<[0, false, null, '']>>;
}
