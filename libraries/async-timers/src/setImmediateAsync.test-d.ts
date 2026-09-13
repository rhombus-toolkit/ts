import { setImmediateAsync } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

declare const signal: AbortSignal;

// No value resolves void; one value resolves as itself; several resolve as a tuple.
// A leading signal changes nothing about the value the promise carries.
namespace resolvedTypeFollowsTheValueCount {
  const none = setImmediateAsync();
  // @ts-expect-no-error
  isAssignable<typeof none, Promise<void>>;

  const one = setImmediateAsync('a');
  // @ts-expect-no-error
  isAssignable<typeof one, Promise<string>>;

  const several = setImmediateAsync('a', 2);
  // @ts-expect-no-error
  isAssignable<typeof several, Promise<[string, number]>>;
}

namespace leadingSignalIsNotPartOfTheValue {
  const none = setImmediateAsync(signal);
  // @ts-expect-no-error
  isAssignable<typeof none, Promise<void>>;

  const one = setImmediateAsync(signal, 'a');
  // @ts-expect-no-error
  isAssignable<typeof one, Promise<string>>;
}

// The runtime drops a leading signal before building the tuple, so the type has to as well.
// The signal-less rest overload is declared first and captures this call with the signal
// inside `T`, which is what this probe pins.
namespace leadingSignalStaysOutOfTheTuple {
  const several = setImmediateAsync(signal, 'a', 2);
  // @ts-expect-no-error
  isAssignable<typeof several, Promise<[string, number]>>;
}

namespace signalMustBeTheRealClass {
  declare const lookalike: { aborted: boolean; reason: unknown; };

  const wrapped = setImmediateAsync(lookalike);
  // @ts-expect-no-error
  isAssignable<typeof wrapped, Promise<typeof lookalike>>;
}
