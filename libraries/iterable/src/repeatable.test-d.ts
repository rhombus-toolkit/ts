import { repeatable } from './repeatable';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace repeatableKeepsTheElementTypeTest {
  declare const numbers: Iterator<number>;
  declare const strings: Iterable<string>;
  const fromIterator = repeatable(numbers);
  const fromIterable = repeatable(strings);
  const fromGenerator = repeatable((function*(): Generator<boolean> {})());

  // @ts-expect-no-error
  isAssignable<typeof fromIterator, Iterable<number>>;
  // @ts-expect-no-error
  isAssignable<typeof fromIterable, Iterable<string>>;
  // @ts-expect-no-error
  isAssignable<typeof fromGenerator, Iterable<boolean>>;

  // the element type comes from the source, so a string source is not a number sequence
  // @ts-expect-error
  isAssignable<typeof fromIterable, Iterable<number>>;
}
