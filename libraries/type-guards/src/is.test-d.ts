import { hasMember, hasValue, isAllThere, isDefined, isFunction } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// `isAllThere` is two overloads rather than one so a mutable array keeps its
// mutability through the narrowing -- the ReadonlyArray overload alone matches a
// mutable array too, handing back `readonly T[]` and taking write access with it.

namespace isAllThereNarrowsAnArrayTest {
  const items: Array<string | undefined> = [];

  // @ts-expect-error
  isAssignable<typeof items[0], string>;

  if (isAllThere(items)) {
    // @ts-expect-no-error
    isAssignable<typeof items[0], string>;
    // @ts-expect-no-error
    isAssignable<typeof items, readonly string[]>;
  }
}

// The key is a type parameter, so the narrowing names the key actually checked
// rather than collapsing to an index signature that admits every other key.
namespace hasMemberNamesTheCheckedKeyTest {
  declare const value: unknown;

  if (hasMember(value, 'foo')) {
    // @ts-expect-no-error
    isAssignable<typeof value, Record<'foo', unknown>>;
    // @ts-expect-error - a key that was never checked is not on the narrowed type
    value.neverChecked;
  }
}

// `isDefined` strips `undefined` while leaving `null`; `hasValue` strips both.
// The type parameter is what lets either be passed to `filter` point-free.
namespace definednessNarrowingTest {
  declare const mixed: Array<string | null | undefined>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof mixed.filter<string | null>>, Array<string | null>>;

  const defined = mixed.filter(isDefined);
  // @ts-expect-no-error
  isAssignable<typeof defined, Array<string | null>>;

  const present = mixed.filter(hasValue);
  // @ts-expect-no-error
  isAssignable<typeof present, string[]>;
}

// `isFunction` takes no type arguments -- `typeof` witnesses callability and
// nothing about the signature, so naming one would be an unchecked assertion.
namespace isFunctionTakesNoTypeArgumentsTest {
  declare const value: unknown;

  // @ts-expect-error - the guard is not generic
  isFunction<[number], number>(value);
}
