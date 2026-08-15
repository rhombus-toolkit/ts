/**
 * Brand `Type` with a phantom `Scope` so it is no longer assignable from the
 * bare underlying type. An `Opaque<string, 'UserId'>` is still usable anywhere a
 * `string` is wanted, but a plain `string` (or an opaque of a different `Scope`)
 * is not assignable back to it.
 *
 * The brand key is the no-entry string `'⛔'` — emoji aren't valid identifiers,
 * so nothing outside this file can name the key to forge a value.
 */
export type Opaque<Type, Scope extends string | symbol> = Type & { readonly ['⛔']: Scope; };
