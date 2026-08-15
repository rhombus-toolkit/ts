import { Flatten, MakeRequired, Mutable, Simplify } from './utility-types';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

interface Source {
  a: string;
  b: number;
}

/** `Flatten` is `Simplify` plus a display-only `& {}` -- one implementation, two call-site readings. */
namespace flattenIsSimplifyTest {
  // @ts-expect-no-error
  isAssignable<Flatten<Source>, Simplify<Source>>;
  // @ts-expect-no-error
  isAssignable<Simplify<Source>, Flatten<Source>>;

  // both carry the implicit index signature an interface lacks
  // @ts-expect-no-error
  isAssignable<Flatten<Source>, Record<string, unknown>>;
  // @ts-expect-error
  isAssignable<Source, Record<string, unknown>>;
}

namespace mutableTest {
  interface Frozen {
    readonly a: string;
    readonly b: number;
  }

  // @ts-expect-no-error
  isAssignable<Mutable<Frozen>, { a: string; b: number; }>;
  // @ts-expect-no-error
  isAssignable<{ a: string; b: number; }, Mutable<Frozen>>;
  // @ts-expect-no-error
  isAssignable<Mutable<Frozen, 'a'>, { a: string; readonly b: number; }>;
}

namespace makeRequiredTest {
  // @ts-expect-no-error
  isAssignable<MakeRequired<Source, 'a'>, { a: string; b?: number; }>;
  // @ts-expect-no-error
  isAssignable<{ a: string; b?: number; }, MakeRequired<Source, 'a'>>;
}
