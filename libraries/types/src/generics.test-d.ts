import { AbstractCtor as PlainAbstractCtor, Ctor as PlainCtor, Func as PlainFunc } from './func';
import { $, AbstractCtor, Action, AsyncAction, AsyncFunc, AsyncSub, Ctor, Func, Sub } from './generics';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

interface Box<T> {
  value: T;
}

/** Without a `$` anywhere, the generic variants are the plain ones. */
namespace noPlaceholderTest {
  // @ts-expect-no-error
  isAssignable<Func<[number], string>, PlainFunc<[number], string>>;
  // @ts-expect-no-error
  isAssignable<PlainFunc<[number], string>, Func<[number], string>>;
  // @ts-expect-no-error
  isAssignable<Ctor<[number], Box<number>>, PlainCtor<[number], Box<number>>>;
  // @ts-expect-no-error
  isAssignable<PlainCtor<[number], Box<number>>, Ctor<[number], Box<number>>>;
  // @ts-expect-no-error
  isAssignable<AbstractCtor<[number], Box<number>>, PlainAbstractCtor<[number], Box<number>>>;
  // @ts-expect-no-error
  isAssignable<PlainAbstractCtor<[number], Box<number>>, AbstractCtor<[number], Box<number>>>;
}

/** A `$` in the arguments and the return makes one generic signature that links them. */
namespace placeholderFuncTest {
  declare const id: Func<[$], $>;

  // @ts-expect-no-error
  isAssignable<number>(id(1));
  // @ts-expect-no-error
  isAssignable<string>(id('a'));
  // @ts-expect-error
  isAssignable<string>(id(1));

  declare const pair: Func<[$, $], [$, $]>;

  // both slots are the one type parameter; a rebuilt tuple comes back readonly
  // @ts-expect-no-error
  isAssignable<readonly [number, number]>(pair(1, 2));
  // @ts-expect-error
  pair(1, 'a');
  // @ts-expect-error
  isAssignable<readonly [string, string]>(pair(1, 2));
}

/** `Constraint` bounds the type parameter; `any` (the default) leaves it free. */
namespace constraintTest {
  declare const bounded: Func<[$], $, string>;

  // @ts-expect-no-error
  isAssignable<string>(bounded('a'));
  // @ts-expect-error
  bounded(1);

  declare const free: Func<[$], $, any>;

  // @ts-expect-no-error
  free(1);
  // @ts-expect-no-error
  free('a');
}

/** The placeholder is found inside the containers the checker knows how to open. */
namespace nestedPlaceholderTest {
  declare const first: Func<[$[]], $>;
  // @ts-expect-no-error
  isAssignable<number>(first([1, 2]));

  declare const unwrap: Func<[Promise<$>], $>;
  // @ts-expect-no-error
  isAssignable<string>(unwrap(Promise.resolve('a')));

  declare const keys: Func<[Map<$, unknown>], Set<$>>;
  // @ts-expect-no-error
  isAssignable<Set<number>>(keys(new Map<number, string>()));

  declare const box: Func<[$], Box<$>>;
  // @ts-expect-no-error
  isAssignable<Box<boolean>>(box(true));
  // @ts-expect-error
  isAssignable<Box<string>>(box(true));

  // a placeholder inside a nested function type is lost: the inner signature
  // resolves to `Func<readonly [unknown], unknown>` rather than linking to `T`
  declare const apply: Func<[Func<[$], $>, $], $>;
  // @ts-expect-error
  isAssignable<number>(apply((n: number) => n + 1, 1)); // TODO known-wrong: the inner `$` becomes `unknown`
  // @ts-expect-no-error
  isAssignable<number>(apply((n: unknown) => n, 1));

  // a string literal is never mistaken for a placeholder
  declare const tagged: Func<[$], 'fixed'>;
  // @ts-expect-no-error
  isAssignable<'fixed'>(tagged(1));
}

/** The async and void specialisations keep the placeholder. */
namespace specialisationsTest {
  declare const later: AsyncFunc<[$], $>;
  // @ts-expect-no-error
  isAssignable<Promise<number>>(later(1));
  // @ts-expect-error
  isAssignable<Promise<string>>(later(1));

  declare const act: Action<[$]>;
  // @ts-expect-no-error
  isAssignable<void>(act(1));
  // @ts-expect-no-error
  isAssignable<void>(act('a'));

  declare const actLater: AsyncAction<[$]>;
  // @ts-expect-no-error
  isAssignable<Promise<void>>(actLater(1));

  // `Sub` is `Action` by another name, `AsyncSub` is `AsyncAction`
  // @ts-expect-no-error
  isAssignable<Sub<[number]>, Action<[number]>>;
  // @ts-expect-no-error
  isAssignable<Action<[number]>, Sub<[number]>>;
  // @ts-expect-no-error
  isAssignable<AsyncSub<[number]>, AsyncAction<[number]>>;
  // @ts-expect-no-error
  isAssignable<AsyncAction<[number]>, AsyncSub<[number]>>;
}

/** A `$` in a constructor makes a generic construct signature. */
namespace placeholderCtorTest {
  declare const Boxed: Ctor<[$], Box<$>>;

  // @ts-expect-no-error
  isAssignable<Box<number>>(new Boxed(1));
  // @ts-expect-error
  isAssignable<Box<string>>(new Boxed(1));
  // the prototype cannot name the parameter, so it is the `any` instantiation
  // @ts-expect-no-error
  isAssignable<Box<any>>(Boxed.prototype);

  declare const Constrained: Ctor<[$], Box<$>, number>;

  // @ts-expect-no-error
  new Constrained(1);
  // @ts-expect-error
  new Constrained('a');

  class GenericBox<T> {
    constructor(public value: T) {}
  }

  // @ts-expect-no-error
  isAssignable<typeof GenericBox, Ctor<[$], Box<$>>>;
  // @ts-expect-no-error
  isAssignable<typeof GenericBox, AbstractCtor<[$], Box<$>>>;
}

namespace placeholderAbstractCtorTest {
  abstract class GenericBox<T> {
    constructor(public value: T) {}
  }

  // @ts-expect-no-error
  isAssignable<typeof GenericBox, AbstractCtor<[$], Box<$>>>;
  // abstract is not concrete
  // @ts-expect-error
  isAssignable<typeof GenericBox, Ctor<[$], Box<$>>>;

  declare const Constrained: AbstractCtor<[$], Box<$>, number>;

  // @ts-expect-no-error
  isAssignable<Box<any>>(Constrained.prototype);
  // @ts-expect-error
  new Constrained(1);
}
