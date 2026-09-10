// Type-level probes for Singleton: the wrapper is typed as the class it wraps, so construction
// arguments, instance members and statics all read through unchanged.

import { Singleton } from './Singleton';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

class Animal {
  static kingdom = 'animalia';
  constructor(public name = 'animal') {}
}

namespace wrapperIsTheWrappedClassTest {
  const S = Singleton(Animal);

  // @ts-expect-no-error
  isAssignable<typeof S, typeof Animal>;
  // @ts-expect-no-error
  isAssignable<InstanceType<typeof S>, Animal>;
  // @ts-expect-no-error
  isAssignable<typeof S.kingdom, string>;
}

namespace constructionArgumentsAreCheckedTest {
  const S = Singleton(Animal);

  // @ts-expect-no-error
  new S();
  // @ts-expect-no-error
  new S('rex');
  // @ts-expect-error - the wrapped constructor takes a string
  new S(1);
}

namespace weakIsABooleanTest {
  // @ts-expect-no-error
  Singleton(Animal, true);
  // @ts-expect-error - the flag is a boolean, not a mode name
  Singleton(Animal, 'weak');
}

namespace onlyAConcreteClassCanBeWrappedTest {
  abstract class Shape {
    abstract area(): number;
  }

  // @ts-expect-error - an abstract class cannot be constructed, so it cannot be a singleton
  Singleton(Shape);
}
