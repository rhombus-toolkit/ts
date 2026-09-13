/**
 * A `Map` whose values are held weakly, so an entry is removed once nothing else holds its value.
 *
 * @remarks
 * Not a `Map` by `instanceof`.
 */
export class WeakValuedMap<K, V extends WeakKey> implements Map<K, V> {
  readonly #map = new Map<K, WeakRef<V>>();
  /** Registered once per entry, so a value shared by two keys has two independent registrations. */
  readonly #registry = new FinalizationRegistry(({ key, ref }: { key: K; ref: WeakRef<V>; }) => {
    if (this.#map.get(key) === ref) {
      this.#map.delete(key);
    }
  });

  constructor();
  constructor(entries: Iterable<readonly [K, V]> | null);
  constructor(entries?: Iterable<readonly [K, V]> | null) {
    for (const [key, value] of entries ?? []) {
      this.set(key, value);
    }
  }

  /** Re-setting an existing key leaves its place in iteration order unchanged, as with `Map`. */
  set(key: K, value: V): this {
    const held = this.#map.get(key);
    if (held) {
      this.#registry.unregister(held);
    }
    const ref = new WeakRef(value);
    this.#registry.register(value, { key, ref }, ref);
    this.#map.set(key, ref);
    return this;
  }

  delete(key: K): boolean {
    const held = this.#map.get(key);
    if (!held) {
      return false;
    }
    this.#map.delete(key);
    this.#registry.unregister(held);
    return held.deref() !== undefined;
  }
  get(key: K): V | undefined {
    return this.#map.get(key)?.deref();
  }
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }
  clear(): void {
    this.#map.forEach(ref => this.#registry.unregister(ref));
    this.#map.clear();
  }
  forEach(callbackfn: (value: V, key: K, map: this) => void, thisArg?: any): void {
    for (const [key, value] of this) {
      callbackfn.call(thisArg, value, key, this);
    }
  }
  /** Computed by walking every entry and counting those whose value is still alive. */
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

  readonly [Symbol.toStringTag] = 'WeakValuedMap' as const;
}
