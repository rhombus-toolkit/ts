/**
 * @deprecated Use an intersection instead — e.g. `string & T` in place of `Cast<T, string>`.
 */
export type Cast<V, T> = V extends T ? V : T;
