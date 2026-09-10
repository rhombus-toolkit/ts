import { Cast } from './Cast';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/** `V` survives untouched when it already satisfies `T`. */
namespace satisfiedTest {
  // @ts-expect-no-error
  isAssignable<Cast<1, number>, 1>;
  // @ts-expect-no-error
  isAssignable<1, Cast<1, number>>;
  // @ts-expect-no-error
  isAssignable<Cast<'a', string>, 'a'>;
  // @ts-expect-no-error
  isAssignable<Cast<[1, 2], any[]>, [1, 2]>;
}

/** The fallback is `T` itself -- usable, unlike the `never` an intersection would give. */
namespace fallbackTest {
  // @ts-expect-no-error
  isAssignable<Cast<number, string>, string>;
  // @ts-expect-no-error
  isAssignable<string, Cast<number, string>>;

  // `V` is discarded, not intersected
  // @ts-expect-error
  isAssignable<Cast<number, string>, number>;
  // @ts-expect-no-error
  isAssignable<number & string, never>;
}

/** Distributes over a union: each member is cast on its own. */
namespace unionTest {
  // the satisfying member survives, the other becomes `T`, and the two collapse
  // @ts-expect-no-error
  isAssignable<Cast<1 | 'a', number>, number>;
  // @ts-expect-no-error
  isAssignable<number, Cast<1 | 'a', number>>;
  // @ts-expect-error
  isAssignable<'a', Cast<1 | 'a', number>>;

  // nothing in, nothing out
  // @ts-expect-no-error
  isAssignable<Cast<never, string>, never>;
}
