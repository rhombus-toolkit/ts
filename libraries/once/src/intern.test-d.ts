// Type-level probes for intern: it returns the argument's own type, rejects a primitive, and lets
// a function type pass through unchanged.

import type { Func } from '@rhombus-toolkit/types';
import { intern } from './intern';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace internReturnsTheArgumentsOwnTypeTest {
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof intern<{ x: number; }>>, { x: number; }>;
}

namespace internRejectsAPrimitiveTest {
  // @ts-expect-error - a primitive has no structure to intern by
  intern(1);
  // @ts-expect-error - a primitive has no structure to intern by
  intern('a');
}

namespace internPassesThroughAFunctionTypeTest {
  declare const fn: Func<[number], string>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof intern<typeof fn>>, typeof fn>;
}
