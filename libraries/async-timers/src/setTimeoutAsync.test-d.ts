import { setTimeoutAsync } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

declare const signal: AbortSignal;

// No value resolves void; one value resolves as itself; several resolve as a tuple.
// A leading signal changes nothing about the value the promise carries.
namespace resolvedTypeFollowsTheValueCount {
  const none = setTimeoutAsync(0);
  // @ts-expect-no-error
  isAssignable<typeof none, Promise<void>>;

  const one = setTimeoutAsync(0, 'a');
  // @ts-expect-no-error
  isAssignable<typeof one, Promise<string>>;

  const several = setTimeoutAsync(0, 'a', 2);
  // @ts-expect-no-error
  isAssignable<typeof several, Promise<[string, number]>>;
}

namespace leadingSignalIsNotPartOfTheValue {
  const none = setTimeoutAsync(0, signal);
  // @ts-expect-no-error
  isAssignable<typeof none, Promise<void>>;

  const one = setTimeoutAsync(0, signal, 'a');
  // @ts-expect-no-error
  isAssignable<typeof one, Promise<string>>;
}

// The runtime drops a leading signal before building the tuple, so the type has to as well.
// Today the signal-less rest overload is declared first and captures this call with the
// signal inside `T`; declaring the signal-first rest overload ahead of it resolves this probe.
namespace leadingSignalStaysOutOfTheTuple {
  const several = setTimeoutAsync(0, signal, 'a', 2);
  // @ts-expect-no-error
  isAssignable<typeof several, Promise<[string, number]>>;
}

namespace timeoutIsRequired {
  // @ts-expect-error
  setTimeoutAsync();
  // @ts-expect-error
  setTimeoutAsync('10');
}
