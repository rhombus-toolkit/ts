import { restify, unrestify } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
/** Equal in the assignable-both-ways sense; a probe reads `isExactly<Actual, Expected>()`, and an unequal pair demands an argument nobody can supply. */
declare function isExactly<TActual, TExpected>(...proof: Same<TActual, TExpected> extends true ? [] : [never]): void;

// A creator's rest args become the payload: none is void, one is itself, several stay a tuple.
namespace unrestifyTest {
  // @ts-expect-no-error
  isExactly<unrestify<[]>, void>();
  // @ts-expect-no-error
  isExactly<unrestify<[string]>, string>();
  // @ts-expect-no-error
  isExactly<unrestify<[null]>, null>();
  // one array argument is that array, not an argument list
  // @ts-expect-no-error
  isExactly<unrestify<[string[]]>, string[]>();
  // @ts-expect-no-error
  isExactly<unrestify<[[string, number]]>, [string, number]>();
  // several arguments keep their tuple, which carries the mark
  // @ts-expect-no-error
  isAssignable<unrestify<[string, number]>, [string, number]>;
  // @ts-expect-error - a plain tuple lacks the mark, so it cannot pose as a multi-argument payload
  isAssignable<[string, number], unrestify<[string, number]>>;
  // @ts-expect-error - only an argument list goes in
  type Rejected = unrestify<string>;
}

// A payload becomes the handler's rest args: undefined is none, a marked tuple is itself, anything else is one.
namespace restifyTest {
  // @ts-expect-no-error
  isExactly<restify<undefined>, []>();
  // @ts-expect-no-error
  isExactly<restify<void>, []>();
  // @ts-expect-no-error
  isExactly<restify<string>, [string]>();
  // @ts-expect-no-error
  isExactly<restify<null>, [null]>();
  // an array payload is one argument
  // @ts-expect-no-error
  isExactly<restify<string[]>, [string[]]>();
  // @ts-expect-no-error
  isExactly<restify<[string, number]>, [[string, number]]>();
  // a marked tuple comes back as the plain tuple a caller can spread or be called with
  // @ts-expect-no-error
  isExactly<restify<unrestify<[string, number]>>, [string, number]>();
  // @ts-expect-no-error
  isExactly<restify<unrestify<[string, number, boolean]>>, [string, number, boolean]>();
  // @ts-expect-error - a one-tuple is not a two-tuple
  isAssignable<restify<number>, [number, number]>;
}

// Both directions round-trip.
namespace roundTripTest {
  // @ts-expect-no-error
  isExactly<unrestify<restify<string>>, string>();
  // @ts-expect-no-error
  isExactly<unrestify<restify<null>>, null>();
  // @ts-expect-no-error
  isExactly<unrestify<restify<string[]>>, string[]>();
  // @ts-expect-no-error
  isExactly<unrestify<restify<void>>, void>();
  // @ts-expect-no-error
  isExactly<restify<unrestify<[]>>, []>();
  // @ts-expect-no-error
  isExactly<restify<unrestify<[string]>>, [string]>();
  // @ts-expect-no-error
  isExactly<restify<unrestify<[string[]]>>, [string[]]>();
  // @ts-expect-no-error
  isExactly<restify<unrestify<[string, number]>>, [string, number]>();
}

// The overloads agree with the aliases at the call site, and a creator typed through them is plainly callable.
namespace callSitesTest {
  const single = unrestify(['a'] as [string]);
  // @ts-expect-no-error
  isExactly<typeof single, string>();

  const several = unrestify(['a', 2] as [string, number]);
  // @ts-expect-no-error
  isAssignable<typeof several, [string, number]>;

  const args = restify(several);
  // @ts-expect-no-error
  isExactly<typeof args, [string, number]>();

  declare function handler(state: object, ...payload: restify<unrestify<[string, number]>>): void;
  // @ts-expect-no-error
  handler({}, 'a', 2);
  // @ts-expect-error
  handler({}, 'a');

  declare function listHandler(state: object, ...payload: restify<unrestify<[number[]]>>): void;
  // @ts-expect-no-error
  listHandler({}, [1, 2]);
  // @ts-expect-error - one array argument is not a spread of numbers
  listHandler({}, 1, 2);

  declare function creator(...args: restify<unrestify<[string, number]>>): unrestify<[string, number]>;
  const payload = creator('a', 2);
  // @ts-expect-no-error
  isAssignable<typeof payload, [string, number]>;
}
