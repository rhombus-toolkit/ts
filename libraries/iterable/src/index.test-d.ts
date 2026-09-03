import { concat, zip } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

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
