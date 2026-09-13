// Type-level probes for WeakValuedMap: the value type is what the map can hold weakly, and the
// map's own views come back with the iterator helpers attached.

import { WeakValuedMap } from './WeakValuedMap';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// Only a WeakKey can sit behind a WeakRef, so the value type is bounded by it.
namespace valueMustBeWeaklyHoldableTest {
  // @ts-expect-no-error
  new WeakValuedMap<string, object>();
  // @ts-expect-no-error
  new WeakValuedMap<string, WeakKey>();
  // @ts-expect-error - a number cannot be held weakly
  new WeakValuedMap<string, number>();
  // @ts-expect-error - a string cannot be held weakly
  new WeakValuedMap<string, string>();
}

// The constructor seeds from an iterable of entries, typed like Map's -- an explicit `undefined`
// is not, matching Map, since neither overload face takes it.
namespace constructorAcceptsEntriesTest {
  // @ts-expect-no-error
  new WeakValuedMap<string, object>();
  // @ts-expect-no-error
  new WeakValuedMap<string, object>(null);
  // @ts-expect-no-error
  new WeakValuedMap<string, object>([['a', {}]]);
  // @ts-expect-error - an entry's value has to be the map's V
  new WeakValuedMap<string, object>([['a', 1]]);
  // @ts-expect-error - neither overload face takes an explicit undefined
  new WeakValuedMap<string, object>(undefined);
}

// Keys are held strongly, so anything at all can be one.
// The weak mechanics stay behind the Map contract, so the map goes anywhere a Map is expected.
namespace isAMapTest {
  // @ts-expect-no-error
  isAssignable<WeakValuedMap<string, object>, Map<string, object>>;
  // @ts-expect-error - the value type is the map's, not any Map's
  isAssignable<WeakValuedMap<string, object>, Map<string, number>>;
}

namespace keyIsUnboundedTest {
  // @ts-expect-no-error
  new WeakValuedMap<number, object>();
  // @ts-expect-no-error
  new WeakValuedMap<string | undefined, object>();
}

// `set` answers the map so calls chain and a subclass keeps its own type.
namespace setAnswersThisTest {
  declare const map: WeakValuedMap<string, object>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.set>, WeakValuedMap<string, object>>;

  class Tagged extends WeakValuedMap<string, object> {
    tag = 'tagged';
  }
  declare const tagged: Tagged;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof tagged.set>, Tagged>;
}

// Every view is a MapIterator, so the ES2025 helpers are on it.
namespace viewsCarryTheIteratorHelpersTest {
  declare const map: WeakValuedMap<string, { n: number; }>;

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
  declare const map: WeakValuedMap<string, { n: number; }>;

  map.forEach((value, key, self) => {
    // @ts-expect-no-error
    isAssignable<typeof value, { n: number; }>;
    // @ts-expect-no-error
    isAssignable<typeof key, string>;
    // @ts-expect-no-error
    isAssignable<typeof self, WeakValuedMap<string, { n: number; }>>;
  });
}
