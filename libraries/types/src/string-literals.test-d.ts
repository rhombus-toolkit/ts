import { AsString, ClearEmpties, Join, Split, ToStringLiteral } from './string-literals';

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
