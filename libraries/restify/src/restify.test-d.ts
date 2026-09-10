import { restify, unrestify } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/**
 * `unrestify` used to open with `Δ extends [infer φ] | [infer Θ] ? φ | Θ`, which matches every
 * one-tuple and so left the `Δ extends [infer φ] ? φ` behind it unreachable. The two spellings
 * compute the same thing -- both slots infer the same element, so `φ | Θ` was only ever `φ` -- which
 * means collapsing to the single arm has to be invisible from out here. These are the cases that
 * say so.
 */
namespace scalarRoundTrip {
  type Subject = unrestify<restify<string>>;

  // @ts-expect-no-error
  isAssignable<Subject, string>;
  // @ts-expect-no-error
  isAssignable<string, Subject>;
}

namespace emptyRoundTrip {
  type Subject = unrestify<restify<void>>;

  // @ts-expect-no-error
  isAssignable<Subject, void>;
  // @ts-expect-no-error
  isAssignable<void, Subject>;
}

/**
 * An array arrives at `restify` already spreadable, so it passes through unmarked and `unrestify`
 * hands it straight back rather than unwrapping it. Telling this apart from a marked `[value]` is
 * the entire reason the marker exists.
 */
namespace oneElementArrayPassesThrough {
  type Subject = unrestify<restify<[string]>>;

  // @ts-expect-no-error
  isAssignable<Subject, [string]>;
  // @ts-expect-no-error
  isAssignable<[string], Subject>;
}

namespace multiElementRoundTrip {
  type Subject = unrestify<restify<[string, number]>>;

  // @ts-expect-no-error
  isAssignable<Subject, [string, number]>;
  // @ts-expect-no-error
  isAssignable<[string, number], Subject>;
}

// Only `undefined` is an absent argument; `null` is a value a handler must still receive.
namespace nullishRoundTrip {
  type FromNull = unrestify<restify<null>>;
  type FromUndefined = unrestify<restify<undefined>>;

  // @ts-expect-no-error
  isAssignable<FromNull, null>;
  // @ts-expect-no-error
  isAssignable<null, FromNull>;
  // @ts-expect-no-error
  isAssignable<FromUndefined, void>;
  // @ts-expect-no-error
  isAssignable<restify<null>, [null]>;
  // @ts-expect-no-error
  isAssignable<restify<undefined>, []>;
  // @ts-expect-error
  isAssignable<restify<null>, []>;
}

// A wrap is a tuple of exactly the value, never a widened array.
namespace scalarWrapIsAOneTuple {
  // @ts-expect-no-error
  isAssignable<restify<number>, [number]>;
  // @ts-expect-error - a one-tuple is not a two-tuple
  isAssignable<restify<number>, [number, number]>;
  // @ts-expect-error - the marker keeps a plain literal from posing as a wrap
  isAssignable<[number], restify<number>>;
}

// A plain array arrives spreadable and leaves `restify` as itself, marker-free.
namespace arrayPassesThroughUnmarked {
  // @ts-expect-no-error
  isAssignable<restify<string[]>, string[]>;
  // @ts-expect-no-error
  isAssignable<string[], restify<string[]>>;
  // @ts-expect-no-error
  isAssignable<unrestify<string[]>, string[]>;
  // @ts-expect-no-error
  isAssignable<string[], unrestify<string[]>>;
}

// `unrestify` only takes arrays: a wrapped value is always one, so anything else is a caller error.
namespace unrestifyRefusesNonArrays {
  // @ts-expect-error
  type Subject = unrestify<string>;
}

// The overloads agree with the type aliases at the call site.
namespace callSitesMatchTheAliases {
  const wrapped = restify('a' as string);
  // @ts-expect-no-error
  isAssignable<typeof wrapped, restify<string>>;

  const unwrapped = unrestify(wrapped);
  // @ts-expect-no-error
  isAssignable<typeof unwrapped, string>;
  // @ts-expect-no-error
  isAssignable<string, typeof unwrapped>;

  const empty = unrestify(restify(undefined));
  // @ts-expect-no-error
  isAssignable<typeof empty, void>;
}
