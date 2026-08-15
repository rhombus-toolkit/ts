import { AbstractCtor, Ctor, Func } from './func';
import { $, Func as GenericFunc } from './generics';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace funcTest {
  const f: Func<[number], string> = (n: number) => `${n}`;

  // @ts-expect-no-error
  isAssignable<string>(f(1));
  // @ts-expect-error
  f('a');
}

namespace ctorTest {
  class Thing {
    constructor(public name: string) {}
  }

  // @ts-expect-no-error
  isAssignable<typeof Thing, Ctor<[string], Thing>>;
  // @ts-expect-no-error
  isAssignable<typeof Thing, AbstractCtor<[string], Thing>>;
}

/** The `./generic` subpath: `$` is the placeholder the `Constraint` argument binds. */
namespace genericPlaceholderTest {
  type F = GenericFunc<[$], void, number>;

  declare const f: F;

  // @ts-expect-no-error
  f(1);
  // the placeholder is constrained to number
  // @ts-expect-error
  f('a');
}
