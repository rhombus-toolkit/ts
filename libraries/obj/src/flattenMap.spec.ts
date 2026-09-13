import { describe, expect, it } from 'bun:test';
import { flattenMap } from './flattenMap';

describe('flattenMap (runtime)', () => {
  it('passes a flat map through unchanged, preserving leaf identity', () => {
    const a = (): void => undefined;
    const b = (): void => undefined;
    const result = flattenMap({ a, b } as any);

    expect(Object.keys(result).sort()).toEqual(['a', 'b']);
    expect((result as any).a).toBe(a);
    expect((result as any).b).toBe(b);
  });

  it('flattens nested maps into dot-joined keys', () => {
    const c = (): void => undefined;
    const result = flattenMap({ b: { c } } as any);

    expect(Object.keys(result)).toEqual(['b.c']);
    expect((result as any)['b.c']).toBe(c);
  });

  it('flattens 3+ levels deep', () => {
    const e = (): void => undefined;
    const result = flattenMap({ a: { b: { d: { e } } } } as any);

    expect(Object.keys(result)).toEqual(['a.b.d.e']);
    expect((result as any)['a.b.d.e']).toBe(e);
  });

  it('handles mixed-depth siblings', () => {
    const top = (): void => undefined;
    const deep = (): void => undefined;
    const result = flattenMap({ top, group: { nested: { deep } } } as any) as any;

    expect(new Set(Object.keys(result))).toEqual(new Set(['top', 'group.nested.deep']));
    expect(result.top).toBe(top);
    expect(result['group.nested.deep']).toBe(deep);
  });

  it('returns an empty object for an empty map', () => {
    const result = flattenMap({} as any);
    expect(Object.keys(result)).toEqual([]);
  });

  it('contributes no keys for an empty nested object', () => {
    const a = (): void => undefined;
    const result = flattenMap({ a, empty: {} } as any) as any;

    expect(Object.keys(result)).toEqual(['a']);
    expect(result.a).toBe(a);
    expect('empty' in result).toBe(false);
  });

  it('produces a plain object with only the expected own keys', () => {
    const a = (): void => undefined;
    const c = (): void => undefined;
    const result = flattenMap({ a, b: { c } } as any) as any;

    // own enumerable keys only — no inherited / polluted keys
    expect(Object.keys(result).sort()).toEqual(['a', 'b.c']);
    // not constructed from a polluting prototype
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(result.__proto__).toBe(Object.prototype);
    expect(result.constructor).toBe(Object);
  });
});

describe('flattenMap (what counts as a branch)', () => {
  it('walks own enumerable string keys only, skipping symbol, non-enumerable and inherited members', () => {
    const own = (): void => undefined;
    const map = Object.create({ inherited: (): void => undefined }) as Record<PropertyKey, unknown>;
    map.own = own;
    map[Symbol('hidden')] = (): void => undefined;
    Object.defineProperty(map, 'hiddenByFlag', { value: (): void => undefined, enumerable: false });
    const result = flattenMap(map as any) as any;

    expect(Object.keys(result)).toEqual(['own']);
    expect(result.own).toBe(own);
  });

  it('descends into a null-prototype branch', () => {
    const leaf = (): void => undefined;
    const branch = Object.assign(Object.create(null), { leaf });
    const result = flattenMap({ branch } as any) as any;

    expect(result['branch.leaf']).toBe(leaf);
  });

  it('descends into a class instance, keying by its own fields', () => {
    class Branch {
      leaf = (): void => undefined;
      method(): void {}
    }
    const branch = new Branch();
    const result = flattenMap({ branch } as any) as any;

    expect(Object.keys(result)).toEqual(['branch.leaf']);
    expect(result['branch.leaf']).toBe(branch.leaf);
  });

  it('descends into an array, keying leaves by index', () => {
    const first = (): void => undefined;
    const second = (): void => undefined;
    const result = flattenMap({ list: [first, second] } as any) as any;

    expect(Object.keys(result).sort()).toEqual(['list.0', 'list.1']);
    expect(result['list.0']).toBe(first);
    expect(result['list.1']).toBe(second);
  });

  it('reads a frozen map without touching it', () => {
    const leaf = (): void => undefined;
    const map = Object.freeze({ branch: Object.freeze({ leaf }) });
    const result = flattenMap(map) as any;

    expect(result['branch.leaf']).toBe(leaf);
    expect(map).toEqual({ branch: { leaf } });
  });

  it('places no depth limit on the runtime walk', () => {
    const leaf = (): void => undefined;
    const map = Array.from({ length: 12 }).reduce<object>(inner => ({ level: inner }), { leaf });
    const result = flattenMap(map as any) as any;

    expect(Object.keys(result)).toEqual([`${Array.from({ length: 12 }, () => 'level').join('.')}.leaf`]);
    expect(result[Object.keys(result)[0]!]).toBe(leaf);
  });

  it('drops an empty key from the joined path, so an empty-keyed branch aliases its parent', () => {
    const rootLeaf = (): void => undefined;
    const nestedLeaf = (): void => undefined;
    const result = flattenMap({ '': { root: rootLeaf }, a: { '': nestedLeaf } } as any) as any;

    expect(Object.keys(result).sort()).toEqual(['a', 'root']);
    expect(result.root).toBe(rootLeaf);
    expect(result.a).toBe(nestedLeaf);
  });
});

describe('flattenMap (what counts as a leaf)', () => {
  it('treats every callable as a leaf by default, class constructors and bound functions included', () => {
    class Leaf {}
    const bound = function(this: unknown): void {}.bind(null);
    async function asyncLeaf(): Promise<void> {}
    function* generatorLeaf(): Generator<never> {}
    const result = flattenMap({ Leaf, bound, asyncLeaf, generatorLeaf }) as any;

    expect(result.Leaf).toBe(Leaf);
    expect(result.bound).toBe(bound);
    expect(result.asyncLeaf).toBe(asyncLeaf);
    expect(result.generatorLeaf).toBe(generatorLeaf);
  });

  it('treats a value as a leaf where `leafPredicate` returns `true` for it, so arrays can stop the descent', () => {
    const list = [1, 2];
    const result = flattenMap({ a: { list }, b: [3] }, (p): p is number[] => Array.isArray(p));

    expect(result).toEqual({ 'a.list': list, b: [3] });
    expect(result['a.list']).toBe(list);
  });

  it('descends into a function when `leafPredicate` returns `false` for it', () => {
    const branch = Object.assign((): void => undefined, { inner: 1 });
    const result = flattenMap({ branch }, (p): p is number => typeof p === 'number');

    expect(result).toEqual({ 'branch.inner': 1 });
  });

  it('calls `leafPredicate` on every value it reaches, branches included', () => {
    const seen: unknown[] = [];
    const inner = { leaf: 1 };
    flattenMap({ inner, other: 2 }, (p): p is number => {
      seen.push(p);
      return typeof p === 'number';
    });

    expect(seen).toEqual(expect.arrayContaining([inner, 1, 2]));
    expect(seen).toHaveLength(3);
  });

  it('keeps a `null` or `undefined` leaf when the predicate claims it', () => {
    const result = flattenMap({ a: { b: null }, c: undefined }, (p): p is null | undefined => p == null);

    expect(result).toEqual({ 'a.b': null, c: undefined });
    expect('c' in result).toBe(true);
  });
});
