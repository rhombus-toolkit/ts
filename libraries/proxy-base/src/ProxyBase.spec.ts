import { describe, expect, it } from 'bun:test';
import Default, { ProxyBase } from './ProxyBase';

/** The attached per-instance proxy: the instance's direct prototype, which the remaining traps fire on. */
function attachedProxy(instance: object): object {
  return Object.getPrototypeOf(instance) as object;
}

/** Every hook, recording each call as `[name, ...args]` and delegating to the default implementation. */
class Recording extends ProxyBase {
  readonly calls: unknown[][] = [];

  protected override _get(property: PropertyKey, receiver: unknown): unknown {
    this.calls.push(['_get', property, receiver]);
    return super._get(property, receiver);
  }

  protected override _set(property: PropertyKey, value: unknown, receiver: unknown): boolean {
    this.calls.push(['_set', property, value, receiver]);
    return super._set(property, value, receiver);
  }

  protected override _has(property: PropertyKey): boolean {
    this.calls.push(['_has', property]);
    return super._has(property);
  }

  protected override _deleteProperty(property: PropertyKey): boolean {
    this.calls.push(['_deleteProperty', property]);
    return super._deleteProperty(property);
  }

  protected override _ownKeys(): ArrayLike<string | symbol> {
    this.calls.push(['_ownKeys']);
    return super._ownKeys();
  }

  protected override _getOwnPropertyDescriptor(property: PropertyKey): PropertyDescriptor | undefined {
    this.calls.push(['_getOwnPropertyDescriptor', property]);
    return super._getOwnPropertyDescriptor(property);
  }

  protected override _defineProperty(property: PropertyKey, attributes: PropertyDescriptor): boolean {
    this.calls.push(['_defineProperty', property, attributes]);
    return super._defineProperty(property, attributes);
  }

  protected override _getPrototypeOf(): object | null {
    this.calls.push(['_getPrototypeOf']);
    return super._getPrototypeOf();
  }

  protected override _setPrototypeOf(prototype: object | null): boolean {
    this.calls.push(['_setPrototypeOf', prototype]);
    return super._setPrototypeOf(prototype);
  }

  protected override _isExtensible(): boolean {
    this.calls.push(['_isExtensible']);
    return super._isExtensible();
  }

  protected override _preventExtensions(): boolean {
    this.calls.push(['_preventExtensions']);
    return super._preventExtensions();
  }

  /** A real prototype member, so hits can be told apart from misses. */
  realMethod(): string {
    return 'real';
  }
}

/** Answers every missing read with a marker naming the key. */
class Fallback extends ProxyBase {
  protected override _get(property: PropertyKey): unknown {
    return `missing:${String(property)}`;
  }
}

describe('module exports', () => {
  it('exports the class as both the named and the default export', () => {
    expect(Default).toBe(ProxyBase);
  });
});

describe('prototype chain', () => {
  it('splices a proxy between the instance and its real prototype', () => {
    const instance = new Recording();

    expect(attachedProxy(instance)).not.toBe(Recording.prototype);
    expect(Object.getPrototypeOf(attachedProxy(instance))).toBe(Recording.prototype);
  });

  it('attaches a distinct proxy per instance', () => {
    expect(attachedProxy(new Recording())).not.toBe(attachedProxy(new Recording()));
  });

  it('keeps instanceof true for the subclass and the base', () => {
    const instance = new Recording();

    expect(instance instanceof Recording).toBe(true);
    expect(instance instanceof ProxyBase).toBe(true);
    expect(Recording.prototype.isPrototypeOf(instance)).toBe(true);
  });

  it('routes instanceof through _getPrototypeOf', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    void (instance instanceof Recording);

    expect(instance.calls).toEqual([['_getPrototypeOf']]);
  });

  it('breaks instanceof when _getPrototypeOf stops returning the real prototype', () => {
    class Detached extends ProxyBase {
      protected override _getPrototypeOf(): object | null {
        return null;
      }
    }

    expect(new Detached() instanceof Detached).toBe(false);
  });

  it('resolves hook overrides through a multi-level subclass chain', () => {
    class Middle extends ProxyBase {
      protected override _get(property: PropertyKey): unknown {
        return `middle:${String(property)}`;
      }
    }
    class Leaf extends Middle {}
    const leaf = new Leaf() as Leaf & Record<string, unknown>;

    expect(leaf.anything).toBe('middle:anything');
    expect(leaf instanceof Middle).toBe(true);
  });

  it('ignores an arrow-function field override because it is an own property, not a prototype method', () => {
    class Field extends ProxyBase {
      _get = (): unknown => 'from field';
    }
    const instance = new Field() as Field & Record<string, unknown>;

    expect(instance.anything).toBeUndefined();
  });
});

describe('get', () => {
  it('routes a read that misses the instance and its real chain to _get', () => {
    const instance = new Fallback() as Fallback & Record<string, unknown>;

    expect(instance.anything).toBe('missing:anything');
  });

  it('passes symbol keys to _get', () => {
    const instance = new Fallback() as Fallback & Record<symbol, unknown>;

    expect(instance[Symbol.iterator]).toBe('missing:Symbol(Symbol.iterator)');
  });

  it('returns undefined for a miss by default', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;

    expect(instance.anything).toBeUndefined();
    expect(instance.calls).toEqual([['_get', 'anything', instance]]);
  });

  it('serves an own property without consulting _get', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;
    Object.defineProperty(instance, 'own', { value: 1 });
    instance.calls.length = 0;

    expect(instance.own).toBe(1);
    expect(instance.calls).toEqual([]);
  });

  it('serves a real prototype member without consulting _get', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    expect(instance.realMethod()).toBe('real');
    expect(instance.calls).toEqual([]);
  });

  it('keeps inherited Object.prototype members working even when _get returns a value for every miss', () => {
    const instance = new Fallback();

    expect(instance.toString).toBe(Object.prototype.toString);
    expect(instance.hasOwnProperty('x')).toBe(false);
  });

  it('binds this to the constructed instance and passes the actual receiver', () => {
    const instance = new Recording();
    const derived = Object.create(instance) as Record<string, unknown>;
    instance.calls.length = 0;

    void derived.anything;

    expect(instance.calls).toEqual([['_get', 'anything', derived]]);
  });

  it('lets a hook read a private field, since this is the real instance', () => {
    class Stored extends ProxyBase {
      readonly #store = new Map<PropertyKey, unknown>([['answer', 42]]);

      protected override _get(property: PropertyKey): unknown {
        return this.#store.get(property);
      }
    }
    const instance = new Stored() as Stored & Record<string, unknown>;

    expect(instance.answer).toBe(42);
  });

  it('lets await resolve the instance, since the then probe is a miss that returns undefined by default', async () => {
    const instance = new Recording();

    expect(await instance).toBe(instance);
  });
});

describe('set', () => {
  it('routes an assignment to a missing property to _set', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;
    instance.calls.length = 0;

    instance.fresh = 1;

    expect(instance.calls).toEqual([['_set', 'fresh', 1, instance]]);
  });

  it('creates an own property on the instance by default, so later access no longer traps', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;

    instance.fresh = 1;
    instance.calls.length = 0;
    instance.fresh = 2;

    expect(Object.getOwnPropertyDescriptor(instance, 'fresh')).toEqual({ value: 2, writable: true, enumerable: true,
      configurable: true });
    expect(instance.fresh).toBe(2);
    expect(instance.calls).toEqual([]);
  });

  it('routes a constructor-body assignment through _set', () => {
    const calls: PropertyKey[] = [];
    class Assigning extends ProxyBase {
      constructor() {
        super();
        (this as Assigning & Record<string, unknown>).fromCtor = 1;
      }

      protected override _set(property: PropertyKey, value: unknown, receiver: unknown): boolean {
        calls.push(property);
        return super._set(property, value, receiver);
      }
    }

    expect(new Assigning()).toHaveProperty('fromCtor', 1);
    expect(calls).toEqual(['fromCtor']);
  });

  it('never routes a class field declaration through _set', () => {
    const calls: PropertyKey[] = [];
    class Declaring extends ProxyBase {
      declared = 1;

      protected override _set(property: PropertyKey, value: unknown, receiver: unknown): boolean {
        calls.push(property);
        return super._set(property, value, receiver);
      }
    }

    expect(new Declaring().declared).toBe(1);
    expect(calls).toEqual([]);
  });

  it('writes a real prototype accessor without consulting _set', () => {
    let stored: unknown;
    class Accessor extends ProxyBase {
      set real(value: unknown) {
        stored = value;
      }

      protected override _set(): boolean {
        throw new Error('must not trap');
      }
    }
    const instance = new Accessor();

    instance.real = 'value';

    expect(stored).toBe('value');
  });

  it('throws a TypeError from an assignment when _set reports failure', () => {
    class Rejecting extends ProxyBase {
      protected override _set(): boolean {
        return false;
      }
    }
    const instance = new Rejecting() as Rejecting & Record<string, unknown>;

    expect(() => {
      instance.anything = 1;
    }).toThrow(TypeError);
    expect(Reflect.set(instance, 'anything', 1)).toBe(false);
  });

  it('respects a non-extensible instance in the default _set', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;
    Object.preventExtensions(instance);

    expect(Reflect.set(instance, 'fresh', 1)).toBe(false);
    expect(instance).not.toHaveProperty('fresh');
  });
});

describe('has', () => {
  it('routes an in check for a missing property to _has', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    expect('anything' in instance).toBe(false);
    expect(instance.calls).toEqual([['_has', 'anything']]);
  });

  it('reports true for an own or real chain property without consulting _has', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;
    instance.own = 1;
    instance.calls.length = 0;

    expect('own' in instance).toBe(true);
    expect('realMethod' in instance).toBe(true);
    expect('toString' in instance).toBe(true);
    expect(instance.calls).toEqual([]);
  });

  it('reports a virtual property present when _has returns true for it', () => {
    class Virtual extends ProxyBase {
      protected override _has(property: PropertyKey): boolean {
        return property === 'virtual';
      }
    }

    expect('virtual' in new Virtual()).toBe(true);
    expect('other' in new Virtual()).toBe(false);
  });
});

describe('deleteProperty', () => {
  it('deletes an own instance property without consulting _deleteProperty', () => {
    const instance = new Recording() as Recording & Record<string, unknown>;
    instance.own = 1;
    instance.calls.length = 0;

    expect(delete instance.own).toBe(true);
    expect(Object.hasOwn(instance, 'own')).toBe(false);
    expect(instance.calls).toEqual([]);
  });

  it('routes a delete on the attached proxy to _deleteProperty', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    expect(Reflect.deleteProperty(attachedProxy(instance), 'anything')).toBe(true);
    expect(instance.calls).toEqual([['_deleteProperty', 'anything']]);
  });

  it('removes the real prototype member by default', () => {
    class Local extends ProxyBase {
      doomed(): void {}
    }
    const instance = new Local();

    expect(Reflect.deleteProperty(attachedProxy(instance), 'doomed')).toBe(true);
    expect(Local.prototype).not.toHaveProperty('doomed');
    expect('doomed' in instance).toBe(false);
  });

  it('makes delete throw a TypeError when _deleteProperty reports failure', () => {
    class Keeping extends ProxyBase {
      protected override _deleteProperty(): boolean {
        return false;
      }
    }
    const proxy = attachedProxy(new Keeping()) as Record<string, unknown>;

    expect(() => {
      delete proxy.anything;
    }).toThrow(TypeError);
  });
});

describe('ownKeys and getOwnPropertyDescriptor', () => {
  /** Reports one enumerable virtual key on top of the real prototype's. */
  class Virtual extends ProxyBase {
    protected override _ownKeys(): ArrayLike<string | symbol> {
      return [...super._ownKeys(), 'virtual'];
    }

    protected override _getOwnPropertyDescriptor(property: PropertyKey): PropertyDescriptor | undefined {
      if (property === 'virtual') {
        return { value: 1, enumerable: true, configurable: true };
      }
      return super._getOwnPropertyDescriptor(property);
    }
  }

  it('reports the real prototype keys and descriptors through the attached proxy by default', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    expect(Reflect.ownKeys(attachedProxy(instance))).toEqual(Reflect.ownKeys(Recording.prototype));
    expect(Object.getOwnPropertyDescriptor(attachedProxy(instance), 'realMethod')).toEqual(
      Object.getOwnPropertyDescriptor(Recording.prototype, 'realMethod'),
    );
    expect(instance.calls).toEqual([['_ownKeys'], ['_getOwnPropertyDescriptor', 'realMethod']]);
  });

  it('lists only real own properties through Object.keys on the instance', () => {
    const instance = new Virtual() as Virtual & Record<string, unknown>;
    instance.own = 1;

    expect(Object.keys(instance)).toEqual(['own']);
    expect(Object.getOwnPropertyDescriptor(instance, 'virtual')).toBeUndefined();
  });

  it('surfaces a virtual key through Object.keys on the attached proxy', () => {
    expect(Object.keys(attachedProxy(new Virtual()))).toEqual(['virtual']);
  });

  it('surfaces a virtual key through for...in after the instance own keys', () => {
    const instance = new Virtual() as Virtual & Record<string, unknown>;
    instance.own = 1;
    const seen: string[] = [];

    for (const key in instance) {
      seen.push(key);
    }

    expect(seen).toEqual(['own', 'virtual']);
  });
});

describe('defineProperty', () => {
  it('defines on the instance without consulting _defineProperty', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    Object.defineProperty(instance, 'own', { value: 1 });

    expect(instance.calls).toEqual([]);
  });

  it('routes a define on the attached proxy to _defineProperty', () => {
    const instance = new Recording();
    instance.calls.length = 0;
    const attributes = { value: 1, configurable: true };

    Object.defineProperty(attachedProxy(instance), 'anything', attributes);

    expect(instance.calls).toEqual([['_defineProperty', 'anything', attributes]]);
  });

  it('defines on the real prototype by default, so every instance inherits it', () => {
    class Local extends ProxyBase {}
    const first = new Local();

    Object.defineProperty(attachedProxy(first), 'shared', { value: 'yes', configurable: true });

    expect(Local.prototype).toHaveProperty('shared', 'yes');
    expect(new Local()).toHaveProperty('shared', 'yes');
  });

  it('makes Object.defineProperty throw a TypeError when _defineProperty reports failure', () => {
    class Frozen extends ProxyBase {
      protected override _defineProperty(): boolean {
        return false;
      }
    }

    expect(() => Object.defineProperty(attachedProxy(new Frozen()), 'anything', { value: 1 })).toThrow(TypeError);
  });
});

describe('setPrototypeOf', () => {
  it('replaces the attached proxy on the instance without consulting _setPrototypeOf', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    Object.setPrototypeOf(instance, Recording.prototype);

    expect(instance.calls).toEqual([]);
    expect(attachedProxy(instance)).toBe(Recording.prototype);
  });

  it('routes a setPrototypeOf on the attached proxy to _setPrototypeOf', () => {
    const instance = new Recording();
    instance.calls.length = 0;

    Reflect.setPrototypeOf(attachedProxy(instance), Object.getPrototypeOf(Recording.prototype));

    expect(instance.calls).toEqual([['_setPrototypeOf', ProxyBase.prototype]]);
  });

  it('re-parents the real prototype by default', () => {
    class Other extends ProxyBase {}
    class Local extends ProxyBase {}
    const instance = new Local();

    expect(Reflect.setPrototypeOf(attachedProxy(instance), Other.prototype)).toBe(true);
    expect(Object.getPrototypeOf(Local.prototype)).toBe(Other.prototype);
    expect(instance instanceof Other).toBe(true);
  });

  it('leaves every trap throwing once the real prototype is re-parented off the ProxyBase chain', () => {
    class Plain {}
    class Local extends ProxyBase {}
    const instance = new Local() as Local & Record<string, unknown>;
    Reflect.setPrototypeOf(attachedProxy(instance), Plain.prototype);

    expect(() => instance instanceof Local).toThrow(TypeError);
    expect(() => instance.anything).toThrow(TypeError);
  });

  it('makes Object.setPrototypeOf throw a TypeError when _setPrototypeOf reports failure', () => {
    class Pinned extends ProxyBase {
      protected override _setPrototypeOf(): boolean {
        return false;
      }
    }

    expect(() => Object.setPrototypeOf(attachedProxy(new Pinned()), null)).toThrow(TypeError);
  });
});

describe('isExtensible and preventExtensions', () => {
  it('reports and changes the real prototype extensibility by default', () => {
    class Local extends ProxyBase {}
    const instance = new Local();

    expect(Object.isExtensible(attachedProxy(instance))).toBe(true);
    expect(Reflect.preventExtensions(attachedProxy(instance))).toBe(true);
    expect(Object.isExtensible(Local.prototype)).toBe(false);
    expect(Object.isExtensible(attachedProxy(instance))).toBe(false);
  });

  it('routes both operations on the attached proxy to their hooks', () => {
    class Local extends Recording {}
    const instance = new Local();
    instance.calls.length = 0;

    Object.isExtensible(attachedProxy(instance));
    Object.preventExtensions(attachedProxy(instance));

    expect(instance.calls).toEqual([['_isExtensible'], ['_preventExtensions']]);
  });

  it('leaves the instance itself extensible', () => {
    class Local extends ProxyBase {}
    const instance = new Local() as Local & Record<string, unknown>;
    Object.preventExtensions(attachedProxy(instance));

    instance.fresh = 1;

    expect(instance.fresh).toBe(1);
  });

  it('makes Object.preventExtensions throw a TypeError when _preventExtensions reports failure', () => {
    class Open extends ProxyBase {
      protected override _preventExtensions(): boolean {
        return false;
      }
    }

    expect(() => Object.preventExtensions(attachedProxy(new Open()))).toThrow(TypeError);
  });
});

describe('proxy invariants against the real prototype', () => {
  it('throws when _ownKeys omits a non-configurable prototype property', () => {
    class Local extends ProxyBase {
      protected override _ownKeys(): ArrayLike<string | symbol> {
        return [];
      }
    }
    Object.defineProperty(Local.prototype, 'fixed', { value: 1, configurable: false });

    expect(() => Reflect.ownKeys(attachedProxy(new Local()))).toThrow(TypeError);
  });

  it('throws when _ownKeys adds a key to a non-extensible prototype', () => {
    class Local extends ProxyBase {
      protected override _ownKeys(): ArrayLike<string | symbol> {
        return [...super._ownKeys(), 'extra'];
      }
    }
    Object.preventExtensions(Local.prototype);

    expect(() => Reflect.ownKeys(attachedProxy(new Local()))).toThrow(TypeError);
  });

  it('throws when _getOwnPropertyDescriptor hides a non-configurable prototype property', () => {
    class Local extends ProxyBase {
      protected override _getOwnPropertyDescriptor(): PropertyDescriptor | undefined {
        return undefined;
      }
    }
    Object.defineProperty(Local.prototype, 'fixed', { value: 1, configurable: false });

    expect(() => Object.getOwnPropertyDescriptor(attachedProxy(new Local()), 'fixed')).toThrow(TypeError);
  });

  it('throws when _getOwnPropertyDescriptor reports a missing property as non-configurable', () => {
    class Local extends ProxyBase {
      protected override _getOwnPropertyDescriptor(): PropertyDescriptor | undefined {
        return { value: 1, configurable: false };
      }
    }

    expect(() => Object.getOwnPropertyDescriptor(attachedProxy(new Local()), 'virtual')).toThrow(TypeError);
  });

  it('throws when _deleteProperty claims to delete a non-configurable prototype property', () => {
    class Local extends ProxyBase {
      protected override _deleteProperty(): boolean {
        return true;
      }
    }
    Object.defineProperty(Local.prototype, 'fixed', { value: 1, configurable: false });

    expect(() => Reflect.deleteProperty(attachedProxy(new Local()), 'fixed')).toThrow(TypeError);
  });

  it('throws when _getPrototypeOf disagrees with a non-extensible prototype', () => {
    class Local extends ProxyBase {
      protected override _getPrototypeOf(): object | null {
        return null;
      }
    }
    Object.preventExtensions(Local.prototype);

    expect(() => Object.getPrototypeOf(attachedProxy(new Local()))).toThrow(TypeError);
  });

  it('throws when _isExtensible disagrees with the real prototype', () => {
    class Local extends ProxyBase {
      protected override _isExtensible(): boolean {
        return true;
      }
    }
    Object.preventExtensions(Local.prototype);

    expect(() => Object.isExtensible(attachedProxy(new Local()))).toThrow(TypeError);
  });

  it('throws when _preventExtensions reports success while the prototype stays extensible', () => {
    class Local extends ProxyBase {
      protected override _preventExtensions(): boolean {
        return true;
      }
    }

    expect(() => Object.preventExtensions(attachedProxy(new Local()))).toThrow(TypeError);
  });

  it('serves a non-configurable prototype property through get without consulting _get', () => {
    class Local extends Fallback {}
    Object.defineProperty(Local.prototype, 'fixed', { value: 'pinned', configurable: false });
    const instance = new Local() as Local & Record<string, unknown>;

    expect(instance.fixed).toBe('pinned');
    expect(instance.other).toBe('missing:other');
  });
});
