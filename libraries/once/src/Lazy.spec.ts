import { describe, expect, it } from 'bun:test';
import { Lazy } from './Lazy';

describe('Lazy', () => {
  it('runs the factory once and memoizes the result', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return { id: calls };
    });

    const first = lazy.value;
    const second = lazy.value;

    expect(calls).toBe(1);
    expect(first).toBe(second);
  });

  it('does not re-run the factory for a falsy value (0)', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return 0;
    });

    expect(lazy.value).toBe(0);
    expect(lazy.value).toBe(0);
    expect(calls).toBe(1);
  });

  it('does not re-run the factory for a falsy value (empty string)', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return '';
    });

    expect(lazy.value).toBe('');
    expect(lazy.value).toBe('');
    expect(calls).toBe(1);
  });

  it('does not re-run the factory for a falsy value (false)', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return false;
    });

    expect(lazy.value).toBe(false);
    expect(lazy.value).toBe(false);
    expect(calls).toBe(1);
  });

  it('does not re-run the factory for a null result', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return null;
    });

    expect(lazy.value).toBeNull();
    expect(lazy.value).toBeNull();
    expect(calls).toBe(1);
  });

  it('does not re-run the factory for an undefined result', () => {
    let calls = 0;
    const lazy = new Lazy<undefined>(() => {
      calls++;
      return undefined;
    });

    expect(lazy.value).toBeUndefined();
    expect(lazy.value).toBeUndefined();
    expect(calls).toBe(1);
  });

  it('leaves the factory unrun until the value is first asked for', () => {
    let calls = 0;
    new Lazy(() => {
      calls++;
      return 1;
    });

    expect(calls).toBe(0);
  });

  it('caches nothing when the factory throws, so the next call runs it again', () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      if (calls === 1) {
        throw new Error('first time fails');
      }
      return 'recovered';
    });

    expect(() => lazy.value).toThrow('first time fails');
    expect(lazy.value).toBe('recovered');
    expect(lazy.value).toBe('recovered');
    expect(calls).toBe(2);
  });

  it('returns the very object the factory built', () => {
    const built = { id: 1 };
    const lazy = new Lazy(() => built);

    expect(lazy.value).toBe(built);
  });

  it('gives each Lazy its own value even when they share a factory', () => {
    let calls = 0;
    const factory = () => ({ id: ++calls });

    expect(new Lazy(factory).value).not.toBe(new Lazy(factory).value);
    expect(calls).toBe(2);
  });

  it('holds a promise as a value without awaiting it', async () => {
    let calls = 0;
    const lazy = new Lazy(async () => {
      calls++;
      return 'async';
    });

    const first = lazy.value;

    expect(first).toBeInstanceOf(Promise);
    expect(lazy.value).toBe(first);
    expect(await first).toBe('async');
    expect(calls).toBe(1);
  });

  it('keeps a rejected promise as the value rather than retrying the factory', async () => {
    let calls = 0;
    const lazy = new Lazy(() => {
      calls++;
      return Promise.reject(new Error('rejected'));
    });

    await expect(lazy.value).rejects.toThrow('rejected');
    await expect(lazy.value).rejects.toThrow('rejected');
    expect(calls).toBe(1);
  });

  it('runs the factory again for a re-entrant access from inside the factory', () => {
    let calls = 0;
    const lazy: Lazy<number> = new Lazy(() => {
      calls++;
      if (calls === 1) {
        return lazy.value + 1;
      }
      return 10;
    });

    expect(lazy.value).toBe(11);
    expect(lazy.value).toBe(11);
    expect(calls).toBe(2);
  });
});
