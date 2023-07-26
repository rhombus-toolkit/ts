export type Falsy = null | undefined | '' | 0;
export type Truthy<T> = Exclude<T, Falsy>;

export type isFalsy<T, TruePart = true, FalsePart = false> =
  T extends Falsy ? TruePart : FalsePart;


export type isTruthy<T, TruePart = true, FalsePart = false> =
  T extends Truthy<T> ? TruePart : FalsePart;
