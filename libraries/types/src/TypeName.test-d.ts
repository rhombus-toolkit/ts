import { Func } from './func';
import { TypeName } from './TypeName';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace primitivesTest {
  // @ts-expect-no-error
  isAssignable<TypeName<'a'>, 'string'>;
  // @ts-expect-no-error
  isAssignable<TypeName<1>, 'number'>;
  // @ts-expect-no-error
  isAssignable<TypeName<true>, 'boolean'>;
  // @ts-expect-no-error
  isAssignable<TypeName<undefined>, 'undefined'>;
  // @ts-expect-no-error
  isAssignable<TypeName<Func<[], void>>, 'function'>;
  // @ts-expect-no-error
  isAssignable<TypeName<{ a: 1; }>, 'object'>;
}

/** The regression: neither arm existed, so both fell through to `'object'`. */
namespace symbolAndBigintTest {
  // @ts-expect-no-error
  isAssignable<TypeName<symbol>, 'symbol'>;
  // @ts-expect-no-error
  isAssignable<TypeName<bigint>, 'bigint'>;

  // the old broken behaviour
  // @ts-expect-error
  isAssignable<TypeName<symbol>, 'object'>;
  // @ts-expect-error
  isAssignable<TypeName<bigint>, 'object'>;
}

/** `typeof null === 'object'`, so falling through is the right answer here. */
namespace nullTest {
  // @ts-expect-no-error
  isAssignable<TypeName<null>, 'object'>;
}

namespace unionDistributesTest {
  // @ts-expect-no-error
  isAssignable<TypeName<string | number>, 'string' | 'number'>;
  // @ts-expect-no-error
  isAssignable<'string' | 'number', TypeName<string | number>>;
}

/** A class constructor is a `'function'` at runtime, though it carries no call signature. */
namespace constructorTest {
  class Thing {}

  // @ts-expect-no-error
  isAssignable<TypeName<typeof Thing>, 'function'>;
  // @ts-expect-error
  isAssignable<TypeName<typeof Thing>, 'object'>;
  // @ts-expect-error
  isAssignable<TypeName<Func<[], void>>, 'object'>;
}

/** Everything else structured is an `'object'`. */
namespace objectShapesTest {
  // @ts-expect-no-error
  isAssignable<TypeName<Date>, 'object'>;
  // @ts-expect-no-error
  isAssignable<TypeName<number[]>, 'object'>;
  // @ts-expect-no-error
  isAssignable<TypeName<object>, 'object'>;
  // @ts-expect-error
  isAssignable<TypeName<number[]>, 'array'>;
}
