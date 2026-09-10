import { AbstractCtor, Action, AsyncAction, AsyncFunc, Ctor, Func } from './func';
import { $, Func as GenericFunc } from './generics';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace funcTest {
  const f: Func<[number], string> = (n: number) => `${n}`;

  // @ts-expect-no-error
  isAssignable<string>(f(1));
  // @ts-expect-error
  f('a');
  // @ts-expect-error
  f();

  // the defaults: any arguments, any return
  declare const loose: Func;
  // @ts-expect-no-error
  isAssignable<any>(loose(1, 'a'));
}

/** `This` is the type the function must be called on; the default `unknown` asks for nothing. */
namespace thisTest {
  declare const bound: Func<[], number, { count: number; }>;

  // @ts-expect-no-error
  isAssignable<number>(bound.call({ count: 1 }));
  // @ts-expect-error
  bound();
  // @ts-expect-error
  bound.call({ count: 'a' });

  declare const free: Func<[], number>;

  // @ts-expect-no-error
  free();
}

/** `AsyncFunc` promises the return, and does not double-wrap one already promised. */
namespace asyncFuncTest {
  declare const af: AsyncFunc<[number], string>;

  // @ts-expect-no-error
  isAssignable<Promise<string>>(af(1));
  // @ts-expect-error
  isAssignable<string>(af(1));

  // @ts-expect-no-error
  isAssignable<AsyncFunc<[], Promise<string>>, Func<[], Promise<string>>>;
  // @ts-expect-no-error
  isAssignable<Func<[], Promise<string>>, AsyncFunc<[], Promise<string>>>;
  // @ts-expect-error
  isAssignable<AsyncFunc<[], string>, Func<[], string>>;
}

/** The void-returning pair. */
namespace actionTest {
  // @ts-expect-no-error
  isAssignable<Action<[number]>, Func<[number], void>>;
  // @ts-expect-no-error
  isAssignable<Func<[number], void>, Action<[number]>>;
  // @ts-expect-no-error
  isAssignable<AsyncAction<[number]>, Func<[number], Promise<void>>>;
  // @ts-expect-no-error
  isAssignable<Func<[number], Promise<void>>, AsyncAction<[number]>>;

  // `this` rides along
  declare const bound: Action<[], { count: number; }>;
  // @ts-expect-error
  bound();
}

/** `in Args`: the function that accepts more stands in for the one that accepts less. */
namespace argsContravarianceTest {
  // @ts-expect-no-error
  isAssignable<Func<[number], void>, Func<[1], void>>;
  // @ts-expect-error
  isAssignable<Func<[1], void>, Func<[number], void>>;
  // @ts-expect-no-error
  isAssignable<Func<[number | string], void>, Func<[number], void>>;
  // @ts-expect-error
  isAssignable<Func<[number], void>, Func<[number | string], void>>;
}

/** `out Return`: the function that returns less stands in for the one that returns more. */
namespace returnCovarianceTest {
  // @ts-expect-no-error
  isAssignable<Func<[], 'a'>, Func<[], string>>;
  // @ts-expect-error
  isAssignable<Func<[], string>, Func<[], 'a'>>;
}

/** `in This`: the function that demands less of its receiver stands in for the one that demands more. */
namespace thisContravarianceTest {
  // @ts-expect-no-error
  isAssignable<Func<[], void, unknown>, Func<[], void, { count: number; }>>;
  // @ts-expect-error
  isAssignable<Func<[], void, { count: number; }>, Func<[], void, unknown>>;
}

namespace ctorTest {
  class Thing {
    constructor(public name: string) {}
  }

  // @ts-expect-no-error
  isAssignable<typeof Thing, Ctor<[string], Thing>>;
  // @ts-expect-no-error
  isAssignable<typeof Thing, AbstractCtor<[string], Thing>>;
  // @ts-expect-error
  isAssignable<typeof Thing, Ctor<[number], Thing>>;

  declare const Make: Ctor<[string], Thing>;

  // @ts-expect-no-error
  isAssignable<Thing>(new Make('a'));
  // @ts-expect-error
  new Make(1);
  // @ts-expect-no-error
  isAssignable<Thing>(Make.prototype);

  // the defaults: any arguments, any instance
  declare const Loose: Ctor;
  // @ts-expect-no-error
  isAssignable<any>(new Loose(1, 'a'));
}

/** Abstract satisfies `AbstractCtor` only; concrete satisfies both. */
namespace abstractCtorTest {
  abstract class Shape {
    abstract area(): number;
  }

  class Square extends Shape {
    override area(): number {
      return 1;
    }
  }

  // @ts-expect-no-error
  isAssignable<typeof Shape, AbstractCtor<[], Shape>>;
  // @ts-expect-error
  isAssignable<typeof Shape, Ctor<[], Shape>>;
  // @ts-expect-no-error
  isAssignable<typeof Square, Ctor<[], Shape>>;
  // @ts-expect-no-error
  isAssignable<typeof Square, AbstractCtor<[], Shape>>;

  // @ts-expect-no-error
  isAssignable<Ctor<[], Shape>, AbstractCtor<[], Shape>>;
  // @ts-expect-error
  isAssignable<AbstractCtor<[], Shape>, Ctor<[], Shape>>;

  declare const Abstract: AbstractCtor<[], Shape>;

  // @ts-expect-error
  new Abstract();
  // @ts-expect-no-error
  isAssignable<Shape>(Abstract.prototype);
}

/** `in Args` / `out Instance` on the constructor pair. */
namespace ctorVarianceTest {
  class Base {
    base = 1;
  }

  class Derived extends Base {
    derived = 2;
  }

  // @ts-expect-no-error
  isAssignable<Ctor<[number], Base>, Ctor<[1], Base>>;
  // @ts-expect-error
  isAssignable<Ctor<[1], Base>, Ctor<[number], Base>>;
  // @ts-expect-no-error
  isAssignable<Ctor<[], Derived>, Ctor<[], Base>>;
  // @ts-expect-error
  isAssignable<Ctor<[], Base>, Ctor<[], Derived>>;

  // @ts-expect-no-error
  isAssignable<AbstractCtor<[number], Base>, AbstractCtor<[1], Base>>;
  // @ts-expect-error
  isAssignable<AbstractCtor<[1], Base>, AbstractCtor<[number], Base>>;
  // @ts-expect-no-error
  isAssignable<AbstractCtor<[], Derived>, AbstractCtor<[], Base>>;
  // @ts-expect-error
  isAssignable<AbstractCtor<[], Base>, AbstractCtor<[], Derived>>;
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
