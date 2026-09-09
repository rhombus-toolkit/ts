/**
 * Structural, non-`protected` view of {@link IndexAccessed}'s indexer methods, so the
 * module-level proxy handler can call them despite their `protected` visibility.
 */
interface Indexer {
  _getIndex(key: PropertyKey): unknown;
  _setIndex(key: PropertyKey, value: unknown): unknown;
}

function createHandler(self: object, proto: object): ProxyHandler<object> {
  // Look the indexer methods up through the REAL prototype chain (never
  // through the attached proxy) so dispatch cannot recurse into the traps.
  // Resolves subclass overrides because `proto` IS the subclass prototype.
  const indexer = <K extends keyof Indexer>(name: K): Indexer[K] => Reflect.get(proto, name, self) as Indexer[K];

  return {
    // get/set walk the prototype chain, so they fire here whenever a lookup
    // misses the instance's own properties and the entire real chain. The
    // miss-check restores ordinary behavior for real members, so the
    // indexer only ever sees true misses.
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }
      return indexer('_getIndex').call(self, property);
    },
    set(target, property, value, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.set(target, property, value, receiver);
      }
      indexer('_setIndex').call(self, property, value);
      return true;
    },
    getPrototypeOf() {
      // The attached proxy stands in front of the real prototype in the
      // instance's chain; returning the real prototype keeps it visible
      // to prototype walks so `instance instanceof Subclass` works.
      return proto;
    },
  };
}

/**
 * An `abstract` base class that gives subclasses indexer-style property access —
 * the TypeScript/JavaScript analogue of a C# indexer (`this[key]`).
 *
 * @remarks
 * Reads and writes of properties absent from the instance and its real prototype
 * chain route to {@link IndexAccessed._getIndex} / {@link IndexAccessed._setIndex};
 * real members always win. Well-known-symbol probes (`Symbol.iterator`, etc.) and
 * constructor-body `this.foo = …` assignments count as misses too, but class field
 * declarations don't. `key in obj`, `Object.keys`, and `Object.getPrototypeOf` don't
 * consult the indexer.
 *
 * When narrowing `Key` to a literal union, exclude the class's own member names —
 * they resolve as real members, so the indexer never sees them. Do this via a
 * separate members interface (`Exclude<Keys, keyof EnvApi>`); writing
 * `Exclude<Keys, keyof Env>` directly in `Env`'s own `extends` clause is a
 * TS2310 recursive base-class reference.
 *
 * @typeParam Value - The type of values the indexer reads and writes.
 * @typeParam Key - The key type the indexer accepts; defaults to `PropertyKey`. Compile-time
 * only — keys outside `Key` can still reach the hooks at runtime.
 *
 * @example
 * ```ts
 * class Env extends IndexAccessed<string> {
 *     readonly #store = new Map<PropertyKey, string>();
 *
 *     protected _getIndex(key: PropertyKey): string {
 *         const value = this.#store.get(key);
 *         if (value === undefined) {
 *             throw new Error(`Env: no such variable '${String(key)}'`);
 *         }
 *         return value;
 *     }
 *
 *     protected _setIndex(key: PropertyKey, value: string): string {
 *         this.#store.set(key, value);
 *         return value;
 *     }
 * }
 *
 * const env = new Env() as Indexed<Env, string>;
 * env['HOME'] = '/home/tom';
 * env['HOME']; // '/home/tom'
 * env instanceof Env; // true — `Indexed` keeps `Env`'s real members
 * ```
 *
 * @see {@link Indexed} — surfaces the index type at the value site.
 * @see {@link ProxyBase} — the full-hook-surface sibling.
 */
export abstract class IndexAccessed<Value, Key extends PropertyKey = PropertyKey> {
  constructor() {
    const prototype = Object.getPrototypeOf(this) as object;
    Object.setPrototypeOf(this, new Proxy(prototype, createHandler(this, prototype)));
  }

  /** Indexer read hook; fires for property reads that miss the instance and its real prototype chain. */
  protected abstract _getIndex(key: Key): Value;

  /**
   * Indexer write hook; fires for property writes that miss the instance and its real prototype chain.
   *
   * @returns Not consumed by the proxy machinery — assignments always report success
   * regardless. Exists for subclass ergonomics (e.g. returning the value for chaining).
   */
  protected abstract _setIndex(key: Key, value: Value): Value;
}

/**
 * The index-accessible view of an {@link IndexAccessed} subclass instance: its
 * real members intersected with the `Key`→`Value` index surface the proxy serves
 * at runtime.
 *
 * @remarks
 * The class itself can't declare `[key: Key]: Value` — TypeScript requires every
 * named member to be assignable to the index signature, and the
 * {@link IndexAccessed._getIndex} / {@link IndexAccessed._setIndex} hooks never
 * are. `Indexed` applies the index type at the value site instead, via a cast, and
 * intersects rather than replaces so `instanceof` and declared methods keep
 * type-checking.
 *
 * @typeParam T - The subclass instance type being viewed.
 * @typeParam Value - The value type the indexer reads and writes.
 * @typeParam Key - The key type the index surface accepts; defaults to `PropertyKey`.
 *
 * @example
 * ```ts
 * class Env extends IndexAccessed<string, 'HOME' | 'PATH'> {
 *     protected _getIndex(key: 'HOME' | 'PATH'): string { throw new Error(key); }
 *     protected _setIndex(_key: 'HOME' | 'PATH', value: string): string { return value; }
 * }
 *
 * const env = new Env() as Indexed<Env, string, 'HOME' | 'PATH'>;
 * env['HOME'];            // string
 * env['PATH'] = '/bin';   // ok
 * ```
 */
export type Indexed<T extends IndexAccessed<Value, Key>, Value, Key extends PropertyKey = PropertyKey> = T & {
  [P in Key]: Value;
};

export default IndexAccessed;
