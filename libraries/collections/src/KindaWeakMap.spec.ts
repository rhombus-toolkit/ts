import type { Func } from '@rhombus-toolkit/types';
import { describe, expect, it } from 'bun:test';
import { KindaWeakMap } from './KindaWeakMap';

describe('KindaWeakMap', () => {
  it('stores a value under an object key', () => {
    const map = new KindaWeakMap<object, number>();
    const key = {};

    map.set(key, 1);

    expect(map.get(key)).toBe(1);
    expect(map.has(key)).toBe(true);
  });

  it('stores a value under a string key', () => {
    const map = new KindaWeakMap<string, number>();

    map.set('a', 1);

    expect(map.get('a')).toBe(1);
    expect(map.has('a')).toBe(true);
  });

  it('stores a value under a number key', () => {
    const map = new KindaWeakMap<number, string>();

    map.set(1, 'one');

    expect(map.get(1)).toBe('one');
    expect(map.has(1)).toBe(true);
  });

  it('stores a value under undefined and null keys', () => {
    const map = new KindaWeakMap<unknown, string>();

    map.set(undefined, 'u');
    map.set(null, 'n');

    expect(map.get(undefined)).toBe('u');
    expect(map.get(null)).toBe('n');
  });

  it('stores a value under a function key', () => {
    const map = new KindaWeakMap<Func<[], void>, number>();
    const key = () => undefined;

    map.set(key, 1);

    expect(map.get(key)).toBe(1);
  });

  it('stores a value under an unregistered symbol', () => {
    const map = new KindaWeakMap<symbol, number>();
    const key = Symbol('k');

    map.set(key, 1);

    expect(map.get(key)).toBe(1);
  });

  it('stores a value under a registered symbol without throwing', () => {
    const map = new KindaWeakMap<symbol, number>();
    const key = Symbol.for('registered');

    expect(() => map.set(key, 1)).not.toThrow();
    expect(map.get(key)).toBe(1);
  });

  it('treats a stored undefined as an entry', () => {
    const map = new KindaWeakMap<string, undefined>();

    map.set('k', undefined);

    expect(map.has('k')).toBe(true);
    expect(map.get('k')).toBeUndefined();
  });

  it('hands back the very object stored', () => {
    const map = new KindaWeakMap<string, object>();
    const built = { built: true };

    map.set('a', {});
    map.set('k', built);

    expect(map.get('k')).toBe(built);
  });

  it('returns itself from set', () => {
    const map = new KindaWeakMap<string, number>();

    expect(map.set('k', 1)).toBe(map);
  });

  it('deletes an entry and reports whether there was one', () => {
    const map = new KindaWeakMap<string, number>();

    map.set('k', 1);

    expect(map.delete('k')).toBe(true);
    expect(map.has('k')).toBe(false);
    expect(map.delete('k')).toBe(false);
  });

  it('inserts the given value only when there is no entry', () => {
    const map = new KindaWeakMap<string, number>();

    expect(map.getOrInsert('k', 1)).toBe(1);
    expect(map.getOrInsert('k', 2)).toBe(1);
    expect(map.get('k')).toBe(1);
  });

  it('computes an entry from the key only when there is none', () => {
    const map = new KindaWeakMap<string, string>();
    const seen: string[] = [];

    const first = map.getOrInsertComputed('k', (key) => {
      seen.push(key);
      return 'computed';
    });
    const second = map.getOrInsertComputed('k', () => 'recomputed');

    expect(first).toBe('computed');
    expect(second).toBe('computed');
    expect(seen).toEqual(['k']);
  });

  it('stores nothing when compute throws', () => {
    const map = new KindaWeakMap<string, number>();

    expect(() =>
      map.getOrInsertComputed('k', () => {
        throw new Error('nope');
      })
    ).toThrow('nope');
    expect(map.has('k')).toBe(false);
  });

  it('runs compute unbound', () => {
    const map = new KindaWeakMap<string, unknown>();
    let seen: unknown = 'unset';

    map.getOrInsertComputed('k', function(this: unknown) {
      seen = this;
    });

    expect(seen).toBeUndefined();
  });

  it('reports its tag to Object.prototype.toString', () => {
    expect(Object.prototype.toString.call(new KindaWeakMap())).toBe('[object KindaWeakMap]');
  });

  it('forgets an entry along with an object key once nothing else holds the key', async () => {
    let collected = false;
    const registry = new FinalizationRegistry(() => {
      collected = true;
    });
    const map = new KindaWeakMap<object, number[]>();

    (() => {
      const dying = {};
      registry.register(dying, undefined);
      map.set(dying, new Array(10000).fill(0));
    })();

    // A single Bun.gc(true) can miss an object a stale native-stack reference still holds
    // (the collector scans the stack conservatively), so keep collecting until it lets go.
    const deadline = Date.now() + 2000;
    while (!collected && Date.now() < deadline) {
      Bun.gc(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(collected).toBe(true);
  });

  it('counts strong and weak entries together in size', () => {
    const map = new KindaWeakMap<unknown, number>();

    map.set('a', 1);
    map.set({}, 2);

    expect(map.size).toBe(2);
  });

  it('lowers size on delete of either kind', () => {
    const map = new KindaWeakMap<unknown, number>();
    const key = {};
    map.set('a', 1);
    map.set(key, 2);

    map.delete('a');
    expect(map.size).toBe(1);

    map.delete(key);
    expect(map.size).toBe(0);
  });

  it('does not raise size when a weak key is set again', () => {
    const map = new KindaWeakMap<object, number>();
    const key = {};

    map.set(key, 1);
    map.set(key, 2);

    expect(map.size).toBe(1);
  });

  it('counts a weak key once through a delete and re-set', () => {
    const map = new KindaWeakMap<object, number>();
    const key = {};

    map.set(key, 1);
    map.delete(key);
    map.set(key, 2);

    expect(map.size).toBe(1);
  });

  it('lowers size once a weakly held key is collected', async () => {
    const map = new KindaWeakMap<object, number[]>();

    (() => {
      map.set({}, new Array(10000).fill(0));
    })();

    expect(map.size).toBe(1);

    // A single Bun.gc(true) can miss an object a stale native-stack reference still holds
    // (the collector scans the stack conservatively), so keep collecting until it lets go.
    const deadline = Date.now() + 2000;
    while (map.size !== 0 && Date.now() < deadline) {
      Bun.gc(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(map.size).toBe(0);
  });
});
