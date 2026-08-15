/**
 * Every value JavaScript treats as false in a boolean position.
 *
 * @remarks
 * `false` and `0n` are members. Leaving them out is not a rounding error: it
 * made `Truthy<boolean>` come back as `boolean`, so everything built on top
 * encoded a wrong answer for the most common type there is.
 *
 * `NaN` has no type-level spelling, so it cannot be a member — a `number` is
 * always truthy here, even where the value would not be.
 */
export type Falsy = null | undefined | false | '' | 0 | 0n;

/** `T` without its falsy members. `Truthy<boolean>` is `true`; `Truthy<0 | 1>` is `1`. */
export type Truthy<T> = Exclude<T, Falsy>;

/**
 * Selects `Then` when `T` is falsy, `Else` otherwise.
 *
 * @remarks
 * An `If`, not an `Is` — it picks a branch. Distributes over a union, so
 * `IfFalsy<0 | 1>` is `boolean` rather than a single answer; wrap the argument
 * in a tuple at the call site if that is not what you want.
 */
export type IfFalsy<T, Then = true, Else = false> = T extends Falsy ? Then : Else;

/** The mirror of {@link IfFalsy}: selects `Then` when `T` is truthy. */
export type IfTruthy<T, Then = true, Else = false> = T extends Falsy ? Else : Then;

/** The boolean-valued form of {@link IfFalsy}. */
export type IsFalsy<T> = IfFalsy<T>;

/** The boolean-valued form of {@link IfTruthy}. */
export type IsTruthy<T> = IfTruthy<T>;
