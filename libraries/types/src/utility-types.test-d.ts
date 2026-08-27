import { ButNot, DistributiveOmit, Flatten, MakeRequired, Mutable, Simplify } from './utility-types';

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

/** `DistributiveOmit` omits per union member; plain `Omit` sees only the keys every member shares. */
namespace distributiveOmitTest {
  interface Circle {
    kind: 'circle';
    radius: number;
  }

  interface Rect {
    kind: 'rect';
    width: number;
    height: number;
  }

  type Shape = Circle | Rect;

  // @ts-expect-no-error
  isAssignable<DistributiveOmit<Shape, 'kind'>, { radius: number; } | { width: number; height: number; }>;
  // @ts-expect-no-error
  isAssignable<{ radius: number; } | { width: number; height: number; }, DistributiveOmit<Shape, 'kind'>>;

  // plain `Omit` collapses to `keyof Shape` = 'kind', leaving nothing once 'kind' is dropped
  // @ts-expect-error
  isAssignable<Omit<Shape, 'kind'>, { radius: number; }>;
}

/** `ButNot` vetoes an argument by assignability, which `Exclude` alone cannot do for a single type. */
namespace butNotTest {
  declare function nameIt<T extends string>(value: ButNot<T, 'reserved'>): void;

  // @ts-expect-no-error
  nameIt('anything');
  // @ts-expect-error
  nameIt('reserved');
}
