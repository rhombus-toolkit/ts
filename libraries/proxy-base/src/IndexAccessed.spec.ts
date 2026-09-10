import { describe, expect, it } from 'bun:test';
import Default, { IndexAccessed, type Indexed } from './IndexAccessed';

/** A Map-backed indexer that also records every hook call as `[name, ...args]`. */
class Env extends IndexAccessed<string> {
  readonly calls: unknown[][] = [];
  readonly #store = new Map<PropertyKey, string>();

  protected override _getIndex(key: PropertyKey): string {
    this.calls.push(['_getIndex', key]);
    return this.#store.get(key) ?? `unset:${String(key)}`;
  }

  protected override _setIndex(key: PropertyKey, value: string): string {
    this.calls.push(['_setIndex', key, value]);
    this.#store.set(key, value);
    return value;
  }

  /** A real prototype member, so hits can be told apart from misses. */
  realMethod(): string {
    return 'real';
  }
}

function makeEnv(): Indexed<Env, string> {
  return new Env() as Indexed<Env, string>;
}

describe('module exports', () => {
  it('exports the class as both the named and the default export', () => {
    expect(Default).toBe(IndexAccessed);
  });
});

describe('prototype chain', () => {
  it('splices a proxy between the instance and its real prototype', () => {
    const env = makeEnv();

    expect(Object.getPrototypeOf(env)).not.toBe(Env.prototype);
    expect(Object.getPrototypeOf(Object.getPrototypeOf(env))).toBe(Env.prototype);
  });

  it('attaches a distinct proxy per instance', () => {
    expect(Object.getPrototypeOf(makeEnv())).not.toBe(Object.getPrototypeOf(makeEnv()));
  });

  it('keeps instanceof true for the subclass and the base', () => {
    const env = makeEnv();

    expect(env instanceof Env).toBe(true);
    expect(env instanceof IndexAccessed).toBe(true);
    expect(Env.prototype.isPrototypeOf(env)).toBe(true);
  });

  it('resolves indexer overrides through a multi-level subclass chain', () => {
    class Leaf extends Env {}
    const leaf = new Leaf() as Indexed<Leaf, string>;

    leaf.HOME = '/home';

    expect(leaf.HOME).toBe('/home');
    expect(leaf instanceof Env).toBe(true);
  });
});

describe('reads', () => {
  it('routes a read that misses the instance and its real chain to _getIndex', () => {
    const env = makeEnv();

    expect(env.HOME).toBe('unset:HOME');
    expect(env.calls).toEqual([['_getIndex', 'HOME']]);
  });

  it('passes symbol keys to _getIndex', () => {
    const env = makeEnv();

    void (env as unknown as Record<symbol, unknown>)[Symbol.iterator];

    expect(env.calls).toEqual([['_getIndex', Symbol.iterator]]);
  });

  it('serves an own property without consulting _getIndex', () => {
    const env = makeEnv();
    Object.defineProperty(env, 'own', { value: 'mine' });

    expect(env.own).toBe('mine');
    expect(env.calls).toEqual([]);
  });

  it('serves a real prototype member without consulting _getIndex', () => {
    const env = makeEnv();

    expect(env.realMethod()).toBe('real');
    expect(env.toString).toBe(Object.prototype.toString);
    expect(env.calls).toEqual([]);
  });

  it('binds this to the constructed instance even when read through a derived object', () => {
    const env = makeEnv();
    const derived = Object.create(env) as Record<string, unknown>;

    expect(derived.HOME).toBe('unset:HOME');
    expect(env.calls).toEqual([['_getIndex', 'HOME']]);
  });

  it('lets await resolve the instance when _getIndex answers the then probe with a non-callable', async () => {
    const env = makeEnv();

    expect(await env).toBe(env);
  });
});

describe('writes', () => {
  it('routes an assignment to a missing property to _setIndex', () => {
    const env = makeEnv();

    env.HOME = '/home';

    expect(env.calls).toEqual([['_setIndex', 'HOME', '/home']]);
  });

  it('creates no own property, so every later read still consults _getIndex', () => {
    const env = makeEnv();

    env.HOME = '/home';
    env.calls.length = 0;

    expect(env.HOME).toBe('/home');
    expect(Object.keys(env)).toEqual(['calls']);
    expect(env.calls).toEqual([['_getIndex', 'HOME']]);
  });

  it('reports success regardless of what _setIndex returns', () => {
    class Silent extends IndexAccessed<unknown> {
      protected override _getIndex(): unknown {
        return undefined;
      }

      protected override _setIndex(): unknown {
        return undefined;
      }
    }
    const silent = new Silent() as Indexed<Silent, unknown>;

    expect(() => {
      silent.anything = 1;
    }).not.toThrow();
    expect(Reflect.set(silent, 'anything', 1)).toBe(true);
  });

  it('routes a constructor-body assignment through _setIndex', () => {
    class Assigning extends Env {
      constructor() {
        super();
        (this as Indexed<Assigning, string>).fromCtor = 'ctor';
      }
    }
    const instance = new Assigning();

    expect(instance.calls).toEqual([['_setIndex', 'fromCtor', 'ctor']]);
  });

  it('never routes a class field declaration through _setIndex', () => {
    class Declaring extends Env {
      declared = 'field';
    }
    const instance = new Declaring();

    expect(instance.declared).toBe('field');
    expect(instance.calls).toEqual([]);
  });

  it('writes an own property without consulting _setIndex', () => {
    const env = makeEnv();
    Object.defineProperty(env, 'own', { value: 'mine', writable: true });

    env.own = 'changed';

    expect(env.own).toBe('changed');
    expect(env.calls).toEqual([]);
  });

  it('writes a real prototype accessor without consulting _setIndex', () => {
    let stored: unknown;
    class Accessor extends Env {
      set real(value: unknown) {
        stored = value;
      }
    }
    const instance = new Accessor();

    instance.real = 'value';

    expect(stored).toBe('value');
    expect(instance.calls).toEqual([]);
  });
});

describe('operations the indexer does not serve', () => {
  it('answers in from the instance and its real chain only', () => {
    const env = makeEnv();
    env.HOME = '/home';

    expect('HOME' in env).toBe(false);
    expect('realMethod' in env).toBe(true);
    expect(env.calls).toEqual([['_setIndex', 'HOME', '/home']]);
  });

  it('lists only real own properties through Object.keys and for...in', () => {
    const env = makeEnv();
    env.HOME = '/home';
    const seen: string[] = [];

    for (const key in env) {
      seen.push(key);
    }

    expect(Object.keys(env)).toEqual(['calls']);
    expect(seen).toEqual(['calls']);
  });

  it('deletes nothing from the store', () => {
    const env = makeEnv();
    env.HOME = '/home';

    expect(delete env.HOME).toBe(true);
    expect(env.HOME).toBe('/home');
  });

  it('exposes the real prototype own keys through the attached proxy', () => {
    const env = makeEnv();

    expect(Reflect.ownKeys(Object.getPrototypeOf(env))).toEqual(Reflect.ownKeys(Env.prototype));
  });
});
