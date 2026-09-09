import type { AssertNeverError } from '@rhombus-toolkit/types';
const Ξ: unique symbol = Symbol('⚡');
type mark<T extends object> = T & { readonly [Ξ]: true; };
function mark<T extends object>(target: T): mark<T> {
  Reflect.defineProperty(target, Ξ, { configurable: false, enumerable: false, writable: false, value: true });
  return target as any;
}

/** Wraps a value into a marked tuple: nullish becomes `[]`, anything else a one-element tuple; arrays pass through unmarked. */
export type restify<Œ> = Œ extends void | null | undefined ? mark<[]> : Œ extends any[] ? Œ : mark<[Œ]>;

export function restify<Ø>(arg: Ø): restify<Ø>;
export function restify(arg: any) {
  if (arg === undefined) {
    return mark([]);
  }
  if (Array.isArray(arg)) {
    return arg;
  }
  return mark([arg]);
}

/** Reverses {@link restify}: unwraps a marked tuple to its element, empty to `void`, unmarked arrays pass through. */
export type unrestify<Ω extends any[]> = Ω extends mark<infer Δ>
  ? (Δ extends [infer φ] ? φ : Δ extends [] ? void : Δ extends any[] ? Δ // InvalidTypeArg<`unrestify<T>`, [T: Ω, U: Δ], `Encountered a plain ol' array where a tuple should be specified. Somewhere along the way this type has beed widened and the type information lost.` >
  : AssertNeverError<`unrestify<T>`, [T: Ω],
    `The 'Ξ' marker should only be dropped on arrays, and I'm pretty sure that I've already exhaustively checked for that. How the hell did you land here?`>)
  : Ω;

export function unrestify<Ħ extends any[]>(arg: Ħ): unrestify<Ħ>;
export function unrestify(arg: any) {
  if (!arg[Ξ]) {
    return arg;
  }
  if (!Array.isArray(arg)) {
    throw new TypeError('Value must be an array');
  }
  switch (arg.length) {
    case 0:
      return;
    case 1:
      return arg[0];
    default:
      return [...arg]; // clear the marker symbol
  }
}
