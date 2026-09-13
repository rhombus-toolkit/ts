import type { Func } from '@rhombus-toolkit/types';
import { concat, first, iterable, replace, sequenceEquals, tryFirst, tryFirstDefined, zip } from './utils';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace concatKeepsItsElementTypeTest {
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof concat<number>>, IteratorObject<number, undefined, unknown>>;
}

namespace zipModeSetsThePositionTypeTest {
  const strings: Iterable<string> = [];
  const numbers: Iterable<number> = [];
  const innerPairs = zip('inner', strings, numbers);
  const outerPairs = zip('outer', strings, numbers);

  // @ts-expect-no-error
  isAssignable<typeof innerPairs, Generator<[string, number]>>;
  // @ts-expect-no-error
  isAssignable<typeof outerPairs, Generator<[string | undefined, number | undefined]>>;

  // an exhausted source's position is `undefined`, so 'outer' does not satisfy 'inner'
  // @ts-expect-error
  isAssignable<typeof outerPairs, Generator<[string, number]>>;
}

namespace replaceReplacementSetsTheElementTypeTest {
  const numbers: Iterable<number> = [];
  const sameType = replace(numbers, 1, 2);
  const sameTypeByFunction = replace(numbers, 1, n => n * 2);
  const widened = replace(numbers, 1, 'two');
  const widenedByFunction = replace(numbers, 1, n => String(n));

  // @ts-expect-no-error
  isAssignable<typeof sameType, Generator<number>>;
  // @ts-expect-no-error
  isAssignable<typeof sameTypeByFunction, Generator<number>>;
  // @ts-expect-no-error
  isAssignable<typeof widened, Generator<number | string>>;
  // @ts-expect-no-error
  isAssignable<typeof widenedByFunction, Generator<number | string>>;

  // a replacement of another type widens the element type, so the result is no longer a number sequence
  // @ts-expect-error
  isAssignable<typeof widened, Generator<number>>;
}

namespace firstFamilyReturnTypesTest {
  const numbers: Iterable<number | undefined> = [];

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof tryFirst<number>>, number | undefined>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof first<number>>, number>;
  // @ts-expect-no-error
  isAssignable<typeof numbers extends Iterable<infer T> ? ReturnType<typeof tryFirstDefined<T>> : never,
    number | undefined>;

  // `first` does not promise a defined value at the type level when the source admits undefined
  // @ts-expect-error
  isAssignable<ReturnType<typeof first<number | undefined>>, number>;
}

namespace sequenceEqualsComparesTheSharedElementTypeTest {
  const strings: Iterable<string> = [];

  // @ts-expect-no-error
  sequenceEquals(strings, strings, (left: string, right: string) => left === right);

  // a comparison over a narrower type than the sources yield is not accepted
  // @ts-expect-error
  sequenceEquals(strings, strings, (left: 'a', right: 'a') => left === right);
}

namespace iterableKeepsTheFactoryElementTypeTest {
  declare const factory: Func<[], Iterator<number>>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof iterable<number>>, Iterable<number>>;
  // @ts-expect-no-error
  isAssignable<typeof iterable<number>, Func<[typeof factory], Iterable<number>>>;
}
