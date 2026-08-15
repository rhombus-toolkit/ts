import { FromInfinitive, ToInfinitive } from './irregular-verbs';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Happy-path coverage for the irregular verb table (this module is complete).

namespace fromInfinitive {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'leave'>, 'left'>;
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'make'>, 'made'>;
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'go'>, 'went'>;
  // Words outside the table resolve to `never`.
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'walk'>, never>;
}

namespace toInfinitive {
  // @ts-expect-no-error
  isAssignable<ToInfinitive<'left'>, 'leave'>;
  // @ts-expect-no-error
  isAssignable<ToInfinitive<'made'>, 'make'>;

  // Duplicate-value collision: both `be` and `is` map to past-tense 'was'.
  // Upstream's reducer is last-wins (`is` is written after `be`), so the
  // inversion must resolve to a single 'is' -- NOT the `'be' | 'is'` union a
  // naive inverting mapped type would produce. 'was' is the only collision in
  // the table. This assertion uses the single-arg overload, which requires the
  // first type to be assignable to the second: `('be' | 'is') extends 'is'`
  // would FAIL (the 'be' member is not assignable), so a regression to the
  // union breaks this. Regression pin for the last-wins `& { was: 'is' }`.
  // @ts-expect-no-error
  isAssignable<ToInfinitive<'was'>, 'is'>;
}
