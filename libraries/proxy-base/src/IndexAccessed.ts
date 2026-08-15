/**
 * Internal view of the indexer methods, used to reach them from the
 * module-level proxy handler. `IndexAccessed` declares the indexers as
 * `protected`, which TypeScript won't let the handler call from outside the
 * class body; this interface gives the handler a structural, non-`protected`
 * view of the same method set so it can dispatch through them.
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
 * Reads and writes of properties that do **not** exist anywhere on the instance
 * or its real prototype chain route to {@link IndexAccessed._getIndex} and
 * {@link IndexAccessed._setIndex}. Real members — own properties, declared
 * fields, and inherited methods — always win; the indexer is a *miss-only*
 * fallback, never consulted for keys that already resolve.
 *
 * ## Narrowing `Key` past real members
 *
 * Real members always shadow the indexer at runtime, so when you narrow `Key`
 * to a literal union, **exclude the names of the class's own members from it**
 * — otherwise the `Key` type promises index access to keys that actually
 * resolve to methods/fields and never reach the indexer. The clean way to do
 * this is to declare the member surface as an interface and subtract its keys:
 *
 * ```ts
 * type Keys = 'PATH' | 'HOME' | 'refresh';
 * interface EnvApi { refresh(): void; }
 * class Env extends IndexAccessed<string, Exclude<Keys, keyof EnvApi>> implements EnvApi {
 *     // refresh is a real member, so it shadows the indexer and is excluded
 *     // from Key above.
 *     refresh(): void {}
 *     protected _getIndex(key: 'PATH' | 'HOME'): string { throw new Error(String(key)); }
 *     protected _setIndex(_key: 'PATH' | 'HOME', value: string): string { return value; }
 * }
 * ```
 *
 * The members-interface indirection is required: the self-referential form
 * `Exclude<Keys, keyof Env>` written inside `Env`'s own `extends` clause is
 * rejected by TypeScript (TS2310, recursive base-class reference). With the
 * default `Key = PropertyKey` no exclusion is needed — the broad
 * `string | number | symbol` constituents aren't narrowed by excluding literal
 * member names anyway.
 *
 * ## Mechanism
 *
 * A `Proxy` is an exotic object and cannot be subclassed with `extends`. Rather
 * than *being* a proxy, each instance *has* a per-instance `Proxy` spliced into
 * its prototype chain in place of the real prototype:
 *
 * ```text
 *   instance ──[[Prototype]]──▶ Proxy(realPrototype) ──▶ realPrototype ──▶ …
 * ```
 *
 * The constructor reads the instance's real prototype, wraps it in a `Proxy`
 * whose handler dispatches to this instance's indexer methods, and sets that
 * proxy as the instance's `[[Prototype]]`. Only the `get` and `set` traps
 * participate in JavaScript's prototype-chain walk, which is all this class
 * needs — so unlike {@link ProxyBase} it deliberately exposes no other hook
 * surface. The `getPrototypeOf` trap is implemented solely to return the real
 * prototype, keeping `instanceof` intact.
 *
 * ## Hazards
 *
 * - **Keys are `PropertyKey`.** Well-known-symbol probes against an
 *   instance — `Symbol.toStringTag`, `Symbol.iterator`, Node's
 *   `util.inspect.custom` symbol, and the like — are property reads that miss
 *   undeclared, so they also reach {@link IndexAccessed._getIndex}. Iteration,
 *   logging, and string coercion all probe this way.
 * - **Constructor-body assignments to undeclared properties route through
 *   {@link IndexAccessed._setIndex}.** A plain `this.foo = …` in a subclass
 *   constructor is a `[[Set]]` and, if `foo` isn't otherwise defined, traps as
 *   an index write. Class **field declarations** (`foo = value`) use
 *   `[[DefineOwnProperty]]` semantics and do **not** route through the indexer.
 * - **`key in obj` and `Object.keys(obj)` do not consult the indexer.** There
 *   is no `has` or `ownKeys` participation; only `get` and `set` are wired up.
 * - **`Object.getPrototypeOf(instance)` returns the attached proxy**, not the
 *   real prototype.
 *
 * @typeParam Value - The type of values the indexer reads and writes.
 * @typeParam Key - The key type the indexer accepts; defaults to `PropertyKey`.
 * This is a compile-time contract only — the proxy cannot restrict which keys
 * arrive at runtime, so {@link IndexAccessed._getIndex} and
 * {@link IndexAccessed._setIndex} may still be invoked with keys outside `Key`.
 * Narrowing `Key` documents intent and tightens the call site for
 * statically-typed access; it does not change what arrives at runtime.
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
 * @see {@link Indexed} — the type that surfaces the index surface at the value site.
 * @see {@link ProxyBase} — the full-hook-surface sibling.
 *
 * @abstract
 */
export abstract class IndexAccessed<Value, Key extends PropertyKey = PropertyKey> {
  constructor() {
    const prototype = Object.getPrototypeOf(this) as object;
    Object.setPrototypeOf(this, new Proxy(prototype, createHandler(this, prototype)));
  }

  /**
   * Indexer read hook.
   *
   * @remarks
   * Corresponds to the proxy `get` trap. Because `get` participates in the
   * prototype-chain walk, it fires for any property read that misses the
   * instance's own properties and the entire real prototype chain — including
   * well-known-symbol probes (see the class-level hazards). The `key`
   * parameter is typed `Key`, but that is a compile-time contract only — at
   * runtime keys outside `Key` can still arrive.
   *
   * @param key - The property key being read.
   * @returns The indexed value for the given key.
   *
   * @protected
   * @abstract
   */
  protected abstract _getIndex(key: Key): Value;

  /**
   * Indexer write hook.
   *
   * @remarks
   * Corresponds to the proxy `set` trap. Because `set` participates in the
   * prototype-chain walk, it fires on assignment to a property that does not
   * exist on the instance or the real prototype chain.
   *
   * As with {@link IndexAccessed._getIndex}, the `key` parameter is typed
   * `Key` purely as a compile-time contract; keys outside `Key` can still
   * arrive at runtime.
   *
   * The return value is **not** consumed by the proxy machinery — assignments
   * always report success regardless of what is returned. It exists purely for
   * subclass ergonomics (e.g. returning the stored value for chaining).
   *
   * @param key - The property key being written.
   * @param value - The value being assigned.
   * @returns A value for subclass ergonomics; not consumed by the proxy.
   *
   * @protected
   * @abstract
   */
  protected abstract _setIndex(key: Key, value: Value): Value;
}

/**
 * The index-accessible view of an {@link IndexAccessed} subclass instance: the
 * instance's real members intersected with the `Key`→`Value` index surface the
 * proxy serves at runtime.
 *
 * @remarks
 * The class itself cannot carry this index surface. TypeScript requires every
 * named member of a type to be assignable to that type's index signature, and
 * the {@link IndexAccessed._getIndex} / {@link IndexAccessed._setIndex} hooks —
 * being methods, not `Value`s — never are. Declaring `[key: Key]: Value` on the
 * class (or on anything it inherits, which would push the same error onto every
 * subclass's hooks) is therefore a compile error. The indexer is a runtime-only
 * construct, so its type is applied at the value site instead, via a cast:
 *
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
 *
 * Unlike an `as unknown as Record<Key, Value>` cast — which throws the instance's
 * real members away — `Indexed` intersects rather than replaces, so `env` above
 * is still an `Env`: its declared methods and `instanceof` keep type-checking.
 * Narrow `Key` (as here) to keep index access typed and to exclude real member
 * names per the class-level "Narrowing `Key`" guidance; with the default
 * `Key = PropertyKey`, `Indexed` yields the broad `string | number | symbol`
 * index surface.
 *
 * @typeParam T - The subclass instance type being viewed.
 * @typeParam Value - The value type the indexer reads and writes; matches the
 * `Value` the subclass passed to {@link IndexAccessed}.
 * @typeParam Key - The key type the index surface accepts; matches the `Key` the
 * subclass passed to {@link IndexAccessed}. Defaults to `PropertyKey`.
 */
export type Indexed<T extends IndexAccessed<Value, Key>, Value, Key extends PropertyKey = PropertyKey> = T & {
  [P in Key]: Value;
};

export default IndexAccessed;
