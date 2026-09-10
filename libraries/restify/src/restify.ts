const Ξ: unique symbol = Symbol('⚡');
/** Phantom carrier of the marked tuple's own type, so {@link restify} can hand the plain tuple back; never present at runtime. */
declare const Λ: unique symbol;
type mark<T extends any[]> = T & { readonly [Ξ]: true; readonly [Λ]?: T; };
function mark<T extends any[]>(target: T): mark<T> {
  Reflect.defineProperty(target, Ξ, { configurable: false, enumerable: false, writable: false, value: true });
  return target as any;
}

/** Turns a rest-args tuple into a payload: none is `void`, one is that argument itself (an array included), several is the tuple, marked so {@link restify} can tell it from one array argument. */
export type unrestify<Ω extends any[]> = Ω extends [] ? void : Ω extends [infer φ] ? φ : mark<Ω>;

export function unrestify<Ħ extends any[]>(args: Ħ): unrestify<Ħ>;
export function unrestify(args: any) {
  if (!Array.isArray(args)) {
    throw new TypeError('Value must be an array');
  }
  switch (args.length) {
    case 0:
      return;
    case 1:
      return args[0];
    default:
      return mark(args.slice()); // slice, not spread: a hole stays a hole
  }
}

/** Turns a payload back into its rest-args tuple: `undefined` is `[]`, a tuple {@link unrestify} marked is itself, anything else (an array included) is one argument. */
export type restify<Œ> = Œ extends { readonly [Ξ]: true; readonly [Λ]?: infer Δ extends any[]; } ? Δ
  : Œ extends void | undefined ? []
  : [Œ];

export function restify<Ø>(payload: Ø): restify<Ø>;
export function restify(payload: any) {
  if (payload?.[Ξ]) {
    return payload;
  }
  if (payload === undefined) {
    return [];
  }
  return [payload];
}
