import { describe, expect, it } from 'bun:test';
import { memo } from './memo';

describe('memo', () => {
  it('computes once per distinct key', () => {
    let calls = 0;
    const sizeOf = memo((key: { items: number[]; }) => {
      calls++;
      return key.items.length;
    });

    const a = { items: [1, 2, 3] };
    const b = { items: [1] };

    expect(sizeOf(a)).toBe(3);
    expect(sizeOf(a)).toBe(3);
    expect(sizeOf(b)).toBe(1);

    expect(calls).toBe(2);
  });

  it('passes the key to compute', () => {
    const seen: object[] = [];
    const record = memo((key: object) => {
      seen.push(key);
      return key;
    });

    const key = {};
    record(key);

    expect(seen).toEqual([key]);
  });

  it('treats a stored undefined as a hit rather than a miss', () => {
    let calls = 0;
    const nothing = memo((_key: object) => {
      calls++;
      return undefined;
    });

    const key = {};

    expect(nothing(key)).toBeUndefined();
    expect(nothing(key)).toBeUndefined();
    expect(calls).toBe(1);
  });

  it('stores nothing when compute throws, so the next ask recomputes', () => {
    let calls = 0;
    const failing = memo((_key: object) => {
      calls++;
      throw new Error('nope');
    });

    const key = {};

    expect(() => failing(key)).toThrow('nope');
    expect(() => failing(key)).toThrow('nope');
    expect(calls).toBe(2);
  });

  it('gives each memo its own cache', () => {
    const key = {};
    const first = memo((_key: object) => 1);
    const second = memo((_key: object) => 2);

    expect(first(key)).toBe(1);
    expect(second(key)).toBe(2);
  });
});
