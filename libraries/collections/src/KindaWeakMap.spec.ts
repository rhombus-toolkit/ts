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
    const lost = Promise.withResolvers<void>();
    const registry = new FinalizationRegistry(() => lost.resolve());
    const map = new KindaWeakMap<object, number[]>();

    (() => {
      const dying = {};
      registry.register(dying, undefined);
      map.set(dying, new Array(10000).fill(0));
    })();

    await new Promise((resolve) => setTimeout(resolve));
    Bun.gc(true);

    await Promise.race([lost.promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('the key was not collected')), 500))]);
  });
});
