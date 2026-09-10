import setImmediateDefault, { clearImmediate, setImmediate } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// The trailing arguments are typed against the callback's parameters, so a
// mismatch is a compile error rather than a runtime surprise.
namespace argumentsMatchTheCallback {
  // @ts-expect-no-error
  setImmediate((a: string, b: number) => {}, 'a', 2);
  // @ts-expect-no-error
  setImmediate(() => {});
  // @ts-expect-error
  setImmediate((a: string) => {}, 2);
  // @ts-expect-error
  setImmediate((a: string) => {});
}

namespace handleRoundTrips {
  const handle = setImmediate(() => {});

  // @ts-expect-no-error
  clearImmediate(handle);
  // @ts-expect-error
  clearImmediate('not a handle');
}

namespace defaultExportIsSetImmediate {
  // @ts-expect-no-error
  isAssignable<typeof setImmediateDefault, typeof setImmediate>;
  // @ts-expect-no-error
  isAssignable<typeof setImmediate, typeof setImmediateDefault>;
}
