import { Length, Skip, Tail } from './array';
import { Cast } from './cast';

type CounterArray = any[];
type Next<I extends CounterArray> = [never, ...I];

type Prev<I extends CounterArray> = Tail<I>;

type ExpandArrayToLength<counter extends CounterArray, length extends number> = Length<counter> extends length ? counter
  : ExpandArrayToLength<[never, ...counter], length>;

// type _Counter<length extends number, counter extends CounterArray = []> =
//     Length<counter> extends length ? counter :
//     _Counter<length, Next<counter>>;

type _Counter<length extends number> = length extends 0 ? []
  : length extends 1 ? [never] : ExpandArrayToLength<[], length>;
type Counter<length extends number> = Cast<_Counter<length>, CounterArray>;

export type Store<value extends number> = Counter<value>;
export type Inc<N extends number> = Length<Next<Counter<N>>>;
export type Dec<N extends number> = Length<Prev<Counter<N>>>;

export type Add<X extends number, Y extends number> = Length<[...Counter<X>, ...Counter<Y>]>;

/**
 * `X - Y`, clamped at zero.
 *
 * @remarks
 * Peels a cell from each side rather than routing through {@link Skip}. Going
 * through `Skip` relates its deferred result against `Length`'s `T extends any[]`
 * bound across `Counter<X>`'s unbounded recursion, which fails at this
 * declaration with "Excessive stack depth" the moment this file is type-checked
 * rather than skipped as an ambient declaration.
 *
 * Clamping is not a choice: a tuple has no negative length, so the subtrahend
 * running out first is the only representable answer.
 */
export type Subtract<X extends number, Y extends number> = Length<_Subtract<Counter<X>, Counter<Y>>>;
type _Subtract<X extends CounterArray, Y extends CounterArray> = Y extends [any, ...infer YRest]
  ? X extends [any, ...infer XRest] ? _Subtract<XRest, YRest> : []
  : X;

export type Multiply<X extends number, Y extends number> = Length<_Mult<_Counter<X>, _Counter<Y>, []>>;
type _Mult<X extends any[], Y extends any[], R extends any[]> = Length<Y> extends 0 ? R
  : _Mult<X, Prev<Y>, [...R, ...X]>;
