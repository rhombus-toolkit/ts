import { Func } from './func';
import { Identity } from './Identity';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace identityTest {
  // @ts-expect-no-error
  isAssignable<Identity<'a'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<'a', Identity<'a'>>;
  // @ts-expect-no-error
  isAssignable<Identity<{ a: 1; }>, { a: 1; }>;
  // @ts-expect-no-error
  isAssignable<{ a: 1; }, Identity<{ a: 1; }>>;
  // @ts-expect-error
  isAssignable<Identity<'a'>, 'b'>;

  // the degenerate members pass through too
  // @ts-expect-no-error
  isAssignable<Identity<never>, never>;
  // @ts-expect-no-error
  isAssignable<unknown, Identity<unknown>>;
  // @ts-expect-no-error
  isAssignable<Identity<1 | 2>, 1 | 2>;
  // @ts-expect-no-error
  isAssignable<1 | 2, Identity<1 | 2>>;
}

/** The identity on types, not the type of an identity function. */
namespace notAFunctionTest {
  // @ts-expect-error
  isAssignable<Identity<number>, Func<[number], number>>;
  // @ts-expect-no-error
  isAssignable<Func<[number], number>, Identity<Func<[number], number>>>;
}
