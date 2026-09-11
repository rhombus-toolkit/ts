import { describe, expect, it } from 'bun:test';
import { AutoStack } from './AutoStack';

describe('AutoStack', () => {
  it('holds an entry for the life of its scope', () => {
    const stack = new AutoStack<string>();

    {
      using _entry = stack.push('a');
      expect(stack.peek()).toBe('a');
      expect(stack.has('a')).toBe(true);
    }

    expect(stack.peek()).toBeUndefined();
    expect(stack.has('a')).toBe(false);
  });

  it('unwinds when the scope leaves by exception', () => {
    const stack = new AutoStack<string>();

    expect(() => {
      using _entry = stack.push('a');
      throw new Error('boom');
    }).toThrow('boom');

    expect(stack.peek()).toBeUndefined();
  });

  it('drops what an inner scope failed to release when the outer one ends', () => {
    const stack = new AutoStack<string>();

    {
      using _outer = stack.push('outer');
      stack.push('leaked'); // never disposed
      expect(stack.peek()).toBe('leaked');
    }

    expect([...stack]).toEqual([]);
  });

  it('counts down as scopes unwind', () => {
    const stack = new AutoStack<string>();
    expect(stack.length).toBe(0);

    {
      using _a = stack.push('a');
      expect(stack.length).toBe(1);

      {
        using _b = stack.push('b');
        expect(stack.length).toBe(2);
      }

      expect(stack.length).toBe(1);
    }

    expect(stack.length).toBe(0);
  });

  it('finds an entry at any depth', () => {
    const stack = new AutoStack<string>();
    using _a = stack.push('a');
    using _b = stack.push('b');

    expect(stack.has('a')).toBe(true);
    expect(stack.peek()).toBe('b');
  });

  it('iterates outermost first', () => {
    const stack = new AutoStack<string>();
    using _a = stack.push('a');
    using _b = stack.push('b');
    using _c = stack.push('c');

    expect([...stack]).toEqual(['a', 'b', 'c']);
  });

  it('tolerates a repeated dispose', () => {
    const stack = new AutoStack<string>();
    const entry = stack.push('a');
    entry[Symbol.dispose]();
    entry[Symbol.dispose]();

    expect([...stack]).toEqual([]);
  });
});
