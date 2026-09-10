const Ξ: unique symbol = Symbol('⚡');
/** The marker is optional in the type, `Flavor`-style, so a plain tuple assigns to a marked one and callers never see it. */
type mark<T extends any[]> = T & {
  readonly [Ξ]?: true;
};
function mark<T extends any[]>(target: T): mark<T> {
  Reflect.defineProperty(target, Ξ, { configurable: false, enumerable: false, writable: false, value: true });
  return target as any;
}
/** An unmarked copy; slice, not spread, so a hole stays a hole. */
function unmark<T extends any[]>(target: mark<T>): T {
  return target.slice() as T;
}

/** Turns a rest-args tuple into a payload: none is `void`, one is that argument itself (an array included), several is a marked copy of the tuple so {@link restify} can tell it from one array argument. Never mutates `args`. */
export type unrestify<Ω extends any[]> = Ω extends [] ? void
  : Ω extends [infer φ] ? φ
  : mark<Ω>;

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

/** Turns a payload back into its rest-args tuple: `undefined` is `[]`, a tuple {@link unrestify} marked is an unmarked copy, anything else (an array included) is one argument. Never mutates `payload`, so the same action can be reduced again, and the mark never leaves the payload. */
export type restify<Œ> = typeof Ξ extends keyof Œ ? Œ
  : Œ extends void | undefined ? []
  : [Œ];

export function restify<Ø>(payload: Ø): restify<Ø>;
export function restify(payload: any) {
  if (payload?.[Ξ]) {
    return unmark(payload);
  }
  if (payload === undefined) {
    return [];
  }
  return [payload];
}
