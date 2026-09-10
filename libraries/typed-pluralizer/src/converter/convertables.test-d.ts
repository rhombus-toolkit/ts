import { Convertable } from './convertables';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** Membership in the upstream convertables list, verbatim. */
namespace membershipTest {
  // @ts-expect-no-error
  isAssignable<'big' | 'small' | 'happy' | 'angry', Convertable>;
  // the list is copied as upstream spells it, misspellings included
  // @ts-expect-no-error
  isAssignable<'fanc' | 'intellegent', Convertable>;

  // the irregulars are handled elsewhere, not here
  // @ts-expect-error
  isAssignable<'good', Convertable>;
  // @ts-expect-error
  isAssignable<'bad', Convertable>;
  // @ts-expect-error
  isAssignable<'fancy', Convertable>;
  // @ts-expect-error
  isAssignable<'', Convertable>;
}

/** Lowercase only: the callers fold input before consulting the gate. */
namespace caseTest {
  // @ts-expect-error
  isAssignable<'Big', Convertable>;
  // @ts-expect-error
  isAssignable<'BIG', Convertable>;
  // @ts-expect-no-error
  isAssignable<Lowercase<'BIG'>, Convertable>;
  // @ts-expect-no-error
  isAssignable<Convertable, Lowercase<Convertable>>;
  // @ts-expect-no-error
  isAssignable<Convertable, string>;
}
