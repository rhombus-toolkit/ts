import { Length, PartialList, Skip } from './array';
import { Inc } from './counter';
import { Func } from './func';

type _CurryBasic<TArgs extends any[], TReturn> = <T extends PartialList<TArgs>>(
  ...args: T
) => Skip<Length<T>, TArgs> extends [] ? TReturn : _CurryBasic<Skip<Length<T>, TArgs>, TReturn>;

type CurryBasic<TFn extends Func<any[], any>> = _CurryBasic<Parameters<TFn>, ReturnType<TFn>>;

/**
 * The gap marker, structurally.
 *
 * @remarks
 * The compat target is Ramda, whose
 * `R.__` is the object `{'@@functional/placeholder': true}`. It was a local
 * `unique symbol` here, which no Ramda placeholder is ever assignable to — so
 * the compat claim could not be met by construction. Matching the shape is the
 * whole fix; nothing needs to import this to use it, because Ramda's own `__`
 * already has it.
 */
interface Placeholder {
  readonly '@@functional/placeholder': true;
}

type __ = Placeholder;

type GapOf<TProvided extends any[], TTarget extends any[], TGapped extends any[], i extends number> =
  TProvided[i] extends __ ? [...TGapped, TTarget[i]] : TGapped;
type GapsOf<TProvided extends any[], TTarget extends any[], TGapped extends any[] = [], i extends number = 0> =
  i extends Length<TProvided> ? [...TGapped, ...Skip<i, TTarget>]
    : GapsOf<TProvided, TTarget, GapOf<TProvided, TTarget, TGapped, i>, Inc<i>>;

type PartialGaps<T extends any[]> = T extends [infer X, ...infer Y] ? [X | __, ...PartialGaps<Y>] : [];
type Gaps<T extends any[]> = PartialList<PartialGaps<T>>;
type _CurryWithGaps<TArgs extends any[], TReturn> = <T extends Gaps<TArgs>>(
  ...args: T
) => GapsOf<T, TArgs> extends [any, ...any[]] ? _CurryWithGaps<GapsOf<T, TArgs>, TReturn> : TReturn;
type CurryWithGaps<F extends Func<any[], any>> = _CurryWithGaps<Parameters<F>, ReturnType<F>>;

/**
 * `T` as a curried function: call it with any prefix of its arguments and get
 * back something expecting the rest, until the last one arrives.
 *
 * @remarks
 * Gaps are supported — pass a {@link Placeholder} (Ramda's `R.__`) in an
 * argument position to defer just that one.
 */
export type Curry<T extends Func<any[], any>> = CurryWithGaps<T>;
