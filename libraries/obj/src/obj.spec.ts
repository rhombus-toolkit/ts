import { describe, expect, it } from 'bun:test';
import { obj } from './obj';

/** The fixture every `Object.*` counterpart is probed with: one key of each kind the runtime treats differently. */
function buildFixture() {
  const symbolKey = Symbol('hidden');
  const proto = { inherited: 'proto' };
  const fixture = Object.create(proto) as Record<PropertyKey, unknown>;
  Object.defineProperty(fixture, 'hiddenByFlag', { value: 'hidden', enumerable: false });
  Object.defineProperty(fixture, 'viaGetter', { get: () => 'computed', enumerable: true });
  fixture.b = 2;
  fixture[symbolKey] = 'symbol';
  fixture[10] = 'ten';
  fixture.a = 1;
  fixture[2] = 'two';
  return { fixture, symbolKey };
}

describe('obj.keys', () => {
  it('lists own enumerable string keys, integer keys first ascending then the rest in insertion order', () => {
    const { fixture } = buildFixture();
    expect(obj.keys(fixture)).toEqual(['2', '10', 'viaGetter', 'b', 'a']);
  });

  it('skips symbol keys, non-enumerable members and the prototype chain', () => {
    const { fixture, symbolKey } = buildFixture();
    const keys: readonly PropertyKey[] = obj.keys(fixture);
    expect(keys).not.toContain(symbolKey);
    expect(keys).not.toContain('hiddenByFlag');
    expect(keys).not.toContain('inherited');
  });

  it('returns a fresh mutable array each call', () => {
    const source = { a: 1 };
    expect(obj.keys(source)).not.toBe(obj.keys(source));
    expect(Array.isArray(obj.keys(source))).toBe(true);
  });

  it('lists array indices as strings', () => {
    expect(obj.keys(['x', 'y'])).toEqual(['0', '1']);
  });

  it('lists the own fields of a class instance and none of its prototype methods', () => {
    class Widget {
      size = 1;
      #secret = 2;
      grow(): number {
        return this.size + this.#secret;
      }
    }
    expect(obj.keys(new Widget())).toEqual(['size']);
  });

  it('reads a null-prototype object and a frozen object alike', () => {
    expect(obj.keys(Object.assign(Object.create(null), { a: 1 }))).toEqual(['a']);
    expect(obj.keys(Object.freeze({ a: 1 }))).toEqual(['a']);
  });

  it('returns an empty array for an empty object', () => {
    expect(obj.keys({})).toEqual([]);
  });
});

describe('obj.values', () => {
  it('lists the members behind the keys `obj.keys` lists, in the same order', () => {
    const { fixture } = buildFixture();
    expect(obj.values(fixture)).toEqual(['two', 'ten', 'computed', 2, 1]);
  });

  it('invokes an accessor once per call rather than copying the getter', () => {
    let reads = 0;
    const source = { get counted(): number {
      reads += 1;
      return reads;
    } };
    expect(obj.values(source)).toEqual([1]);
    expect(obj.values(source)).toEqual([2]);
  });

  it('keeps the member identity rather than cloning it', () => {
    const member = { nested: true };
    expect(obj.values({ member })[0]).toBe(member);
  });
});

describe('obj.entries', () => {
  it('pairs each key `obj.keys` lists with its member, in the same order', () => {
    const { fixture } = buildFixture();
    expect(obj.entries(fixture)).toEqual([['2', 'two'], ['10', 'ten'], ['viaGetter', 'computed'], ['b', 2], ['a', 1]]);
  });

  it('returns a fresh pair array per entry', () => {
    const source = { a: 1 };
    const [first] = obj.entries(source);
    const [again] = obj.entries(source);
    expect(first).toEqual(again);
    expect(first).not.toBe(again);
  });
});

describe('obj.fromEntries', () => {
  it('builds a plain object keyed by each pair', () => {
    const built = obj.fromEntries([['a', 1], ['b', 2]] as const);
    expect(built).toEqual({ a: 1, b: 2 });
    expect(Object.getPrototypeOf(built)).toBe(Object.prototype);
  });

  it('lets a later pair overwrite an earlier one with the same key', () => {
    expect(obj.fromEntries([['a', 1], ['a', 2]] as const)).toEqual({ a: 2 });
  });

  it('round-trips `obj.entries`', () => {
    const source = { a: 1, b: 'x', c: null };
    expect(obj.fromEntries(obj.entries(source))).toEqual(source);
  });

  it('returns an empty object for no pairs', () => {
    expect(obj.fromEntries([])).toEqual({});
  });

  it('defines the keys as writable enumerable data properties', () => {
    const built = obj.fromEntries([['a', 1]] as const);
    expect(Object.getOwnPropertyDescriptor(built, 'a')).toEqual({ value: 1, writable: true, enumerable: true,
      configurable: true });
  });
});

describe('obj.assign', () => {
  it('mutates and returns the target itself', () => {
    const target = { a: 1 };
    const result = obj.assign(target, { b: 2 });
    expect(result).toBe(target);
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it('lets each later source overwrite the one before it', () => {
    expect(obj.assign({ a: 1 }, { a: 2 }, { a: 3 })).toEqual({ a: 3 });
  });

  it('copies an explicit `undefined` over an existing member', () => {
    expect(obj.assign({ a: 1 }, { a: undefined })).toEqual({ a: undefined });
  });

  it('copies own enumerable string and symbol keys and nothing else', () => {
    const { fixture, symbolKey } = buildFixture();
    const result = obj.assign({}, fixture) as Record<PropertyKey, unknown>;
    expect(Object.keys(result)).toEqual(['2', '10', 'viaGetter', 'b', 'a']);
    expect(result[symbolKey]).toBe('symbol');
    expect('hiddenByFlag' in result).toBe(false);
    expect('inherited' in result).toBe(false);
  });

  it('copies the value an accessor yields rather than the accessor', () => {
    const source = { get computed(): string {
      return 'value';
    } };
    const result = obj.assign({}, source);
    expect(Object.getOwnPropertyDescriptor(result, 'computed')).toMatchObject({ value: 'value', writable: true });
  });

  it('merges shallowly, sharing nested members by reference', () => {
    const nested = { deep: 1 };
    const result = obj.assign({ nested: { other: 2 } }, { nested });
    expect(result.nested).toBe(nested);
  });

  it("overlays array sources index-wise, leaving a short overlay's tail alone", () => {
    expect(obj.assign([1, 2, 3], ['x'])).toEqual(['x', 2, 3]);
    expect(obj.assign(['a'], ['b', 'c'])).toEqual(['b', 'c']);
  });

  it('skips `null` and `undefined` sources', () => {
    expect(obj.assign({ a: 1 }, null as any, undefined as any)).toEqual({ a: 1 });
  });

  it('throws a TypeError when the target is frozen and a source carries a key', () => {
    expect(() => obj.assign(Object.freeze({ a: 1 }), { a: 2 })).toThrow(TypeError);
  });

  it('runs a setter on the target for a key it already defines as an accessor', () => {
    const seen: unknown[] = [];
    const target = { set tracked(value: unknown) {
      seen.push(value);
    } };
    obj.assign(target, { tracked: 'first' }, { tracked: 'second' });
    expect(seen).toEqual(['first', 'second']);
  });
});

describe('obj.mapEntries', () => {
  it('hands every pair to `fn` and keys the result by what each call returns', () => {
    const result = obj.mapEntries({ a: 1, b: 2 }, ([key, value]) => [`${key}${value}`, value * 10] as const);
    expect(result).toEqual({ a1: 10, b2: 20 });
  });

  it('receives pairs in the order `obj.entries` lists them', () => {
    const seen: string[] = [];
    obj.mapEntries({ b: 1, 2: 1, a: 1 }, ([key]) => {
      seen.push(key);
      return [key, null] as const;
    });
    expect(seen).toEqual(['2', 'b', 'a']);
  });

  it('lets a later pair overwrite an earlier one mapped to the same key', () => {
    expect(obj.mapEntries({ a: 1, b: 2 }, ([, value]) => ['same', value] as const)).toEqual({ same: 2 });
  });

  it('returns a fresh plain object and leaves the source untouched', () => {
    const source = { a: 1 };
    const result = obj.mapEntries(source, entry => entry);
    expect(result).toEqual(source);
    expect(result).not.toBe(source);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('returns an empty object for an empty source without calling `fn`', () => {
    let calls = 0;
    const result = obj.mapEntries({}, entry => {
      calls += 1;
      return entry;
    });
    expect(result).toEqual({});
    expect(calls).toBe(0);
  });

  it('never sees symbol-keyed, non-enumerable or inherited members', () => {
    const { fixture } = buildFixture();
    const seen: string[] = [];
    obj.mapEntries(fixture as Record<string, unknown>, ([key]) => {
      seen.push(key);
      return [key, null] as const;
    });
    expect(seen).toEqual(['2', '10', 'viaGetter', 'b', 'a']);
  });
});

describe('obj.mapValues', () => {
  it('replaces every member by what `fn` returns for its pair, keys untouched', () => {
    const result = obj.mapValues({ a: 1, b: 2 }, ([key, value]) => `${key}=${value}`);
    expect(result).toEqual({ a: 'a=1', b: 'b=2' });
  });

  it('keeps the key order `obj.keys` lists', () => {
    expect(Object.keys(obj.mapValues({ b: 1, 2: 1, a: 1 }, () => 0))).toEqual(['2', 'b', 'a']);
  });

  it('returns a fresh plain object and leaves the source untouched', () => {
    const source = { a: 1 };
    const result = obj.mapValues(source, ([, value]) => value + 1);
    expect(source).toEqual({ a: 1 });
    expect(result).toEqual({ a: 2 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  });

  it('returns an empty object for an empty source without calling `fn`', () => {
    let calls = 0;
    expect(obj.mapValues({}, () => {
      calls += 1;
      return 0;
    })).toEqual({});
    expect(calls).toBe(0);
  });

  it('keeps an `undefined` result as a present key', () => {
    const result = obj.mapValues({ a: 1 }, () => undefined);
    expect('a' in result).toBe(true);
    expect(result.a).toBeUndefined();
  });
});
