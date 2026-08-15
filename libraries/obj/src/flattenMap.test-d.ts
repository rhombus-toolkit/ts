import { Func } from '@rhombus-toolkit/types';
import { flattenMap } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Func is contravariant on its Args parameter (`in Args`), so a leaf typed with
// specific args (e.g. Func<[number], void>) is NOT assignable to the bare Func
// the DeepDictionary<Func> constraint requires. Leaves therefore keep Args as
// any[] and vary the covariant Return to stay distinguishable.

namespace shallowTest {
  type Subject = flattenMap<{ a: Func<any[], number>; b: { c: Func<any[], string>; }; }>;
  type Expected = { a: Func<any[], number>; 'b.c': Func<any[], string>; };

  // @ts-expect-no-error
  isAssignable<Subject, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Subject>;

  // wrong key
  // @ts-expect-error
  isAssignable<Subject, { a: Func<any[], number>; 'b.d': Func<any[], string>; }>;
  // wrong leaf return type
  // @ts-expect-error
  isAssignable<Subject, { a: Func<any[], string>; 'b.c': Func<any[], string>; }>;
}

namespace deepTest {
  type Subject = flattenMap<{ a: { b: { c: Func<any[], number>; }; }; x: Func<any[], void>; }>;
  type Expected = { 'a.b.c': Func<any[], number>; x: Func<any[], void>; };

  // @ts-expect-no-error
  isAssignable<Subject, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Subject>;
}
