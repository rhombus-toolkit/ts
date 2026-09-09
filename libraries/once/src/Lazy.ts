import type { Func } from '@rhombus-toolkit/types';

/**
 * Defers a value's construction until first access, then memoizes it.
 */
export class Lazy<T> {
  #factory: Func<[], T>;
  #instance?: T;
  // Tracks whether the factory has run, since a truthiness check on `#instance` would
  // re-invoke it for any falsy or nullish result the factory legitimately returns.
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
