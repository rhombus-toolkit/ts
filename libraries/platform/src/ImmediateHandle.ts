// Owned `setImmediate`/`clearImmediate` typing (like ./abort.ts): typed
// re-exports off `globalThis`, no polyfill import, no global mutation --
// unlike the package this absorbs (`@rhombus-toolkit/set-immediate`), which
// deleted `globalThis.setImmediate`/`clearImmediate` after capturing them, a
// hostile side effect that made its own `sideEffects: false` a lie.
//
// One real divergence from every other global this package wraps:
// `setImmediate` is deliberately Node/bun-only and does not exist in
// browsers. That is why the absorbed package pulled the 2014-era
// `setimmediate` npm polyfill. This package does not: `globalThis` here is
// only ever a typed lookup, never a source of runtime behavior, so adding a
// `MessageChannel`-based fallback would mean actually implementing scheduling
// logic rather than typing an existing global -- out of scope for what this
// package is. A browser consumer sees `setImmediate`/`clearImmediate` as
// `undefined` at runtime; document that plainly rather than pretend the
// global is universal.
//
// `ImmediateHandle` is opaque (`unknown`) for the same reason `TimeoutHandle`
// is: Node's real return value is an `Immediate` object, not the `number` the
// absorbed package's types claimed, and it only ever round-trips through our
// own `clearImmediate`.

import { Func } from '@rhombus-toolkit/types';

export type ImmediateHandle = unknown;

interface SetImmediateLike {
  <Args extends readonly unknown[]>(callback: Func<Args, void>, ...args: Args): ImmediateHandle;
}
interface ClearImmediateLike {
  (handle: ImmediateHandle): void;
}

/** The platform `setImmediate`, re-typed with an opaque handle. Node/bun-only -- `undefined` in browsers. */
export const setImmediate: SetImmediateLike =
  (globalThis as unknown as { setImmediate: SetImmediateLike; }).setImmediate;

/** The platform `clearImmediate`, accepting {@link ImmediateHandle}. Node/bun-only -- `undefined` in browsers. */
export const clearImmediate: ClearImmediateLike =
  (globalThis as unknown as { clearImmediate: ClearImmediateLike; }).clearImmediate;
