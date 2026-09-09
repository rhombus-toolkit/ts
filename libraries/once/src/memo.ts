import type { Func } from '@rhombus-toolkit/types';

/**
 * `compute` with its answers remembered — one call per distinct key tuple.
 *
 * @remarks
 * Keys are held weakly, so an unreachable key takes its answer with it. A call
 * that throws stores nothing, so the next ask recomputes.
 */
export function memo<Keys extends readonly [WeakKey, ...WeakKey[]], Value>(
  compute: Func<Keys, Value>,
): Func<Keys, Value> {
  // With one key the map holds answers; with more it holds the memo for the rest,
  // so `memoized(a, b)` is `memo(a => memo(b => …))(a)(b)` folded here.
  const answers = new WeakMap<WeakKey, unknown>();

  return function memoized(...keys: Keys): Value {
    const [key, ...rest] = keys;
    const existing = answers.get(key);

    // `has` makes a stored `undefined` a hit rather than a recompute.
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
