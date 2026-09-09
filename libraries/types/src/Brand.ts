/**
 * Brand `Type` with a phantom `Scope` so it is no longer assignable *from* the bare underlying
 * type — a `Brand<string, 'UserId'>` still assigns to `string`, but not the reverse.
 *
 * @remarks
 * The `'⛔'` key is a marker, not a lock: a computed string-literal key is nameable from
 * anywhere, so `x as string & { readonly ['⛔']: 'UserId' }` gets past it.
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
