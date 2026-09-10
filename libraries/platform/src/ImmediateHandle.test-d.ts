import { clearImmediate, ImmediateHandle, setImmediate } from './ImmediateHandle';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// The trailing arguments are checked against the callback's parameters, and the
// handle that comes back is the opaque type clearImmediate accepts.
namespace setImmediateForwardsTypedArgumentsTest {
  declare function takesTwo(a: number, b: string): void;

  // @ts-expect-no-error
  const handle = setImmediate(takesTwo, 1, 'b');
  // @ts-expect-no-error
  isAssignable<typeof handle, ImmediateHandle>;
  // @ts-expect-no-error
  clearImmediate(handle);

  // @ts-expect-error - the second argument must be a string
  setImmediate(takesTwo, 1, 2);
  // @ts-expect-error - every parameter must be supplied
  setImmediate(takesTwo, 1);
}

// The callback's return value is discarded, so a non-void callback is still accepted.
namespace setImmediateDiscardsTheReturnValueTest {
  // @ts-expect-no-error
  setImmediate(() => 42);
}
