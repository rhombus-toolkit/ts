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
