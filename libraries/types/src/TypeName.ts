/**
 * What `typeof` would say about a value of type `T`.
 *
 * @remarks
 * `symbol` and `bigint` are real arms, not omissions — without them both fell
 * through to `'object'`, which is the one answer `typeof` never gives for
 * either. `null` does fall through on purpose: `typeof null === 'object'`.
 *
 * A union distributes, so `TypeName<string | number>` is `'string' | 'number'`.
 */
export type TypeName<T> = T extends string ? 'string'
  : T extends number ? 'number' : T extends bigint ? 'bigint' : T extends boolean ? 'boolean'
  : T extends symbol ? 'symbol'
  : T extends undefined ? 'undefined'
  // `Function` and not `Func<any[], any>`: a class constructor is `typeof
  // 'function'` at runtime but is not assignable to a call signature.
  : T extends Function ? 'function'
  : 'object';
