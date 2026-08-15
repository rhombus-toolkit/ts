import { Falsy, IfFalsy, IfTruthy, IsFalsy, IsTruthy, Truthy } from './truthy';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** The regression: `false` and `0n` were missing, so `Truthy<boolean>` came back as `boolean`. */
namespace falsyMembershipTest {
  // @ts-expect-no-error
  isAssignable<false, Falsy>;
  // @ts-expect-no-error
  isAssignable<0n, Falsy>;
  // @ts-expect-no-error
  isAssignable<'', Falsy>;
  // @ts-expect-no-error
  isAssignable<0, Falsy>;
  // @ts-expect-no-error
  isAssignable<null, Falsy>;
  // @ts-expect-no-error
  isAssignable<undefined, Falsy>;

  // @ts-expect-error
  isAssignable<true, Falsy>;
  // @ts-expect-error
  isAssignable<'a', Falsy>;
}

namespace truthyTest {
  // @ts-expect-no-error
  isAssignable<Truthy<boolean>, true>;
  // @ts-expect-no-error
  isAssignable<true, Truthy<boolean>>;

  // the old broken behaviour: `boolean` survived `Truthy` intact
  // @ts-expect-error
  isAssignable<boolean, Truthy<boolean>>;

  // @ts-expect-no-error
  isAssignable<Truthy<0 | 1 | ''>, 1>;
  // @ts-expect-no-error
  isAssignable<Truthy<0n | 1n>, 1n>;
}

namespace ifFalsyTest {
  // @ts-expect-no-error
  isAssignable<IfFalsy<0, 'yes', 'no'>, 'yes'>;
  // @ts-expect-no-error
  isAssignable<IfFalsy<false, 'yes', 'no'>, 'yes'>;
  // @ts-expect-no-error
  isAssignable<IfFalsy<1, 'yes', 'no'>, 'no'>;
}

namespace ifTruthyTest {
  // @ts-expect-no-error
  isAssignable<IfTruthy<'a', 'yes', 'no'>, 'yes'>;
  // @ts-expect-no-error
  isAssignable<IfTruthy<true, 'yes', 'no'>, 'yes'>;
  // @ts-expect-no-error
  isAssignable<IfTruthy<0, 'yes', 'no'>, 'no'>;
}

/** The boolean-valued forms default to `true`/`false`. */
namespace isFalsyIsTruthyTest {
  // @ts-expect-no-error
  isAssignable<IsFalsy<0>, true>;
  // @ts-expect-no-error
  isAssignable<IsFalsy<1>, false>;
  // @ts-expect-no-error
  isAssignable<IsTruthy<''>, false>;
  // @ts-expect-no-error
  isAssignable<IsTruthy<'a'>, true>;
  // @ts-expect-no-error
  isAssignable<IsFalsy<false>, true>;
}
