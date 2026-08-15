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
