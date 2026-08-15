import { Curry } from './Curry';
import { Func } from './func';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** `function test(a: 'asdf', b: true, c: Date) { return 44; }` -- the probe that used to live in `curry.ts`. */
type TestFn = Func<['asdf', true, Date], number>;

declare const curried: Curry<TestFn>;
declare const date: Date;

/**
 * The regression. `_CurryWithGaps` recurses on what is left after the applied
 * arguments, which came back as the whole argument list while `Skip` returned
 * its input -- so the partially applied result never narrowed to the remaining
 * `Date`.
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
 * The placeholder is Ramda's, structurally. It was a local `unique symbol`,
 * which no Ramda `R.__` is ever assignable to -- so gap application could not
 * work for the library the compat target names.
 */
namespace gapTest {
  declare const __: { '@@functional/placeholder': true; };

  const gapped = curried(__, true);

  // @ts-expect-no-error
  isAssignable<number>(gapped('asdf', date));
}
