import { ButNot, DistributiveOmit, Except, Flatten, IfEquals, MakeRequired, Mutable, ReadonlyKeys, Simplify,
  WritableKeys, WritablePart } from './utility-types';

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

/** `DistributiveOmit` omits per union member; plain `Omit` operates only on the keys every member shares. */
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

/** `Simplify` flattens an intersection into one shape; the members are unchanged. */
namespace simplifyTest {
  type A = { a: string; };
  type B = { b: number; };

  // @ts-expect-no-error
  isAssignable<Simplify<A & B>, { a: string; b: number; }>;
  // @ts-expect-no-error
  isAssignable<{ a: string; b: number; }, Simplify<A & B>>;
  // @ts-expect-error
  isAssignable<{ a: string; }, Simplify<A & B>>;
}

/** `Except` is `Omit` limited to keys the object actually has. */
namespace exceptTest {
  // @ts-expect-no-error
  isAssignable<Except<Source, 'a'>, { b: number; }>;
  // @ts-expect-no-error
  isAssignable<{ b: number; }, Except<Source, 'a'>>;
  // @ts-expect-error
  isAssignable<Except<Source, 'a'>, { a: string; }>;

  // @ts-expect-no-error
  type StillFine = Omit<Source, 'c'>;
  // @ts-expect-error
  type Refused = Except<Source, 'c'>;
}

/** `IfEquals` is identity, not mutual assignability. */
namespace ifEqualsTest {
  // @ts-expect-no-error
  isAssignable<IfEquals<1, 1, 'same', 'different'>, 'same'>;
  // @ts-expect-no-error
  isAssignable<IfEquals<1, number, 'same', 'different'>, 'different'>;
  // @ts-expect-no-error
  isAssignable<IfEquals<number, 1, 'same', 'different'>, 'different'>;

  // the distinctions plain assignability loses
  // @ts-expect-no-error
  isAssignable<IfEquals<{ a: 1; }, { readonly a: 1; }, 'same', 'different'>, 'different'>;
  // @ts-expect-no-error
  isAssignable<IfEquals<any, unknown, 'same', 'different'>, 'different'>;
  // @ts-expect-no-error
  isAssignable<IfEquals<{ a?: 1; }, { a: 1 | undefined; }, 'same', 'different'>, 'different'>;

  // union order is not a difference
  // @ts-expect-no-error
  isAssignable<IfEquals<1 | 2, 2 | 1, 'same', 'different'>, 'same'>;

  // `B` defaults to never
  // @ts-expect-no-error
  isAssignable<IfEquals<1, 2, 'same'>, never>;
}

/** The readonly split: `WritableKeys` / `ReadonlyKeys` partition the keys, `WritablePart` picks. */
namespace writableSplitTest {
  interface Mixed {
    a: string;
    readonly b: number;
    c: boolean;
  }

  // @ts-expect-no-error
  isAssignable<WritableKeys<Mixed>, 'a' | 'c'>;
  // @ts-expect-no-error
  isAssignable<'a' | 'c', WritableKeys<Mixed>>;
  // @ts-expect-no-error
  isAssignable<ReadonlyKeys<Mixed>, 'b'>;
  // @ts-expect-no-error
  isAssignable<'b', ReadonlyKeys<Mixed>>;

  // @ts-expect-no-error
  isAssignable<WritablePart<Mixed>, { a: string; c: boolean; }>;
  // @ts-expect-no-error
  isAssignable<{ a: string; c: boolean; }, WritablePart<Mixed>>;
  // @ts-expect-error
  isAssignable<WritablePart<Mixed>, { b: number; }>;

  // all one way or the other
  // @ts-expect-no-error
  isAssignable<ReadonlyKeys<{ a: 1; }>, never>;
  // @ts-expect-no-error
  isAssignable<WritableKeys<{ readonly a: 1; }>, never>;
}

/** `ButNot` over a union filters like `Exclude` would. */
namespace butNotUnionTest {
  // @ts-expect-no-error
  isAssignable<ButNot<'a' | 'b', 'a'>, 'b'>;
  // @ts-expect-no-error
  isAssignable<'b', ButNot<'a' | 'b', 'a'>>;
  // @ts-expect-no-error
  isAssignable<ButNot<'a', 'a'>, never>;
  // @ts-expect-no-error
  isAssignable<ButNot<string, 'reserved'>, string>;
}

/**
 * An optional writable key leaks `undefined` into `WritableKeys`: the mapping keeps the `?`, so the
 * property's value becomes `K | undefined` before it is indexed out. `ReadonlyKeys` strips it with `-?`.
 */
namespace writableKeysOptionalTest {
  interface Loose {
    a?: string;
    readonly b: number;
  }

  // @ts-expect-no-error
  isAssignable<WritableKeys<Loose>, 'a'>;
  // @ts-expect-error
  isAssignable<undefined, WritableKeys<Loose>>;
  // the read-only side is unaffected
  // @ts-expect-no-error
  isAssignable<ReadonlyKeys<Loose>, 'b'>;
  // @ts-expect-no-error
  isAssignable<'b', ReadonlyKeys<Loose>>;
}
