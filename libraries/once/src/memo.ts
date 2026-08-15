import type { Func } from '@rhombus-toolkit/types';

/**
 * `compute` with its answers remembered — one call per distinct key, every later
 * ask served from the cache.
 *
 * @remarks
 * The cache is reachable only from the returned function, so nothing else can
 * write a fact about a key that the walk over that key did not derive. Keys are
 * held weakly: one that becomes unreachable takes its answer with it. A call
 * that throws stores nothing, so the next ask recomputes.
 *
 * The `has` check is what makes a stored `undefined` a hit rather than a miss —
 * testing the retrieved value alone would recompute forever for a `compute`
 * that legitimately answers `undefined`.
 */
export function memo<Key extends WeakKey, Value>(compute: Func<[key: Key], Value>): Func<[key: Key], Value> {
  const answers = new WeakMap<Key, Value>();

  return function memoized(key: Key): Value {
    const existing = answers.get(key);

    if (existing !== undefined || answers.has(key)) {
      return existing as Value;
    }

    const created = compute(key);
    answers.set(key, created);
    return created;
  };
}
