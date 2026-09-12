// Type-level probes for KindaWeakMap: defaults are unbounded, a primitive key is accepted, and
// get/set/getOrInsertComputed carry the map's own K and V.

import { KindaWeakMap } from './KindaWeakMap';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace defaultsAreUnknownTest {
  const map = new KindaWeakMap();

  // @ts-expect-no-error
  map.set({}, 1);
  // @ts-expect-no-error
  map.set('k', 'v');
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.get>, unknown>;
}

namespace primitiveKeyIsAcceptedTest {
  // @ts-expect-no-error
  new KindaWeakMap<string, number>();
  // @ts-expect-no-error
  new KindaWeakMap<number, number>();
}

namespace getReturnsValueOrUndefinedTest {
  declare const map: KindaWeakMap<string, { n: number; }>;

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof map.get>, { n: number; } | undefined>;
}

namespace setRejectsAWrongValueTypeTest {
  declare const map: KindaWeakMap<string, number>;

  // @ts-expect-no-error
  map.set('k', 1);
  // @ts-expect-error - the value type is the map's
  map.set('k', 'not a number');
}

namespace computeReceivesTheKeyTest {
  declare const map: KindaWeakMap<string, number>;

  // @ts-expect-no-error
  map.getOrInsertComputed('k', (key: string) => key.length);
  // @ts-expect-error - compute answers with the map's value type
  map.getOrInsertComputed('k', (key: string): string => key);
}
