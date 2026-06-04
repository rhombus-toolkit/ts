/**
 * Internal view of the protected hook methods, used to reach them from the
 * module-level proxy handler. `ProxyBase` declares the hooks as `protected`,
 * which TypeScript won't let the handler call from outside the class body;
 * this interface gives the handler a structural, non-`protected` view of the
 * same method set so it can dispatch through them.
 */
interface ProxyBaseHooks {
    _get(target: object, property: PropertyKey, receiver: unknown): unknown;
    _set(target: object, property: PropertyKey, value: unknown, receiver: unknown): boolean;
    _has(target: object, property: PropertyKey): boolean;
    _deleteProperty(target: object, property: PropertyKey): boolean;
    _ownKeys(target: object): ArrayLike<string | symbol>;
    _getOwnPropertyDescriptor(target: object, property: PropertyKey): PropertyDescriptor | undefined;
    _defineProperty(target: object, property: PropertyKey, attributes: PropertyDescriptor): boolean;
    _getPrototypeOf(target: object): object | null;
    _setPrototypeOf(target: object, prototype: object | null): boolean;
    _isExtensible(target: object): boolean;
    _preventExtensions(target: object): boolean;
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
            if (Reflect.has(target, property)) return Reflect.get(target, property, receiver);
            return hook('_get').call(self, target, property, receiver);
        },
        set(target, property, value, receiver) {
            if (Reflect.has(target, property)) return Reflect.set(target, property, value, receiver);
            return hook('_set').call(self, target, property, value, receiver);
        },
        has(target, property) {
            if (Reflect.has(target, property)) return true;
            return hook('_has').call(self, target, property);
        },
        // The remaining traps do not walk the prototype chain; they fire only
        // when the operation is performed on the attached proxy itself (e.g.
        // for...in's chain walk, instanceof's getPrototypeOf walk, or direct
        // operations on Object.getPrototypeOf(instance)).
        deleteProperty(target, property) { return hook('_deleteProperty').call(self, target, property); },
        ownKeys(target) { return hook('_ownKeys').call(self, target); },
        getOwnPropertyDescriptor(target, property) { return hook('_getOwnPropertyDescriptor').call(self, target, property); },
        defineProperty(target, property, attributes) { return hook('_defineProperty').call(self, target, property, attributes); },
        getPrototypeOf(target) { return hook('_getPrototypeOf').call(self, target); },
        setPrototypeOf(target, prototype) { return hook('_setPrototypeOf').call(self, target, prototype); },
        isExtensible(target) { return hook('_isExtensible').call(self, target); },
        preventExtensions(target) { return hook('_preventExtensions').call(self, target); },
    };
}

/**
 * A base class that gives subclasses Proxy semantics without the usual
 * restriction that a `Proxy` cannot be subclassed with `extends`.
 *
 * A `Proxy` is an exotic object: you cannot write `class Foo extends Proxy`,
 * because the constructed instance is the proxy, not a normal object whose
 * prototype chain you control. `ProxyBase` works around this by attaching the
 * proxy at a different point in the chain. Instead of *being* a proxy, each
 * instance *has* a per-instance `Proxy` spliced in as its prototype:
 *
 * ```text
 *   instance ──[[Prototype]]──▶ Proxy(realPrototype) ──▶ realPrototype ──▶ …
 * ```
 *
 * The constructor reads the instance's real prototype, wraps it in a `Proxy`
 * whose handler dispatches to this instance's hook methods, and sets that
 * proxy as the instance's `[[Prototype]]`. Because the proxy's target is the
 * real prototype, every inherited method and the whole `instanceof` chain
 * remain intact.
 *
 * ## Which hooks fire, and when
 *
 * Only three proxy traps participate in JavaScript's prototype-chain walk:
 * `get`, `set`, and `has`. Because the proxy sits *on the chain* (rather than
 * being the instance itself), those traps fire for any property operation that
 * misses the instance's own properties **and** the entire real prototype
 * chain. The handler enforces exactly that: it checks `Reflect.has(target, …)`
 * first and only calls the hook on a true miss. The result is fallback
 * semantics — {@link ProxyBase._get}, {@link ProxyBase._set} and
 * {@link ProxyBase._has} behave like Python's `__getattr__`/`__setattr__`,
 * running only for properties that don't otherwise exist.
 *
 * The remaining hooks exist for completeness. They fire only for operations
 * performed directly on the attached proxy object itself — i.e. on
 * `Object.getPrototypeOf(instance)`:
 *
 * - `for…in` walks the chain and reaches the proxy, invoking
 *   {@link ProxyBase._ownKeys} and {@link ProxyBase._getOwnPropertyDescriptor};
 * - `instance instanceof Subclass` walks the chain via `getPrototypeOf`,
 *   invoking {@link ProxyBase._getPrototypeOf}.
 *
 * `apply` and `construct` are intentionally omitted: the proxy target is a
 * prototype object, which is not callable or constructable.
 *
 * ## Behavioral notes
 *
 * - Own-property reads and writes of *existing* properties never trap — the
 *   handler's miss-check short-circuits them.
 * - The *first* assignment of a brand-new property routes through
 *   {@link ProxyBase._set} (it's a miss at that point); the default `_set`
 *   creates the own property, so every subsequent read/write of it is a hit
 *   and no longer traps.
 * - Class **field declarations** (`field = value`) use `[[DefineOwnProperty]]`
 *   semantics, not `[[Set]]`, so they do not route through `_set`.
 * - `Object.getPrototypeOf(instance)` returns the attached proxy, not the real
 *   prototype.
 * - Hooks must be overridden as ordinary prototype methods
 *   (`protected override _get(…) { … }`), **not** as arrow-function class
 *   fields. The handler resolves them through the real prototype chain; an
 *   arrow-function field would be an own property created after the proxy is
 *   attached and would not be found by the dispatcher.
 *
 * @example
 * ```ts
 * class Fallback extends ProxyBase {
 *     protected override _get(_t: object, property: PropertyKey): unknown {
 *         return `missing:${String(property)}`;
 *     }
 * }
 * const f = new Fallback();
 * f.anything; // 'missing:anything'
 * f instanceof Fallback; // true
 * ```
 */
export class ProxyBase {
    constructor() {
        const prototype = Object.getPrototypeOf(this) as object;
        Object.setPrototypeOf(this, new Proxy(prototype, createHandler(this, prototype)));
    }

    /**
     * Fallback for the `get` trap. `protected` and intended to be overridden
     * by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `get` trap. Because `get` participates in the
     * prototype-chain walk, it fires for any property read that misses the
     * instance's own properties and the entire real prototype chain. Default
     * behavior delegates to `Reflect.get`.
     */
    protected _get(target: object, property: PropertyKey, receiver: unknown): unknown {
        return Reflect.get(target, property, receiver);
    }

    /**
     * Fallback for the `set` trap. `protected` and intended to be overridden
     * by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `set` trap. Because `set` participates in the
     * prototype-chain walk, it fires only on the *first* assignment of a
     * property that does not yet exist on the instance or the real prototype
     * chain. Default behavior delegates to `Reflect.set`, which creates the
     * own property — so subsequent assignments hit and no longer trap.
     */
    protected _set(target: object, property: PropertyKey, value: unknown, receiver: unknown): boolean {
        return Reflect.set(target, property, value, receiver);
    }

    /**
     * Fallback for the `has` trap. `protected` and intended to be overridden
     * by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `has` trap (the `in` operator). Because `has`
     * participates in the prototype-chain walk, it fires only for keys that
     * are absent from the instance's own properties and the entire real
     * prototype chain. Default behavior delegates to `Reflect.has`.
     */
    protected _has(target: object, property: PropertyKey): boolean {
        return Reflect.has(target, property);
    }

    /**
     * Fallback for the `deleteProperty` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `deleteProperty` trap (`delete`). This trap
     * does not walk the prototype chain; it fires only when `delete` is
     * applied directly to the attached proxy
     * (`Object.getPrototypeOf(instance)`). Default behavior delegates to
     * `Reflect.deleteProperty`.
     */
    protected _deleteProperty(target: object, property: PropertyKey): boolean {
        return Reflect.deleteProperty(target, property);
    }

    /**
     * Fallback for the `ownKeys` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `ownKeys` trap. This trap does not walk the
     * prototype chain; it fires when the attached proxy itself is enumerated —
     * e.g. during a `for…in` chain walk, or via
     * `Reflect.ownKeys(Object.getPrototypeOf(instance))`. Default behavior
     * delegates to `Reflect.ownKeys`.
     */
    protected _ownKeys(target: object): ArrayLike<string | symbol> {
        return Reflect.ownKeys(target);
    }

    /**
     * Fallback for the `getOwnPropertyDescriptor` trap. `protected` and
     * intended to be overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `getOwnPropertyDescriptor` trap. This trap does
     * not walk the prototype chain; it fires for descriptor queries against
     * the attached proxy itself (including the descriptor lookups a `for…in`
     * chain walk performs). Default behavior delegates to
     * `Reflect.getOwnPropertyDescriptor`.
     */
    protected _getOwnPropertyDescriptor(target: object, property: PropertyKey): PropertyDescriptor | undefined {
        return Reflect.getOwnPropertyDescriptor(target, property);
    }

    /**
     * Fallback for the `defineProperty` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `defineProperty` trap
     * (`Object.defineProperty`). This trap does not walk the prototype chain;
     * it fires only when a property is defined directly on the attached proxy.
     * Default behavior delegates to `Reflect.defineProperty`.
     */
    protected _defineProperty(target: object, property: PropertyKey, attributes: PropertyDescriptor): boolean {
        return Reflect.defineProperty(target, property, attributes);
    }

    /**
     * Fallback for the `getPrototypeOf` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `getPrototypeOf` trap. Fires during the
     * prototype-chain walk that `instanceof` performs, and for
     * `Object.getPrototypeOf(Object.getPrototypeOf(instance))`.
     *
     * Unlike the other defaults, this does **not** call
     * `Reflect.getPrototypeOf`. The attached proxy stands in front of the real
     * prototype in the instance's chain, so returning the real prototype
     * (`target`) is what keeps that prototype visible to chain walks — that is
     * what makes `instance instanceof Subclass` continue to work. Overriders
     * that change this return value break `instanceof`.
     */
    protected _getPrototypeOf(target: object): object | null {
        return target;
    }

    /**
     * Fallback for the `setPrototypeOf` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `setPrototypeOf` trap. This trap does not walk
     * the prototype chain; it fires only when the prototype of the attached
     * proxy is reassigned directly. Default behavior delegates to
     * `Reflect.setPrototypeOf`.
     */
    protected _setPrototypeOf(target: object, prototype: object | null): boolean {
        return Reflect.setPrototypeOf(target, prototype);
    }

    /**
     * Fallback for the `isExtensible` trap. `protected` and intended to be
     * overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `isExtensible` trap. This trap does not walk
     * the prototype chain; it fires for extensibility queries against the
     * attached proxy itself. Default behavior delegates to
     * `Reflect.isExtensible`.
     */
    protected _isExtensible(target: object): boolean {
        return Reflect.isExtensible(target);
    }

    /**
     * Fallback for the `preventExtensions` trap. `protected` and intended to
     * be overridden by subclasses.
     *
     * @virtual
     *
     * Corresponds to the proxy `preventExtensions` trap. This trap does not
     * walk the prototype chain; it fires only when extensions are prevented on
     * the attached proxy directly. Default behavior delegates to
     * `Reflect.preventExtensions`.
     */
    protected _preventExtensions(target: object): boolean {
        return Reflect.preventExtensions(target);
    }
}

export default ProxyBase;
