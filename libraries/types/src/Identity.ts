/**
 * The type-level identity: `Identity<T>` is `T`.
 *
 * @remarks
 * Useful as the neutral argument to something that takes a type operator, and
 * as a hover/error-message anchor. This is the identity *on types* — it is not
 * the signature of an `identity` function, which is `Func<[T], T>`.
 */
export type Identity<T> = T;
