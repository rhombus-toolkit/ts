import { describe, expect, it } from 'bun:test';
import { MultiKeyWeakMap } from './MultiKeyWeakMap';

describe('MultiKeyWeakMap', () => {
  it('stores a value under a tuple of keys', () => {
    const map = new MultiKeyWeakMap<[object, object], number>();
    const a = {};
    const b = {};

    map.set([a, b], 1);

    expect(map.get([a, b])).toBe(1);
    expect(map.has([a, b])).toBe(true);
  });

  it('matches a tuple key by key, not by the tuple object', () => {
    const map = new MultiKeyWeakMap<[object, object], number>();
    const a = {};
    const b = {};
    const stored: [object, object] = [a, b];
    const asked: [object, object] = [a, b];

    map.set(stored, 1);

    expect(map.get(asked)).toBe(1);
  });

  it('keeps the same keys in another order apart', () => {
    const map = new MultiKeyWeakMap<[object, object], number>();
    const a = {};
    const b = {};

    map.set([a, b], 1);

    expect(map.get([b, a])).toBeUndefined();
    expect(map.has([b, a])).toBe(false);
  });

  it('keeps a tuple and its prefix apart', () => {
    const map = new MultiKeyWeakMap<object[], number>();
    const a = {};
    const b = {};

    map.set([a], 1);
    map.set([a, b], 2);

    expect(map.get([a])).toBe(1);
    expect(map.get([a, b])).toBe(2);
  });

  it('keys by the empty tuple', () => {
    const map = new MultiKeyWeakMap<object[], number>();

    map.set([], 1);

    expect(map.get([])).toBe(1);
    expect(map.has([])).toBe(true);
  });

  it('round-trips a tuple mixing an object and primitives', () => {
    const map = new MultiKeyWeakMap<[object, string, number], string>();
    const a = {};

    map.set([a, 'x', 1], 'mixed');

    expect(map.get([a, 'x', 1])).toBe('mixed');
    expect(map.has([a, 'x', 1])).toBe(true);
  });

  it('round-trips an all-primitive tuple', () => {
    const map = new MultiKeyWeakMap<[string, number], string>();

    map.set(['x', 1], 'primitives');

    expect(map.get(['x', 1])).toBe('primitives');
    expect(map.has(['x', 1])).toBe(true);
  });

  it('treats a stored undefined as an entry', () => {
    const map = new MultiKeyWeakMap<[object], undefined>();
    const key = {};

    map.set([key], undefined);

    expect(map.has([key])).toBe(true);
    expect(map.get([key])).toBeUndefined();
  });

  it('hands back the very object stored', () => {
    const map = new MultiKeyWeakMap<[object], object>();
    const built = { built: true };

    map.set([{}], built);
    const key = {};
    map.set([key], built);

    expect(map.get([key])).toBe(built);
  });

  it('returns itself from set', () => {
    const map = new MultiKeyWeakMap<[object], number>();

    expect(map.set([{}], 1)).toBe(map);
  });

  it('deletes an entry and reports whether there was one', () => {
    const map = new MultiKeyWeakMap<[object, object], number>();
    const a = {};
    const b = {};

    map.set([a, b], 1);

    expect(map.delete([a, b])).toBe(true);
    expect(map.has([a, b])).toBe(false);
    expect(map.delete([a, b])).toBe(false);
    expect(map.delete([b, a])).toBe(false);
  });

  it('leaves longer tuples through the deleted keys in place', () => {
    const map = new MultiKeyWeakMap<object[], number>();
    const a = {};
    const b = {};

    map.set([a], 1);
    map.set([a, b], 2);
    map.delete([a]);

    expect(map.get([a])).toBeUndefined();
    expect(map.get([a, b])).toBe(2);
  });

  it('inserts the given value only when there is no entry', () => {
    const map = new MultiKeyWeakMap<[object], number>();
    const key = {};

    expect(map.getOrInsert([key], 1)).toBe(1);
    expect(map.getOrInsert([key], 2)).toBe(1);
    expect(map.get([key])).toBe(1);
  });

  it('computes an entry from the tuple only when there is none', () => {
    const map = new MultiKeyWeakMap<[object, object], string>();
    const a = {};
    const b = {};
    const seen: Array<readonly object[]> = [];

    const first = map.getOrInsertComputed([a, b], (keys) => {
      seen.push(keys);
      return 'computed';
    });
    const second = map.getOrInsertComputed([a, b], () => 'recomputed');

    expect(first).toBe('computed');
    expect(second).toBe('computed');
    expect(seen).toEqual([[a, b]]);
  });

  it('stores nothing when compute throws', () => {
    const map = new MultiKeyWeakMap<[object], number>();
    const key = {};

    expect(() =>
      map.getOrInsertComputed([key], () => {
        throw new Error('nope');
      })
    ).toThrow('nope');
    expect(map.has([key])).toBe(false);
  });

  it('runs compute unbound', () => {
    const map = new MultiKeyWeakMap<[object], unknown>();
    let seen: unknown = 'unset';

    map.getOrInsertComputed([{}], function(this: unknown) {
      seen = this;
    });

    expect(seen).toBeUndefined();
  });

  it('reports its tag to Object.prototype.toString', () => {
    expect(Object.prototype.toString.call(new MultiKeyWeakMap())).toBe('[object MultiKeyWeakMap]');
  });

  it('accepts a registered symbol as a key', () => {
    const map = new MultiKeyWeakMap<[symbol], number>();

    expect(() => map.set([Symbol.for('registered')], 1)).not.toThrow();
    expect(map.get([Symbol.for('registered')])).toBe(1);
  });

  it('forgets an entry along with a weakly held key once nothing else holds it', async () => {
    let collected = false;
    const registry = new FinalizationRegistry(() => {
      collected = true;
    });
    const map = new MultiKeyWeakMap<[object, string, object], number[]>();
    const kept = {};

    (() => {
      const dying = {};
      registry.register(dying, undefined);
      map.set([kept, 'label', dying], new Array(10000).fill(0));
    })();

    // A single Bun.gc(true) can miss an object a stale native-stack slot still references
    // (the collector scans the stack conservatively), so keep collecting until it lets go.
    const deadline = Date.now() + 2000;
    while (!collected && Date.now() < deadline) {
      Bun.gc(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(collected).toBe(true);
  });

  it('releases a primitive prefix once the only tuple through it is deleted', () => {
    const map = new MultiKeyWeakMap<[number, number], string>();

    map.set([1, 2], 'a');
    map.delete([1, 2]);

    expect(map._root.next.size).toBe(0);
  });

  it('keeps a shorter tuple through the deleted keys and its node', () => {
    const map = new MultiKeyWeakMap<number[], string>();

    map.set([1], 'short');
    map.set([1, 2], 'long');
    map.delete([1, 2]);

    expect(map.get([1])).toBe('short');
    expect(map._root.next.size).toBe(1);
  });

  it("keeps a sibling tuple sharing the deleted tuple's prefix", () => {
    const map = new MultiKeyWeakMap<[number, string | object], string>();
    const obj = {};

    map.set([1, obj], 'kept');
    map.set([1, 'x'], 'gone');
    map.delete([1, 'x']);

    expect(map.get([1, obj])).toBe('kept');
  });

  it('deletes a tuple and lets it be set again', () => {
    const map = new MultiKeyWeakMap<[number, number], string>();

    map.set([1, 2], 'a');
    map.delete([1, 2]);
    map.set([1, 2], 'b');

    expect(map.get([1, 2])).toBe('b');
  });

  it('prunes nothing when deleting a tuple that was never set', () => {
    const map = new MultiKeyWeakMap<[number, number], string>();

    map.set([1, 2], 'a');

    expect(map.delete([1, 3])).toBe(false);
    expect(map.get([1, 2])).toBe('a');
  });

  it('deletes the empty tuple without touching the root', () => {
    const map = new MultiKeyWeakMap<[], string>();

    map.set([], 'a');

    expect(map.delete([])).toBe(true);
    expect(map.get([])).toBeUndefined();
  });
});
