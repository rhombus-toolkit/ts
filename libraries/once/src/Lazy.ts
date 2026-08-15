import type { Func } from '@rhombus-toolkit/types';

/**
 * Defers a value's construction until first access, then memoizes it.
 *
 * A `#created` flag (rather than checking the stored value for truthiness)
 * makes this correct for every value a factory can produce -- a naive
 * `if (!this.#instance)` guard re-invokes the factory on every access when
 * the value is falsy (`0`, `''`, `false`, `null`), and even `??=` still
 * re-runs for a factory that legitimately returns `null`/`undefined`.
 */
export class Lazy<T> {
  #factory: Func<[], T>;
  #instance?: T;
  #created = false;

  constructor(factory: Func<[], T>) {
    this.#factory = factory;
  }

  get value(): T {
    if (!this.#created) {
      this.#instance = this.#factory();
      this.#created = true;
    }
    return this.#instance as T;
  }
}
