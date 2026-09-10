import { Func, UnionToIntersection } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace simpleTest {
  type S1 = { a: 'A'; };
  type S2 = { b: 'B'; };

  type Subject = UnionToIntersection<S1 | S2>;

  // @ts-expect-no-error
  isAssignable<Subject, S1 & S2>;
  // @ts-expect-error
  isAssignable<S1 | S2, Subject>;
  // @ts-expect-no-error
  isAssignable<S1 & S2, Subject>;
}

namespace funcTest {
  type S1 = Func<[number], string>;
  type S2 = Func<[string], number>;

  type Subject = S1 | S2;

  type Result = UnionToIntersection<Subject>;

  type Expected = { (n: number): string; (s: string): number; };

  // @ts-expect-no-error
  isAssignable<Result, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Result>;

  // @ts-expect-error
  isAssignable<Subject, Result>;

  declare const f: Result;

  // @ts-expect-no-error
  isAssignable<string>(f(2));
  // @ts-expect-no-error
  isAssignable<number>(f('a'));
  // @ts-expect-error
  isAssignable<number>(f(2));
  // @ts-expect-error
  isAssignable<string>(f('a'));
}

/** A single member intersects to itself; disjoint members intersect to nothing. */
namespace degenerateTest {
  // @ts-expect-no-error
  isAssignable<UnionToIntersection<'a'>, 'a'>;
  // @ts-expect-no-error
  isAssignable<'a', UnionToIntersection<'a'>>;
  // @ts-expect-no-error
  isAssignable<UnionToIntersection<boolean>, never>;
  // @ts-expect-no-error
  isAssignable<UnionToIntersection<'a' | 'b'>, never>;
}
