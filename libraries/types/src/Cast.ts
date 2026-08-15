/**
 * Constrain `V` to `T`, falling back to `T` when `V` does not satisfy it.
 *
 * @remarks
 * The fallback should be unreachable — if it can fire, you want a different
 * fallback type. Its job is to state a shape the checker cannot evaluate while
 * the inputs are still parameters: `Cast<SplitArray<T, N>[0], any[]>` promises
 * array-ness to a bound that would otherwise reject the deferred type, and the
 * true arm redeems that promise on every concrete instantiation.
 *
 * `Cast<V, T>` and `V & T` differ only where `V` is not assignable to `T`:
 *
 * ```ts
 * Cast<number, string>   // -> string   discards V, hands back something usable
 * number & string        // -> never    lossless, but uninhabitable
 * ```
 */
export type Cast<V, T> = V extends T ? V : T;
