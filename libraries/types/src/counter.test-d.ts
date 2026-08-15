import { Add, Dec, Inc, Multiply, Subtract } from './counter';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace incDecTest {
  // @ts-expect-no-error
  isAssignable<Inc<0>, 1>;
  // @ts-expect-no-error
  isAssignable<Inc<5>, 6>;
  // @ts-expect-no-error
  isAssignable<Dec<5>, 4>;
  // @ts-expect-no-error
  isAssignable<Dec<1>, 0>;
}

namespace addTest {
  // @ts-expect-no-error
  isAssignable<Add<3, 4>, 7>;
  // @ts-expect-no-error
  isAssignable<Add<0, 0>, 0>;
  // @ts-expect-no-error
  isAssignable<Add<9, 0>, 9>;
}

/**
 * The regression. `Subtract` routed through `Skip`, so it inherited `Skip`'s
 * broken fallback and returned `X` unchanged -- `Subtract<5, 2>` was `5`.
 */
namespace subtractTest {
  // @ts-expect-no-error
  isAssignable<Subtract<5, 2>, 3>;
  // @ts-expect-no-error
  isAssignable<3, Subtract<5, 2>>;

  // the old broken behaviour: the minuend, untouched
  // @ts-expect-error
  isAssignable<Subtract<5, 2>, 5>;

  // @ts-expect-no-error
  isAssignable<Subtract<10, 10>, 0>;
  // @ts-expect-no-error
  isAssignable<Subtract<7, 0>, 7>;
  // @ts-expect-no-error
  isAssignable<Subtract<0, 0>, 0>;
}

/** A tuple has no negative length, so the subtrahend running out first is the only representable answer. */
namespace subtractClampsTest {
  // @ts-expect-no-error
  isAssignable<Subtract<2, 5>, 0>;
  // @ts-expect-no-error
  isAssignable<0, Subtract<2, 5>>;
}

namespace multiplyTest {
  // @ts-expect-no-error
  isAssignable<Multiply<3, 4>, 12>;
  // @ts-expect-no-error
  isAssignable<Multiply<0, 5>, 0>;
  // @ts-expect-no-error
  isAssignable<Multiply<5, 1>, 5>;
}
