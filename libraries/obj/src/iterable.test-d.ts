import { concat, isAllThere, zip } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// `isAllThere` is two overloads rather than one so an array keeps its array-ness
// through the narrowing -- the Iterable overload alone would hand back
// `(T | undefined)[] & Iterable<T>`, whose index signature still yields
// `T | undefined`.

namespace isAllThereNarrowsAnArrayTest {
  const items: (string | undefined)[] = [];

  // @ts-expect-error
  isAssignable<typeof items[0], string>;

  if (isAllThere(items)) {
    // @ts-expect-no-error
    isAssignable<typeof items[0], string>;
    // @ts-expect-no-error
    isAssignable<typeof items, readonly string[]>;
  }
}

namespace isAllThereNarrowsANonArrayIterableTest {
  const items: Set<string | undefined> = new Set();

  if (isAllThere(items)) {
    // @ts-expect-no-error
    isAssignable<typeof items, Iterable<string>>;
  }
}

namespace concatKeepsItsElementTypeTest {
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof concat<number>>, IteratorObject<number, undefined, unknown>>;
}

namespace zipModeDecidesTheSlotTypeTest {
  const strings: Iterable<string> = [];
  const numbers: Iterable<number> = [];
  const innerPairs = zip('inner', strings, numbers);
  const outerPairs = zip('outer', strings, numbers);

  // @ts-expect-no-error
  isAssignable<typeof innerPairs, Generator<[string, number]>>;
  // @ts-expect-no-error
  isAssignable<typeof outerPairs, Generator<[string | undefined, number | undefined]>>;

  // an exhausted source's slot is `undefined`, so 'outer' does not satisfy 'inner'
  // @ts-expect-error
  isAssignable<typeof outerPairs, Generator<[string, number]>>;
}
