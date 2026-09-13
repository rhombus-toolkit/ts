import { assertNever } from './assert-never';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// The compile-time check is the whole value: only a `never` reaches the call,
// so a union member the switch forgot becomes an error at the `default`.
namespace assertNeverAcceptsOnlyNeverTest {
  type Shape = { kind: 'circle'; } | { kind: 'square'; };
  declare const shape: Shape;

  switch (shape.kind) {
    case 'circle': {
      break;
    }
    case 'square': {
      break;
    }
    default: {
      // @ts-expect-no-error
      assertNever(shape);
    }
  }

  switch (shape.kind) {
    case 'circle': {
      break;
    }
    default: {
      // @ts-expect-error - 'square' is not handled, so `shape` is not `never` here
      assertNever(shape);
    }
  }

  // @ts-expect-error - an unnarrowed value is not `never`
  assertNever('literal');
}

namespace assertNeverReturnsNeverTest {
  declare const unreachable: never;
  const result = assertNever(unreachable);

  // @ts-expect-no-error
  isAssignable<typeof result, never>;

  // `never` is assignable to any return type, so the call closes an exhaustive branch of any function
  function area(kind: 'circle' | 'square'): number {
    if (kind === 'circle') {
      return 1;
    } else if (kind === 'square') {
      return 2;
    } else {
      // @ts-expect-no-error
      return assertNever(kind);
    }
  }
  area('circle');
}
