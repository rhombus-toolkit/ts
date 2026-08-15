/**
 * Brand `Type` with a phantom `Scope` so it is no longer assignable *from* the
 * bare underlying type. A `Brand<string, 'UserId'>` is still usable anywhere a
 * `string` is wanted, but a plain `string` (or a brand of a different `Scope`)
 * is not assignable back to it.
 *
 * @remarks
 * The `'⛔'` key is a marker, not a lock. A string-literal computed key is
 * nameable from anywhere, so `x as string & { readonly ['⛔']: 'UserId' }`
 * assigns to `Brand<string, 'UserId'>` cleanly (verified) — the emoji only
 * blocks dot-access. Reach for a brand to catch an accidental mix-up, not to
 * defend against a caller who is trying to get around it.
 *
 * Genuine unforgeability would want an unexported `declare const brand: unique
 * symbol` as the key instead: it emits nothing and cannot be named from
 * outside, at the price of a brand that no longer survives being re-declared in
 * a separately rolled declaration bundle.
 */
export type Brand<Type, Scope extends string | symbol> = Type & { readonly ['⛔']: Scope; };

/**
 * {@link Brand} with the marker made optional: a `Flavor<string, 'UserId'>`
 * accepts a plain `string`, but not a `Flavor` of a different `Scope`.
 *
 * The looser half of the pair — reach for it when the goal is to catch two
 * flavours of the same primitive being crossed, without forcing every producer
 * of a value through a cast.
 */
export type Flavor<Type, Scope extends string | symbol> = Type & { readonly ['⛔']?: Scope; };
