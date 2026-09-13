import { Length } from './array';
import { Add, Dec, Inc, Multiply, Store, Subtract } from './counter';

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
 * Guards against a fallback that returns `X` unchanged instead of subtracting:
 * `Subtract<5, 2>` must reduce to `3`.
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

/** `Store` is the counter itself: a tuple whose length is the number. */
namespace storeTest {
  // @ts-expect-no-error
  isAssignable<Store<3>, [never, never, never]>;
  // @ts-expect-no-error
  isAssignable<[never, never, never], Store<3>>;
  // @ts-expect-no-error
  isAssignable<Store<0>, []>;
  // @ts-expect-no-error
  isAssignable<[], Store<0>>;
  // @ts-expect-no-error
  isAssignable<Store<1>, [never]>;
  // @ts-expect-no-error
  isAssignable<Length<Store<7>>, 7>;
  // @ts-expect-error
  isAssignable<Store<2>, [never, never, never]>;
}

namespace roundTripTest {
  // @ts-expect-no-error
  isAssignable<Inc<Dec<4>>, 4>;
  // @ts-expect-no-error
  isAssignable<Dec<Inc<4>>, 4>;
  // @ts-expect-no-error
  isAssignable<Subtract<Add<3, 4>, 4>, 3>;
  // @ts-expect-no-error
  isAssignable<Multiply<Add<1, 1>, 3>, 6>;
  // @ts-expect-no-error
  isAssignable<Multiply<1, 1>, 1>;
  // @ts-expect-no-error
  isAssignable<Multiply<0, 0>, 0>;

  // @ts-expect-error
  isAssignable<Add<1, 1>, 3>;
  // @ts-expect-error
  isAssignable<Multiply<2, 3>, 5>;
  // @ts-expect-error
  isAssignable<Inc<1>, 1>;
}

/** Zero has no predecessor: `Dec<0>` is never, where `Subtract` would have clamped. */
namespace decOfZeroTest {
  // @ts-expect-no-error
  isAssignable<Dec<0>, never>;
  // @ts-expect-no-error
  isAssignable<Subtract<0, 1>, 0>;
}
