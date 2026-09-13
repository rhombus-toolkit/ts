import { describe, expect, it } from 'bun:test';
import { WeakValuedMap } from './WeakValuedMap';

function endJob(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('WeakValuedMap', () => {
  it('stores and retrieves values', () => {
    const m = new WeakValuedMap<string, { n: number; }>();
    const v = { n: 1 };
    m.set('k', v);

    expect(m.get('k')).toBe(v);
    expect(m.has('k')).toBe(true);
    expect(m.delete('k')).toBe(true);
    expect(m.get('k')).toBeUndefined();
  });

  it('seeds from an iterable of entries in order', () => {
    const a = {};
    const b = {};
    const m = new WeakValuedMap<string, object>([['a', a], ['b', b]]);

    expect([...m.keys()]).toEqual(['a', 'b']);
    expect(m.get('a')).toBe(a);
    expect(m.get('b')).toBe(b);
  });

  it('overwriting a live value keeps the replacement when the old one is collected', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('k', { first: new Array(10000).fill(0) });
    const kept = { second: true };
    m.set('k', kept);

    await endJob();
    Bun.gc(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Without unregistering the old value in set(), its finalizer would have
    // evicted this live entry.
    expect(m.get('k')).toBe(kept);
  });

  it('a stale finalizer does not evict a key rebound during the collection window', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('k', { v: 1 });

    await endJob(); // end the job that created the WeakRef, clearing [[KeptAlive]]
    Bun.gc(true); // collect v1; its finalizer is queued but cannot run mid-job

    // Rebind inside the window. set() cannot unregister the dead value -- the
    // unregister token *was* the value -- so only the finalizer's liveness
    // check protects this entry.
    const v2 = { v: 2 };
    m.set('k', v2);

    await new Promise((resolve) => setTimeout(resolve, 50)); // let the stale finalizer fire

    expect(m.get('k')).toBe(v2);
  });

  it('every read skips an entry collected but not yet finalized', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('gone', { v: 1 });
    const kept = { v: 2 };
    m.set('kept', kept);

    await endJob();
    Bun.gc(true);

    // Synchronous observation: the cleanup callback has not run, so the map
    // still holds the dead ref -- and no read may let it show through.
    expect(m.has('gone')).toBe(false);
    expect(m.size).toBe(1);
    expect([...m.keys()]).toEqual(['kept']);
    expect([...m.values()]).toEqual([kept]);
    expect([...m.entries()]).toEqual([['kept', kept]]);
    expect(m.delete('gone')).toBe(false);
  });

  it('clear() empties the map even across dead entries', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('gone', { v: 1 });
    const kept = { v: 2 };
    m.set('kept', kept);

    await endJob();
    Bun.gc(true);

    m.clear();
    expect(m.size).toBe(0);
    expect(m.get('kept')).toBeUndefined();
    expect(kept).toEqual({ v: 2 });
  });

  it('starts empty', () => {
    const m = new WeakValuedMap<string, object>();

    expect(m.size).toBe(0);
    expect(m.get('absent')).toBeUndefined();
    expect(m.has('absent')).toBe(false);
    expect([...m]).toEqual([]);
  });

  it('delete returns false for a key never set', () => {
    expect(new WeakValuedMap<string, object>().delete('absent')).toBe(false);
  });

  it('set returns the map itself so calls chain', () => {
    const m = new WeakValuedMap<string, object>();
    const a = {};
    const b = {};

    expect(m.set('a', a)).toBe(m);
    expect(m.set('a', a).set('b', b).size).toBe(2);
  });

  it('re-setting a live key keeps one entry holding the replacement', () => {
    const m = new WeakValuedMap<string, object>();
    const first = { first: true };
    const second = { second: true };
    m.set('k', first);
    m.set('k', second);

    expect(m.size).toBe(1);
    expect(m.get('k')).toBe(second);
    expect([...m.values()]).toEqual([second]);
    expect(m.delete('k')).toBe(true);
    expect(m.delete('k')).toBe(false);
  });

  it('keeps the same value reachable under a second key after the first is deleted', () => {
    const m = new WeakValuedMap<string, object>();
    const shared = {};
    m.set('a', shared);
    m.set('b', shared);

    expect(m.delete('a')).toBe(true);
    expect(m.get('b')).toBe(shared);
    expect(m.size).toBe(1);
  });

  it('iterates entries in insertion order through every view', () => {
    const m = new WeakValuedMap<string, object>();
    const one = { n: 1 };
    const two = { n: 2 };
    const three = { n: 3 };
    m.set('one', one).set('two', two).set('three', three);

    expect([...m.keys()]).toEqual(['one', 'two', 'three']);
    expect([...m.values()]).toEqual([one, two, three]);
    expect([...m.entries()]).toEqual([['one', one], ['two', two], ['three', three]]);
    expect([...m]).toEqual([...m.entries()]);
  });

  it('keeps an existing key in its place when set again, as Map does', () => {
    const m = new WeakValuedMap<string, object>();
    m.set('one', { n: 1 }).set('two', { n: 2 }).set('three', { n: 3 });
    const replacement = { n: 11 };
    m.set('one', replacement);

    expect([...m.keys()]).toEqual(['one', 'two', 'three']);
    expect(m.get('one')).toBe(replacement);
  });

  it('a value shared by two keys is finalized under both once it is collected', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('a', { shared: true });
    m.set('b', m.get('a')!);
    m.delete('a');

    await endJob();
    Bun.gc(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    // The finalizer for 'b' still fires: deleting 'a' unregistered only 'a'.
    expect(m.has('b')).toBe(false);
    expect([...m.keys()]).toEqual([]);
  });

  it('the views are iterators with the iterator helpers attached', () => {
    const m = new WeakValuedMap<string, { n: number; }>();
    m.set('one', { n: 1 }).set('two', { n: 2 });

    expect(m.values().map(value => value.n).toArray()).toEqual([1, 2]);
    expect(m.keys().some(key => key === 'two')).toBe(true);
  });

  it('forEach visits every live entry with value, key and the map itself', () => {
    const m = new WeakValuedMap<string, object>();
    const a = {};
    const b = {};
    m.set('a', a).set('b', b);
    const visited: Array<[object, string, unknown]> = [];

    m.forEach((value, key, map) => {
      visited.push([value, key, map]);
    });

    expect(visited).toEqual([[a, 'a', m], [b, 'b', m]]);
  });

  it('forEach binds the callback to thisArg', () => {
    const m = new WeakValuedMap<string, object>();
    m.set('a', {});
    const receiver = {};
    let seen: unknown;

    m.forEach(function(this: unknown) {
      seen = this;
    }, receiver);

    expect(seen).toBe(receiver);
  });

  it('forEach skips an entry collected but not yet finalized', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('gone', { v: 1 });
    const kept = { v: 2 };
    m.set('kept', kept);

    await endJob();
    Bun.gc(true);

    const visited: string[] = [];
    m.forEach((_value, key) => {
      visited.push(key);
    });

    expect(visited).toEqual(['kept']);
    expect(m.get('kept')).toBe(kept);
  });

  it('re-setting a key whose value was collected but not yet finalized keeps the replacement', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('k', { v: 1 });

    await endJob();
    Bun.gc(true);

    const replacement = { v: 2 };
    m.set('k', replacement);

    expect(m.get('k')).toBe(replacement);
    expect(m.size).toBe(1);
    expect([...m.keys()]).toEqual(['k']);
  });

  it('clear() empties a map of live entries and lets them be set again', () => {
    const m = new WeakValuedMap<string, object>();
    const a = {};
    m.set('a', a).set('b', {});

    m.clear();

    expect(m.size).toBe(0);
    expect(m.has('a')).toBe(false);
    expect([...m]).toEqual([]);
    expect(m.set('a', a).get('a')).toBe(a);
  });

  it('a value rebound after clear() survives the collection of the value it replaced', async () => {
    const m = new WeakValuedMap<string, object>();
    m.set('k', { first: new Array(10000).fill(0) });
    m.clear();
    const kept = { second: true };
    m.set('k', kept);

    await endJob();
    Bun.gc(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(m.get('k')).toBe(kept);
  });

  it('accepts any weakly holdable value, symbols included', () => {
    const m = new WeakValuedMap<string, symbol | object>();
    const tag = Symbol('tag');
    const fn = () => undefined;
    m.set('symbol', tag).set('function', fn);

    expect(m.get('symbol')).toBe(tag);
    expect(m.get('function')).toBe(fn);
  });

  it('rejects a value that cannot be held weakly', () => {
    const m = new WeakValuedMap<string, WeakKey>();

    expect(() => m.set('k', Symbol.for('registered'))).toThrow(TypeError);
    expect(() => m.set('k', 1 as unknown as WeakKey)).toThrow(TypeError);
    expect(m.has('k')).toBe(false);
  });

  it('reports its tag through Object.prototype.toString', () => {
    const m = new WeakValuedMap<string, object>();

    expect(m[Symbol.toStringTag]).toBe('WeakValuedMap');
    expect(Object.prototype.toString.call(m)).toBe('[object WeakValuedMap]');
  });

  it('holds keys strongly and compares them by identity', () => {
    const m = new WeakValuedMap<object, object>();
    const value = {};
    m.set({ id: 1 }, value);

    expect(m.get({ id: 1 })).toBeUndefined();
    expect(m.size).toBe(1);
  });

  it('holds primitive keys by value the way Map does', () => {
    const m = new WeakValuedMap<unknown, object>();
    const value = {};
    m.set(NaN, value);
    m.set(0, value);

    expect(m.get(NaN)).toBe(value);
    expect(m.get(-0)).toBe(value);
    expect(m.size).toBe(2);
  });
});
