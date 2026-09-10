import { clearTimeout, setTimeout, TimeoutHandle } from './TimeoutHandle';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// The handle round-trips into clearTimeout as the opaque type, and the delay is optional.
namespace setTimeoutHandleRoundTripsTest {
  // @ts-expect-no-error
  const handle = setTimeout(() => {}, 10);
  // @ts-expect-no-error
  isAssignable<typeof handle, TimeoutHandle>;
  // @ts-expect-no-error
  clearTimeout(handle);
  // @ts-expect-no-error
  setTimeout(() => {});
}

// Unlike setImmediate, setTimeout forwards no arguments to its callback.
namespace setTimeoutTakesNoCallbackArgumentsTest {
  // @ts-expect-error - a parameterful callback has nothing to receive
  setTimeout((value: number) => value, 10);
  // @ts-expect-error - no trailing arguments are forwarded
  setTimeout(() => {}, 10, 'extra');
}
