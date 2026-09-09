import type { Func } from '@rhombus-toolkit/types';

/**
 * `compute` with its answers remembered — one call per distinct key tuple, every
 * later ask served from the cache.
 *
 * @remarks
 * The cache is reachable only from the returned function, so nothing else can
 * write a fact about a key that the walk over that key did not derive. Keys are
 * held weakly: one that becomes unreachable takes its answer with it. A call
 * that throws stores nothing, so the next ask recomputes.
 *
 * Several keys nest: the cache for the first key holds, per key, the memo of the
 * remaining ones, so `memoized(a, b)` is `memo(a => memo(b => …))(a)(b)` with the
 * folding done here. An entry dies with its own key, so dropping `a` frees every
 * answer keyed under it.
 *
 * The `has` check is what makes a stored `undefined` a hit rather than a miss —
 * testing the retrieved value alone would recompute forever for a `compute`
 * that legitimately answers `undefined`.
 */
export function memo<Keys extends readonly [WeakKey, ...WeakKey[]], Value>(
  compute: Func<Keys, Value>,
): Func<Keys, Value> {
  // With one key the map holds answers; with more it holds the next layer's memo.
  // Every ask carries the same number of keys, so the two never mix in one map.
  const answers = new WeakMap<WeakKey, unknown>();

  return function memoized(...keys: Keys): Value {
    const [key, ...rest] = keys;
    const existing = answers.get(key);

    if (existing !== undefined || answers.has(key)) {
      return rest.length ? (existing as Func<readonly WeakKey[], Value>)(...rest) : existing as Value;
    }

    if (!rest.length) {
      const created = compute(...keys);
      answers.set(key, created);
      return created;
    }

    // `Keys` is one exact tuple, so a layer's `(key, ...more)` cannot be proved to spell it.
    // The public signature keeps callers exact; this call is deliberately the one loose spot.
    const inner = memo((...more: [WeakKey, ...WeakKey[]]) =>
      (compute as Func<readonly WeakKey[], Value>)(key, ...more)
    );
    answers.set(key, inner);
    return inner(...(rest as [WeakKey, ...WeakKey[]]));
  };
}
