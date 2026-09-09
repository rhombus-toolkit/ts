/**
 * Structural, non-`protected` view of {@link ProxyBase}'s hook methods, so the
 * module-level proxy handler can call them despite their `protected` visibility.
 */
interface ProxyBaseHooks {
  _get(property: PropertyKey, receiver: unknown): unknown;
  _set(property: PropertyKey, value: unknown, receiver: unknown): boolean;
  _has(property: PropertyKey): boolean;
  _deleteProperty(property: PropertyKey): boolean;
  _ownKeys(): ArrayLike<string | symbol>;
  _getOwnPropertyDescriptor(property: PropertyKey): PropertyDescriptor | undefined;
  _defineProperty(property: PropertyKey, attributes: PropertyDescriptor): boolean;
  _getPrototypeOf(): object | null;
  _setPrototypeOf(prototype: object | null): boolean;
  _isExtensible(): boolean;
  _preventExtensions(): boolean;
}

function createHandler(self: ProxyBase, proto: object): ProxyHandler<object> {
  // Look hooks up through the REAL prototype chain (never through the
  // attached proxy) so dispatch cannot recurse into the traps. Resolves
  // subclass overrides because `proto` IS the subclass prototype.
  const hook = <K extends keyof ProxyBaseHooks>(name: K): ProxyBaseHooks[K] =>
    Reflect.get(proto, name, self) as ProxyBaseHooks[K];

  return {
    // get/set/has walk the prototype chain, so they fire here whenever a
    // lookup misses the instance's own properties. The miss-check below
    // restores ordinary behavior for anything that exists on the real
    // chain — hooks only ever see TRUE misses, so overrides never need to
    // delegate to Reflect.* to keep inherited methods working.
    get(target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }
      return hook('_get').call(self, property, receiver);
    },
    set(target, property, value, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.set(target, property, value, receiver);
      }
      return hook('_set').call(self, property, value, receiver);
    },
    has(target, property) {
      if (Reflect.has(target, property)) {
        return true;
      }
      return hook('_has').call(self, property);
    },
    // The remaining traps do not walk the prototype chain; they fire only
    // when the operation is performed on the attached proxy itself (e.g.
    // for...in's chain walk, instanceof's getPrototypeOf walk, or direct
    // operations on Object.getPrototypeOf(instance)).
    deleteProperty(_target, property) {
      return hook('_deleteProperty').call(self, property);
    },
    ownKeys(_target) {
      return hook('_ownKeys').call(self);
    },
    getOwnPropertyDescriptor(_target, property) {
      return hook('_getOwnPropertyDescriptor').call(self, property);
    },
    defineProperty(_target, property, attributes) {
      return hook('_defineProperty').call(self, property, attributes);
    },
    getPrototypeOf(_target) {
      return hook('_getPrototypeOf').call(self);
    },
    setPrototypeOf(_target, prototype) {
      return hook('_setPrototypeOf').call(self, prototype);
    },
    isExtensible(_target) {
      return hook('_isExtensible').call(self);
    },
    preventExtensions(_target) {
      return hook('_preventExtensions').call(self);
    },
  };
}

/**
 * A base class that gives subclasses Proxy semantics without the usual
 * restriction that a `Proxy` cannot be subclassed with `extends`. Construct a
 * subclass, not `ProxyBase` directly.
 *
 * @remarks
 * `get`, `set`, and `has` walk the prototype chain, so they fire only as a
 * miss-only fallback, after the instance's own properties and real prototype
 * chain fail to resolve — like Python's `__getattr__`/`__setattr__`. The first
 * assignment of a new property routes through {@link ProxyBase._set} (which by
 * default creates the own property), so later reads/writes of it hit and no
 * longer trap. The remaining hooks fire only for operations performed directly
 * on `Object.getPrototypeOf(instance)` (the attached proxy) — e.g. `for…in`
 * invokes {@link ProxyBase._ownKeys}, and `instanceof` invokes
 * {@link ProxyBase._getPrototypeOf}.
 *
 * Class **field declarations** use `[[DefineOwnProperty]]` semantics and never
 * route through `_set`. Overrides must be ordinary prototype methods
 * (`protected override _get(...) {...}`) — an arrow-function class field would
 * be an own property the dispatcher can't find through the real prototype chain.
 *
 * @example
 * ```ts
 * class Fallback extends ProxyBase {
 *     protected override _get(property: PropertyKey): unknown {
 *         return `missing:${String(property)}`;
 *     }
 * }
 * const f = new Fallback();
 * f.anything; // 'missing:anything'
 * f instanceof Fallback; // true
 * ```
 *
 * @see {@link IndexAccessed} — the narrower indexer-only sibling.
 */
export abstract class ProxyBase {
  /** The instance's real prototype, captured before the per-instance proxy is spliced in. */
  readonly #prototype: object;

  constructor() {
    const prototype = Object.getPrototypeOf(this) as object;
    this.#prototype = prototype;
    Object.setPrototypeOf(this, new Proxy(prototype, createHandler(this, prototype)));
  }

  /** Fallback for the `get` trap: default delegates to `Reflect.get` against the real prototype. */
  protected _get(property: PropertyKey, receiver: unknown): unknown {
    return Reflect.get(this.#prototype, property, receiver);
  }

  /** Fallback for the `set` trap: default delegates to `Reflect.set` against the real prototype. */
  protected _set(property: PropertyKey, value: unknown, receiver: unknown): boolean {
    return Reflect.set(this.#prototype, property, value, receiver);
  }

  /** Fallback for the `has` trap (`in` operator): default delegates to `Reflect.has` against the real prototype. */
  protected _has(property: PropertyKey): boolean {
    return Reflect.has(this.#prototype, property);
  }

  /** Fallback for the `deleteProperty` trap (`delete`): default delegates to `Reflect.deleteProperty` against the real prototype. */
  protected _deleteProperty(property: PropertyKey): boolean {
    return Reflect.deleteProperty(this.#prototype, property);
  }

  /** Fallback for the `ownKeys` trap: default delegates to `Reflect.ownKeys` against the real prototype. */
  protected _ownKeys(): ArrayLike<string | symbol> {
    return Reflect.ownKeys(this.#prototype);
  }

  /** Fallback for the `getOwnPropertyDescriptor` trap: default delegates to `Reflect.getOwnPropertyDescriptor` against the real prototype. */
  protected _getOwnPropertyDescriptor(property: PropertyKey): PropertyDescriptor | undefined {
    return Reflect.getOwnPropertyDescriptor(this.#prototype, property);
  }

  /** Fallback for the `defineProperty` trap (`Object.defineProperty`): default delegates to `Reflect.defineProperty` against the real prototype. */
  protected _defineProperty(property: PropertyKey, attributes: PropertyDescriptor): boolean {
    return Reflect.defineProperty(this.#prototype, property, attributes);
  }

  /**
   * Fallback for the `getPrototypeOf` trap: returns the real prototype directly
   * (not via `Reflect.getPrototypeOf`) — that's what keeps `instanceof` working.
   * Overriding without calling `super._getPrototypeOf()` breaks it.
   */
  protected _getPrototypeOf(): object | null {
    return this.#prototype;
  }

  /** Fallback for the `setPrototypeOf` trap: default delegates to `Reflect.setPrototypeOf` against the real prototype. */
  protected _setPrototypeOf(prototype: object | null): boolean {
    return Reflect.setPrototypeOf(this.#prototype, prototype);
  }

  /** Fallback for the `isExtensible` trap: default delegates to `Reflect.isExtensible` against the real prototype. */
  protected _isExtensible(): boolean {
    return Reflect.isExtensible(this.#prototype);
  }

  /** Fallback for the `preventExtensions` trap: default delegates to `Reflect.preventExtensions` against the real prototype. */
  protected _preventExtensions(): boolean {
    return Reflect.preventExtensions(this.#prototype);
  }
}

export default ProxyBase;
