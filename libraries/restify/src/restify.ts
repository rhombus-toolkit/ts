const Ξ: unique symbol = Symbol('⚡');
/** The marker is optional in the type, `Flavor`-style, so a plain tuple assigns to a marked one and callers never see it. */
type mark<T extends any[]> = T & {
  readonly [Ξ]?: true;
};
/** Marks `target` in place; marking twice is one mark. */
function mark<T extends any[]>(target: T): mark<T> {
  if (!(target as any)[Ξ]) {
    Reflect.defineProperty(target, Ξ, { configurable: true, enumerable: false, writable: false, value: true });
  }
  return target as any;
}
/** Removes the mark in place; unmarking an unmarked array is a no-op. */
function unmark<T extends any[]>(target: mark<T> | T): T {
  Reflect.deleteProperty(target, Ξ);
  return target;
}

/** Turns a rest-args tuple into a payload: none is `void`, one is that argument itself (an array included), several is the tuple itself, marked in place so {@link restify} can tell it from one array argument. */
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
      return mark(args);
  }
}

/** Turns a payload back into its rest-args tuple: `undefined` is `[]`, a tuple {@link unrestify} marked is itself with the mark removed, anything else (an array included) is one argument. Not idempotent: a payload restifies once, after which its tuple reads as one argument. */
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
