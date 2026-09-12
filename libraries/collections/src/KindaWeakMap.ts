import type { Func } from '@rhombus-toolkit/types';

/** Whether a `WeakMap` can hold `key`: an object, a function, or a symbol outside the global registry. */
function isWeaklyHoldable(key: unknown): key is WeakKey {
  const type = typeof key;
  if (type === 'object') {
    return key !== null;
  }
  if (type === 'function') {
    return true;
  }
  if (type === 'symbol') {
    return Symbol.keyFor(key as symbol) === undefined;
  }
  return false;
}

/**
 * A map that holds each key weakly when it can: objects, functions, and unregistered symbols go
 * in a `WeakMap`; everything else goes in a `Map`.
 *
 * @remarks
 * An entry under a weakly held key goes when the key is collected; one under any other key lives
 * as long as the map.
 */
export class KindaWeakMap<in out K = unknown, in out V = unknown> {
  readonly #weak = new WeakMap<WeakKey, V>();

  /** Weakly held entries not yet known to be collected; a `FinalizationRegistry` lowers it after collection. */
  #weakSize = 0;

  readonly #collected = new FinalizationRegistry<undefined>(() => {
    this.#weakSize--;
  });

  /** Made on the first key that cannot be held weakly. */
  #strong: Map<K, V> | undefined;

  /** Entries held right now; a collected key still counts until its cleanup has run, so this can read high, never low. */
  get size(): number {
    return (this.#strong?.size ?? 0) + this.#weakSize;
  }

  get [Symbol.toStringTag](): string {
    return 'KindaWeakMap';
  }

  get(key: K): V | undefined {
    if (isWeaklyHoldable(key)) {
      return this.#weak.get(key);
    }
    return this.#strong?.get(key);
  }

  has(key: K): boolean {
    if (isWeaklyHoldable(key)) {
      return this.#weak.has(key);
    }
    return this.#strong?.has(key) ?? false;
  }

  set(key: K, value: V): this {
    if (isWeaklyHoldable(key)) {
      if (!this.#weak.has(key)) {
        this.#weakSize++;
        this.#collected.register(key, undefined, key);
      }
      this.#weak.set(key, value);
    } else {
      (this.#strong ??= new Map()).set(key, value);
    }
    return this;
  }

  delete(key: K): boolean {
    if (isWeaklyHoldable(key)) {
      if (!this.#weak.delete(key)) {
        return false;
      }
      this.#weakSize--;
      this.#collected.unregister(key);
      return true;
    }
    return this.#strong?.delete(key) ?? false;
  }

  /** The entry under `key`, storing `value` there first when there is none. */
  getOrInsert(key: K, value: V): V {
    const existing = this.get(key);
    if (existing !== undefined || this.has(key)) {
      return existing as V;
    }
    this.set(key, value);
    return value;
  }

  /** The entry under `key`, storing what `compute` answers there first when there is none. A throw stores nothing. */
  getOrInsertComputed(key: K, compute: Func<[K], V>): V {
    const existing = this.get(key);
    if (existing !== undefined || this.has(key)) {
      return existing as V;
    }
    const value = compute(key);
    this.set(key, value);
    return value;
  }
}
