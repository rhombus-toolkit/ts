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
});
