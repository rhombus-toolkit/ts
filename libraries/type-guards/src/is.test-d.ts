import type { Func } from '@rhombus-toolkit/types';
import { hasMember, hasValue, isAllThere, isArray, isAsyncGenerator, isDefined, isFunction, isGenerator, isIterable,
  isIterator, isIteratorObject, isObject, isPromise, isPromiseLike, isReadonlyArray } from './index';

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

// `isFunction`'s type argument is inferred from the value, so naming one is never an unchecked
// assertion: a signature the value does not already have is rejected at the call.
namespace isFunctionTypeArgumentRestatesTheValueTest {
  declare const value: unknown;

  // @ts-expect-error - unknown is not a Func<[number], number>
  isFunction<Func<[number], number>>(value);
  if (isFunction(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Func>;
  }
}

// The typed overload carries the element type through the narrowing, so a
// caller who knew what the source yielded does not get it back as `unknown`.
namespace isIteratorObjectKeepsTheElementTypeTest {
  declare const source: Iterator<number> | Iterable<number>;

  if (isIteratorObject(source)) {
    // @ts-expect-no-error
    isAssignable<typeof source, IteratorObject<number>>;
  }

  declare const value: unknown;

  if (isIteratorObject(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, IteratorObject<unknown>>;
  }
}

// The mutable overload is listed first so a mutable array narrows to `T[]`,
// not to the `readonly T[]` the second overload would hand back.
namespace isAllThereKeepsMutabilityTest {
  const items: Array<string | undefined> = [];
  const frozen: ReadonlyArray<string | undefined> = [];

  if (isAllThere(items)) {
    // @ts-expect-no-error
    isAssignable<typeof items, string[]>;
    // @ts-expect-no-error
    items.push('still writable');
  }

  if (isAllThere(frozen)) {
    // @ts-expect-no-error
    isAssignable<typeof frozen, readonly string[]>;
    // @ts-expect-error - the readonly overload does not invent write access
    frozen.push('never');
  }
}

// The narrowed type is the union's own function member, so the return type survives, and the
// false branch drops it.
namespace isFunctionNarrowsToTheMemberTest {
  declare const value: string | Func<[number], string>;

  if (isFunction(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Func<[number], string>>;
    // @ts-expect-no-error
    isAssignable<string>(value(1));
    // @ts-expect-error - the argument is checked against the member's signature
    value('one');
    // @ts-expect-error - a string is not callable, so it is gone from the true branch
    isAssignable<typeof value, string>;
  } else {
    // @ts-expect-no-error
    isAssignable<typeof value, string>;
    // @ts-expect-error - the function member is gone from the false branch
    isAssignable<typeof value, Func<[number], string>>;
  }

  declare const plain: object;
  if (isFunction(plain)) {
    // @ts-expect-no-error
    isAssignable<typeof plain, Func>;
  }

  declare const list: (string | Func<[], number>)[];
  // @ts-expect-no-error
  isAssignable<Func<[], number>[]>(list.filter(isFunction));
}

namespace isObjectNarrowsAwayPrimitivesAndNullTest {
  declare const value: string | null | { id: number; };

  if (isObject(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, { id: number; }>;
  } else {
    // @ts-expect-no-error
    isAssignable<typeof value, string | null>;
  }
}

// A contract guard narrows `unknown` to the protocol's lib type and no further —
// the element type is not knowable from a shape check.
namespace contractGuardsNarrowUnknownToTheProtocolTest {
  declare const value: unknown;

  if (isIterable(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Iterable<unknown>>;
  }
  if (isIterator(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Iterator<unknown>>;
  }
  if (isPromiseLike(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, PromiseLike<unknown>>;
  }
  if (isPromise(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Promise<unknown>>;
  }
  if (isGenerator(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, Generator<unknown>>;
  }
  if (isAsyncGenerator(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, AsyncGenerator<unknown>>;
  }
}

// `isArray` narrows to a mutable array and `isReadonlyArray` to a readonly one,
// so the two are not interchangeable at a `readonly` boundary.
namespace arrayGuardsDifferOnlyInMutabilityTest {
  declare const value: unknown;

  if (isArray(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, unknown[]>;
  }
  if (isReadonlyArray(value)) {
    // @ts-expect-no-error
    isAssignable<typeof value, readonly unknown[]>;
    // @ts-expect-error - readonly does not narrow to mutable
    isAssignable<typeof value, unknown[]>;
  }
}
