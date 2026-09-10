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

// `TLeaf` (or the predicate overload) picks what the descent stops at; the
// default only ever stops at a function.
namespace leafTypeTest {
  type Subject = flattenMap<{ a: { b: number; }; c: number; }, number>;
  type Expected = { 'a.b': number; c: number; };

  // @ts-expect-no-error
  isAssignable<Subject, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, Subject>;

  const viaPredicate = flattenMap({ a: { b: 1 }, c: 2 }, (p): p is number => typeof p === 'number');

  // @ts-expect-no-error
  isAssignable<typeof viaPredicate, Expected>;
  // @ts-expect-no-error
  isAssignable<Expected, typeof viaPredicate>;

  // @ts-expect-error - a non-function leaf needs a predicate to be admitted
  flattenMap({ a: { b: 1 } });
}

// `MaxDepth` is spent one cell per object entered, the root included: a leaf
// sitting `n` objects deep needs `MaxDepth` of at least `n + 1`, and anything
// deeper falls out of the result rather than erroring.
namespace maxDepthTest {
  type Source = { a: { b: Func; }; c: Func; };

  // @ts-expect-no-error
  isAssignable<flattenMap<Source, Func, 1>, {}>;
  // @ts-expect-error - the root spends the only cell, so even `c` is out of budget
  isAssignable<flattenMap<Source, Func, 1>, { c: Func; }>;

  // @ts-expect-no-error
  isAssignable<flattenMap<Source, Func, 2>, { c: Func; }>;
  // @ts-expect-error - `a.b` sits one object deeper than the budget reaches
  isAssignable<flattenMap<Source, Func, 2>, { c: Func; 'a.b': Func; }>;

  // @ts-expect-no-error
  isAssignable<flattenMap<Source, Func, 3>, { c: Func; 'a.b': Func; }>;
  // @ts-expect-no-error
  isAssignable<{ c: Func; 'a.b': Func; }, flattenMap<Source, Func, 3>>;
}

// A key with no string literal spelling widens to `string` in the joined path,
// so a numeric key costs the result its exact keys and a symbol key never appears.
namespace nonStringKeyTest {
  declare const symbolKey: unique symbol;
  type WithSymbolKey = flattenMap<{ [symbolKey]: Func; a: Func; }>;

  // @ts-expect-no-error
  isAssignable<WithSymbolKey, { a: Func; }>;
  declare const withSymbolKey: WithSymbolKey;
  // @ts-expect-error - the symbol key is not in the result
  withSymbolKey[symbolKey];

  // @ts-expect-no-error
  isAssignable<flattenMap<{ 0: Func; a: Func; }>, { [key: string]: Func; a: Func; }>;
  // @ts-expect-no-error
  isAssignable<flattenMap<{ a: { 1: Func; }; }>, { [key: `a.${string}`]: Func; }>;
  // @ts-expect-no-error
  isAssignable<{ [key: `a.${string}`]: Func; }, flattenMap<{ a: { 1: Func; }; }>>;
  // @ts-expect-no-error - spelled as a string the key keeps its literal
  isAssignable<flattenMap<{ a: { '7': Func; }; }>, { 'a.7': Func; }>;
}
