import { DeepDictionary, DeepDictionaryItem, DeepRecord, DeepRecordItem, Dictionary } from './deep-record';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** Every key holds a leaf or another record of the same keys, to any depth. */
namespace deepRecordTest {
  type Tree = DeepRecord<'a' | 'b', number>;

  // @ts-expect-no-error
  isAssignable<{ a: 1; b: 2; }, Tree>;
  // @ts-expect-no-error
  isAssignable<{ a: 1; b: { a: 2; b: 3; }; }, Tree>;
  // @ts-expect-no-error
  isAssignable<{ a: { a: { a: 1; b: 2; }; b: 3; }; b: 4; }, Tree>;

  // every key is required at every level
  // @ts-expect-error
  isAssignable<{ a: 1; }, Tree>;
  // @ts-expect-error
  isAssignable<{ a: 1; b: { a: 2; }; }, Tree>;

  // a leaf of the wrong type, at any depth
  // @ts-expect-error
  isAssignable<{ a: 'x'; b: 2; }, Tree>;
  // @ts-expect-error
  isAssignable<{ a: 1; b: { a: 'x'; b: 2; }; }, Tree>;
}

/** The item is exactly a record property's value: a leaf or a nested record. */
namespace deepRecordItemTest {
  type Item = DeepRecordItem<'a', number>;

  // @ts-expect-no-error
  isAssignable<1, Item>;
  // @ts-expect-no-error
  isAssignable<{ a: 1; }, Item>;
  // @ts-expect-no-error
  isAssignable<{ a: { a: 1; }; }, Item>;
  // @ts-expect-error
  isAssignable<'x', Item>;

  // @ts-expect-no-error
  isAssignable<DeepRecord<'a', number>['a'], Item>;
  // @ts-expect-no-error
  isAssignable<Item, DeepRecord<'a', number>['a']>;
}

/** The defaults: any property key, any value. */
namespace defaultsTest {
  // @ts-expect-no-error
  isAssignable<{ x: 1; y: 'a'; z: { w: null; }; }, DeepRecord>;
  // @ts-expect-no-error
  isAssignable<{ x: 1; y: 'a'; }, DeepRecordItem>;
  // @ts-expect-no-error
  isAssignable<{ x: 1; y: 'a'; }, Dictionary>;
}

/** `Dictionary<T>` is `Record<string, T>` by another name. */
namespace dictionaryTest {
  // @ts-expect-no-error
  isAssignable<Dictionary<number>, Record<string, number>>;
  // @ts-expect-no-error
  isAssignable<Record<string, number>, Dictionary<number>>;

  // @ts-expect-no-error
  isAssignable<{ a: 1; b: 2; }, Dictionary<number>>;
  // @ts-expect-error
  isAssignable<{ a: 'x'; }, Dictionary<number>>;
  // flat: a nested object is not a `number`
  // @ts-expect-error
  isAssignable<{ a: { b: 1; }; }, Dictionary<number>>;
}

/** The string-keyed deep pair: nesting goes as deep as it likes, leaves stay typed. */
namespace deepDictionaryTest {
  // @ts-expect-no-error
  isAssignable<{ a: 1; b: { c: 2; d: { e: 3; }; }; }, DeepDictionary<number>>;
  // @ts-expect-error
  isAssignable<{ a: { b: 'x'; }; }, DeepDictionary<number>>;

  // @ts-expect-no-error
  isAssignable<1, DeepDictionaryItem<number>>;
  // @ts-expect-no-error
  isAssignable<{ a: 1; }, DeepDictionaryItem<number>>;
  // @ts-expect-error
  isAssignable<'x', DeepDictionaryItem<number>>;

  // @ts-expect-no-error
  isAssignable<DeepDictionary<number>[string], DeepDictionaryItem<number>>;
  // @ts-expect-no-error
  isAssignable<DeepDictionaryItem<number>, DeepDictionary<number>[string]>;
}
