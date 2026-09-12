// Type-level probes for MultiKeyWeakMap: it is a WeakMap whose key is the tuple, the tuple
// is exact, and a key in it can be any value -- weakly holdable or not.

import { MultiKeyWeakMap } from './MultiKeyWeakMap';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace isAWeakMapOfTheTupleTest {
  // @ts-expect-no-error
  isAssignable<MultiKeyWeakMap<[{ id: number; }, object], string>, WeakMap<[{ id: number; }, object], string>>;
  // @ts-expect-no-error
  isAssignable<MultiKeyWeakMap<readonly [object], string>, WeakMap<readonly [object], string>>;
  // @ts-expect-error - the value type is the map's, not any WeakMap's
  isAssignable<MultiKeyWeakMap<[object], string>, WeakMap<[object], number>>;
}

namespace keysNeedNotBeWeaklyHoldableTest {
  // @ts-expect-no-error
  new MultiKeyWeakMap<[object, { id: number; }], string>();
  // @ts-expect-no-error - a number keys the strong fallback, not a WeakMap
  new MultiKeyWeakMap<[number], string>();
  // @ts-expect-no-error - a tuple may mix weakly holdable and primitive keys
  new MultiKeyWeakMap<[object, string], string>();
}

namespace tupleIsKeptExactTest {
  const map = new MultiKeyWeakMap<[{ id: number; }, object], string>();

  // @ts-expect-no-error
  map.set([{ id: 1 }, {}], 'a');
  // @ts-expect-error - the second key cannot be dropped
  map.get([{ id: 1 }]);
  // @ts-expect-error - a third key is not part of the tuple
  map.get([{ id: 1 }, {}, {}]);
  // @ts-expect-error - the first key's shape is the tuple's, not a loose WeakKey
  map.get([{}, {}]);
  // @ts-expect-error - the value is the map's
  map.set([{ id: 1 }, {}], 1);
}

namespace defaultsAdmitAnyLengthTest {
  const map = new MultiKeyWeakMap();

  // @ts-expect-no-error
  map.set([], 1);
  // @ts-expect-no-error
  map.set([{}], 'one');
  // @ts-expect-no-error
  map.set([{}, {}], { two: true });
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.get>, unknown>;
}

namespace computeReceivesTheTupleTest {
  const map = new MultiKeyWeakMap<[{ id: number; }, { name: string; }], string>();

  // @ts-expect-no-error
  map.getOrInsertComputed([{ id: 1 }, { name: 'a' }], ([first, second]) => first.id + second.name);
  // @ts-expect-error - compute answers with the map's value type
  map.getOrInsertComputed([{ id: 1 }, { name: 'a' }], ([first]) => first.id);
}
