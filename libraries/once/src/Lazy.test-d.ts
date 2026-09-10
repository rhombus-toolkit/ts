// Type-level probes for Lazy: the value is typed as what the factory returns, and the factory
// takes nothing.

import { Lazy } from './Lazy';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace valueIsTheFactoryAnswerTest {
  const lazy = new Lazy(() => ({ id: 1 }));

  // @ts-expect-no-error
  isAssignable<typeof lazy.value, { id: number; }>;
  // @ts-expect-error - the value reads as built, never as absent
  isAssignable<typeof lazy.value, undefined>;

  const maybe = new Lazy((): string | undefined => undefined);

  // @ts-expect-no-error
  isAssignable<typeof maybe.value, string | undefined>;
}

namespace factoryTakesNothingTest {
  // @ts-expect-error - there is nothing to pass a factory at access time
  new Lazy((seed: number) => seed);
}

namespace valueIsReadOnlyTest {
  const lazy = new Lazy(() => 1);

  // @ts-expect-error - the value is settled by the factory, not assigned
  lazy.value = 2;
}
