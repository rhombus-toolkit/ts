// Type-level probes for KindaWeakMap: the value type is what the map can hold weakly, and the
// map's own views come back with the iterator helpers attached.

import { KindaWeakMap } from './KindaWeakMap';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// Only a WeakKey can sit behind a WeakRef, so the value type is bounded by it.
namespace valueMustBeWeaklyHoldableTest {
  // @ts-expect-no-error
  new KindaWeakMap<string, object>();
  // @ts-expect-no-error
  new KindaWeakMap<string, WeakKey>();
  // @ts-expect-error - a number cannot be held weakly
  new KindaWeakMap<string, number>();
  // @ts-expect-error - a string cannot be held weakly
  new KindaWeakMap<string, string>();
}

// Keys are held strongly, so anything at all can be one.
namespace keyIsUnboundedTest {
  // @ts-expect-no-error
  new KindaWeakMap<number, object>();
  // @ts-expect-no-error
  new KindaWeakMap<string | undefined, object>();
}

// `set` answers the map so calls chain and a subclass keeps its own type.
namespace setAnswersThisTest {
  declare const map: KindaWeakMap<string, object>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.set>, KindaWeakMap<string, object>>;

  class Tagged extends KindaWeakMap<string, object> {
    tag = 'tagged';
  }
  declare const tagged: Tagged;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof tagged.set>, Tagged>;
}

// Every view is a MapIterator, so the ES2025 helpers are on it.
namespace viewsCarryTheIteratorHelpersTest {
  declare const map: KindaWeakMap<string, { n: number; }>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.entries>, MapIterator<[string, { n: number; }]>>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.keys>, MapIterator<string>>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.values>, MapIterator<{ n: number; }>>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map[typeof Symbol.iterator]>, MapIterator<[string, { n: number; }]>>;
  // @ts-expect-no-error
  isAssignable<ReturnType<ReturnType<typeof map.values>['map']>, IteratorObject<unknown>>;
}

// forEach hands the callback the value first, then the key, then the map.
namespace forEachArgumentOrderTest {
  declare const map: KindaWeakMap<string, { n: number; }>;

  map.forEach((value, key, self) => {
    // @ts-expect-no-error
    isAssignable<typeof value, { n: number; }>;
    // @ts-expect-no-error
    isAssignable<typeof key, string>;
    // @ts-expect-no-error
    isAssignable<typeof self, KindaWeakMap<string, { n: number; }>>;
  });
}
