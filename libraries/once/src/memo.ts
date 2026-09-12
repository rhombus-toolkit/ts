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
): Func<Keys, Value>;
/**
 * `compute` with its answers remembered — one call per distinct tuple `selectKeys` picks from the arguments.
 *
 * @remarks
 * A picked key that a `WeakMap` can hold is held weakly; any other lives as long as the memo.
 */
export function memo<Args extends readonly unknown[], Value>(compute: Func<Args, Value>,
  selectKeys: Func<Args, readonly unknown[]>): Func<Args, Value>;
export function memo<Args extends readonly unknown[], Value>(compute: Func<Args, Value>,
  selectKeys: Func<Args, readonly unknown[]> = (...args) => args): Func<Args, Value>
{
  const answers = new MultiKeyWeakMap<readonly unknown[], Value>();

  return function memoized(...args: Args): Value {
    return answers.getOrInsertComputed(selectKeys(...args), () => compute(...args));
  };
}
