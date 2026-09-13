import { Curry } from './Curry';
import { Func } from './func';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** `function test(a: 'asdf', b: true, c: Date) { return 44; }`, as a `Func`. */
type TestFn = Func<['asdf', true, Date], number>;

declare const curried: Curry<TestFn>;
declare const date: Date;

/**
 * Guards against `_CurryWithGaps` recursing on the whole argument list instead
 * of what remains after the applied arguments -- the partially applied result
 * must narrow to the remaining `Date`, not repeat the first argument.
 */
namespace partialApplicationTest {
  const rest = curried('asdf', true);

  // @ts-expect-no-error
  isAssignable<typeof rest, Func<[Date], number>>;

  // @ts-expect-no-error
  isAssignable<number>(rest(date));

  // the remaining argument is the Date, not another copy of the first one
  // @ts-expect-error
  rest('asdf');
}

namespace fullApplicationTest {
  // @ts-expect-no-error
  isAssignable<number>(curried('asdf', true, date));
}

/**
 * The placeholder matches Ramda's `R.__` structurally, so gap application
 * works with the library the compat target names.
 */
namespace gapTest {
  declare const __: { '@@functional/placeholder': true; };

  const gapped = curried(__, true);

  // @ts-expect-no-error
  isAssignable<number>(gapped('asdf', date));
}

/** Each argument is checked in its own position; nothing applied gives the same function back. */
namespace argumentTypesTest {
  // @ts-expect-error
  curried(1);
  // @ts-expect-error
  curried('asdf', 'not a boolean');

  const same = curried();
  // @ts-expect-no-error
  isAssignable<number>(same('asdf', true, date));

  // one at a time
  // @ts-expect-no-error
  isAssignable<number>(curried('asdf')(true)(date));
  // @ts-expect-error
  curried('asdf')(date);
}

/** Only functions can be curried. */
namespace constraintTest {
  // @ts-expect-error
  type NotAFunction = Curry<number>;
}
