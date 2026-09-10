import { Body, Head, Last, Length, PartialList, Skip, Slice, SplitArray, Tail, Take } from './array';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

type Five = [0, 1, 2, 3, 4];

namespace splitArrayTest {
  type Subject = SplitArray<Five, 2>;
  type Expected = [[0, 1], [2, 3, 4]];

  // @ts-expect-no-error
  isAssignable<Subject, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Subject>;
}

/**
 * The regression. `Take` used `T` as its `Cast` fallback, and a prefix is never
 * assignable to the array it came from, so the fallback fired every call and the
 * whole input came back.
 */
namespace takeTest {
  type Subject = Take<2, Five>;

  // @ts-expect-no-error
  isAssignable<Subject, [0, 1]>;
  // @ts-expect-no-error
  isAssignable<[0, 1], Subject>;

  // the old broken behaviour: the entire input array
  // @ts-expect-error
  isAssignable<Subject, Five>;
}

namespace takeEdgesTest {
  // @ts-expect-no-error
  isAssignable<Take<0, Five>, []>;
  // @ts-expect-no-error
  isAssignable<[], Take<0, Five>>;
  // @ts-expect-no-error
  isAssignable<Take<5, Five>, Five>;
  // @ts-expect-no-error
  isAssignable<Five, Take<5, Five>>;
}

namespace skipTest {
  type Subject = Skip<2, Five>;

  // @ts-expect-no-error
  isAssignable<Subject, [2, 3, 4]>;
  // @ts-expect-no-error
  isAssignable<[2, 3, 4], Subject>;

  // the old broken behaviour
  // @ts-expect-error
  isAssignable<Subject, Five>;
}

namespace skipEdgesTest {
  // @ts-expect-no-error
  isAssignable<Skip<0, Five>, Five>;
  // @ts-expect-no-error
  isAssignable<Five, Skip<0, Five>>;
  // @ts-expect-no-error
  isAssignable<Skip<5, Five>, []>;
  // @ts-expect-no-error
  isAssignable<[], Skip<5, Five>>;
}

namespace sliceTest {
  type Subject = Slice<Five, 1, 3>;

  // @ts-expect-no-error
  isAssignable<Subject, [1, 2, 3]>;
  // @ts-expect-no-error
  isAssignable<[1, 2, 3], Subject>;
}

/**
 * `Take` and `Skip` must still satisfy an `any[]` constraint while `N` and `T`
 * are parameters -- that is what the `Cast` is for, and what `Curry` relies on.
 */
namespace stillSatisfiesArrayConstraintTest {
  type NeedsArray<T extends any[]> = T;

  type TakeStaysAnArray<N extends number, T extends any[]> = NeedsArray<Take<N, T>>;
  type SkipStaysAnArray<N extends number, T extends any[]> = NeedsArray<Skip<N, T>>;

  // @ts-expect-no-error
  isAssignable<TakeStaysAnArray<2, Five>, [0, 1]>;
  // @ts-expect-no-error
  isAssignable<SkipStaysAnArray<2, Five>, [2, 3, 4]>;
}

namespace headTailBodyLastTest {
  // @ts-expect-no-error
  isAssignable<Head<Five>, 0>;
  // @ts-expect-no-error
  isAssignable<Last<Five>, 4>;
  // @ts-expect-no-error
  isAssignable<Tail<Five>, [1, 2, 3, 4]>;
  // @ts-expect-no-error
  isAssignable<Body<Five>, [0, 1, 2, 3]>;
  // @ts-expect-no-error
  isAssignable<Length<Five>, 5>;
}

/** Every prefix of the list, the empty one included -- never a suffix, never longer. */
namespace partialListTest {
  type Subject = PartialList<[0, 1, 2]>;

  // @ts-expect-no-error
  isAssignable<[0, 1, 2], Subject>;
  // @ts-expect-no-error
  isAssignable<[0, 1], Subject>;
  // @ts-expect-no-error
  isAssignable<[0], Subject>;
  // @ts-expect-no-error
  isAssignable<[], Subject>;
  // @ts-expect-no-error
  isAssignable<Subject, [0, 1, 2] | [0, 1] | [0] | []>;

  // @ts-expect-error
  isAssignable<[1], Subject>;
  // @ts-expect-error
  isAssignable<[1, 2], Subject>;
  // @ts-expect-error
  isAssignable<[0, 1, 2, 3], Subject>;

  // @ts-expect-no-error
  isAssignable<PartialList<[]>, []>;
}

/** The empty tuple has no head, tail, body or last -- and a length of zero. */
namespace emptyTupleTest {
  // @ts-expect-no-error
  isAssignable<Head<[]>, never>;
  // @ts-expect-no-error
  isAssignable<Tail<[]>, never>;
  // @ts-expect-no-error
  isAssignable<Body<[]>, never>;
  // @ts-expect-no-error
  isAssignable<Last<[]>, never>;
  // @ts-expect-no-error
  isAssignable<Length<[]>, 0>;

  // a single element is its own head and last, with nothing around it
  // @ts-expect-no-error
  isAssignable<Head<[7]>, 7>;
  // @ts-expect-no-error
  isAssignable<Last<[7]>, 7>;
  // @ts-expect-no-error
  isAssignable<Tail<[7]>, []>;
  // @ts-expect-no-error
  isAssignable<Body<[7]>, []>;
}

/** Counts past the end are clamped, never an error. */
namespace pastTheEndTest {
  // @ts-expect-no-error
  isAssignable<Take<9, Five>, Five>;
  // @ts-expect-no-error
  isAssignable<Five, Take<9, Five>>;
  // @ts-expect-no-error
  isAssignable<Skip<9, Five>, []>;
  // @ts-expect-no-error
  isAssignable<[], Skip<9, Five>>;
  // @ts-expect-no-error
  isAssignable<Take<3, []>, []>;
  // @ts-expect-no-error
  isAssignable<Skip<3, []>, []>;
  // @ts-expect-no-error
  isAssignable<SplitArray<Five, 9>, [Five, []]>;
}

/** `Slice` defaults: from the start, to the end. */
namespace sliceDefaultsTest {
  // @ts-expect-no-error
  isAssignable<Slice<Five>, Five>;
  // @ts-expect-no-error
  isAssignable<Five, Slice<Five>>;
  // @ts-expect-no-error
  isAssignable<Slice<Five, 2>, [2, 3, 4]>;
  // @ts-expect-no-error
  isAssignable<[2, 3, 4], Slice<Five, 2>>;
  // @ts-expect-no-error
  isAssignable<Slice<Five, 1, 0>, []>;
  // @ts-expect-error
  isAssignable<Slice<Five, 1, 3>, [0, 1, 2]>;
}
