import { MultiKeyWeakMap } from '@rhombus-toolkit/collections';
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
  const answers = new MultiKeyWeakMap<Keys, Value>();

  return function memoized(...keys: Keys): Value {
    return answers.getOrInsertComputed(keys, () => compute(...keys));
  };
}
