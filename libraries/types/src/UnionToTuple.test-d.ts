import { TupleToUnion, UnionToTuple } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace multiMemberTest {
  type Subject = UnionToTuple<'a' | 'b' | 'c'>;
  type Expected = readonly ['a', 'b', 'c'];

  // @ts-expect-no-error
  isAssignable<Subject, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Subject>;

  // wrong order
  // @ts-expect-error
  isAssignable<Subject, readonly ['c', 'b', 'a']>;
  // wrong length
  // @ts-expect-error
  isAssignable<Subject, readonly ['a', 'b']>;
}

namespace neverTest {
  type Subject = UnionToTuple<never>;

  // @ts-expect-no-error
  isAssignable<Subject, readonly []>;
  // @ts-expect-no-error
  isAssignable<readonly [], Subject>;
}

namespace singleMemberTest {
  type Subject = UnionToTuple<'x'>;

  // @ts-expect-no-error
  isAssignable<Subject, readonly ['x']>;
  // @ts-expect-no-error
  isAssignable<readonly ['x'], Subject>;

  // @ts-expect-error
  isAssignable<Subject, readonly ['y']>;
}

/** The round trip, which is what the shared `UnionToIntersection` had to keep working. */
namespace roundTripTest {
  // @ts-expect-no-error
  isAssignable<TupleToUnion<[1, '2', 3]>, 1 | '2' | 3>;
  // @ts-expect-no-error
  isAssignable<1 | '2' | 3, TupleToUnion<[1, '2', 3]>>;
  // @ts-expect-no-error
  isAssignable<UnionToTuple<TupleToUnion<['a', 'b']>>, readonly ['a', 'b']>;
}
