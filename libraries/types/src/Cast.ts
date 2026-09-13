/**
 * Constrain `V` to `T`, falling back to `T` when `V` does not satisfy it.
 *
 * @remarks
 * Differs from `V & T` where `V` is not assignable to `T`:
 *
 * ```ts
 * Cast<number, string>   // -> string   discards V, yields something usable
 * number & string        // -> never    lossless, but uninhabitable
 * ```
 */
export type Cast<V, T> = V extends T ? V : T;
