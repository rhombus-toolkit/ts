export class KindaWeakMap<K, V extends WeakKey> /*implements Map<K, V>*/ {
  readonly #map = new Map<K, WeakRef<V>>();
  readonly #registry = new FinalizationRegistry((key: K) => {
    if (this.#map.get(key)?.deref() === undefined) {
      this.#map.delete(key);
    }
  });
  set(key: K, value: V): this {
    this.delete(key);
    this.#registry.register(value, key, value);
    this.#map.set(key, new WeakRef(value));
    return this;
  }

  delete(key: K): boolean {
    const value = this.get(key);
    this.#map.delete(key);
    if (value === undefined) {
      return false;
    }
    this.#registry.unregister(value);
    return true;
  }
  get(key: K): V | undefined {
    return this.#map.get(key)?.deref();
  }
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  clear(): void {
    this.values().forEach(value => this.#registry.unregister(value));
    this.#map.clear();
  }
  forEach(callbackfn: (value: V, key: K, map: this) => void, thisArg?: any): void {
    for (const [key, value] of this) {
      callbackfn.call(thisArg, value, key, this);
    }
  }
  /** Counts only entries whose value is still alive, so it walks every ref. */
  get size() {
    return this.entries().reduce(count => count + 1, 0);
  }
  entries(): MapIterator<[K, V]> {
    const held = this.#map.entries().map(([key, ref]): [K, V | undefined] => [key, ref.deref()]);
    return held.filter((entry): entry is [K, V] => entry[1] !== undefined);
  }
  keys(): MapIterator<K> {
    return this.entries().map(([key]) => key);
  }
  values(): MapIterator<V> {
    return this.entries().map(([, value]) => value);
  }
  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  readonly [Symbol.toStringTag] = 'KindaWeakMap' as const;
}
