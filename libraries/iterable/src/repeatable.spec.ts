import { describe, expect, it } from 'bun:test';
import { repeatable } from './repeatable';

/** A generator over `values` alongside a count of how many of them it has handed out so far. */
function counted<T>(values: readonly T[]) {
  const reads = { count: 0 };
  function* source(): Generator<T> {
    for (const value of values) {
      reads.count++;
      yield value;
    }
  }
  return { reads, source: source() };
}

describe('repeatable', () => {
  it('walks a one-shot generator as many times as asked', () => {
    const sequence = repeatable(counted([1, 2, 3]).source);

    expect([...sequence]).toEqual([1, 2, 3]);
    expect([...sequence]).toEqual([1, 2, 3]);
  });

  it('reads each element from the source once, however many walks', () => {
    const { reads, source } = counted(['a', 'b', 'c']);
    const sequence = repeatable(source);

    [...sequence];
    [...sequence];
    [...sequence];
    expect(reads.count).toBe(3);
  });

  it('reads nothing until a walk asks for it', () => {
    const { reads, source } = counted([1, 2, 3]);
    const walk = repeatable(source)[Symbol.iterator]();

    expect(reads.count).toBe(0);
    expect(walk.next().value).toBe(1);
    expect(reads.count).toBe(1);
  });

  it('continues past where an earlier, abandoned walk stopped', () => {
    const { reads, source } = counted([1, 2, 3]);
    const sequence = repeatable(source);
    const abandoned = sequence[Symbol.iterator]();
    abandoned.next();
    abandoned.next();

    expect([...sequence]).toEqual([1, 2, 3]);
    expect(reads.count).toBe(3);
  });

  it('shares one pass over the source between walks in flight at the same time', () => {
    const { reads, source } = counted([1, 2, 3]);
    const sequence = repeatable(source);
    const left = sequence[Symbol.iterator]();
    const right = sequence[Symbol.iterator]();

    expect(left.next().value).toBe(1);
    expect(right.next().value).toBe(1);
    expect(right.next().value).toBe(2);
    expect(right.next().value).toBe(3);
    expect(left.next().value).toBe(2);
    expect(left.next().value).toBe(3);
    expect(left.next().done).toBe(true);
    expect(right.next().done).toBe(true);
    expect(reads.count).toBe(3);
  });

  it('accepts a bare iterator that is not itself iterable', () => {
    let next = 0;
    const iterator: Iterator<number> = {
      next: () => next < 2 ? { done: false, value: next++ } : { done: true, value: undefined },
    };
    const sequence = repeatable(iterator);

    expect([...sequence]).toEqual([0, 1]);
    expect([...sequence]).toEqual([0, 1]);
  });

  it('stops asking the source once it has reported done', () => {
    let calls = 0;
    const iterator: Iterator<number> = { next: () => {
      calls++;
      return calls <= 2 ? { done: false, value: calls } : { done: true, value: undefined };
    } };
    const sequence = repeatable(iterator);

    expect([...sequence]).toEqual([1, 2]);
    expect([...sequence]).toEqual([1, 2]);
    expect(calls).toBe(3);
  });

  it('walks a spent source with the array iterator of its cache', () => {
    const sequence = repeatable(counted([1, 2]).source);
    [...sequence];

    expect(Object.prototype.toString.call(sequence[Symbol.iterator]())).toBe('[object Array Iterator]');
  });

  it('accepts any iterable, a string included', () => {
    expect([...repeatable(new Set(['x', 'y']))]).toEqual(['x', 'y']);
    expect([...repeatable('ab')]).toEqual(['a', 'b']);
  });

  it('hands back a repeatable it is given rather than wrapping it again', () => {
    const sequence = repeatable([1, 2]);

    expect(repeatable(sequence)).toBe(sequence);
  });

  it('stays empty on every walk over an empty source', () => {
    const sequence = repeatable(counted([]).source);

    expect([...sequence]).toEqual([]);
    expect([...sequence]).toEqual([]);
  });
});

describe('repeatable, the source and the cache', () => {
  it('stays empty on every walk over a source that was already consumed', () => {
    const { source } = counted([1, 2, 3]);
    [...source];
    const sequence = repeatable(source);

    expect([...sequence]).toEqual([]);
    expect([...sequence]).toEqual([]);
  });

  it('starts from the first element on a walk begun after another has finished', () => {
    const sequence = repeatable(counted([1, 2, 3]).source);
    [...sequence];
    const later = sequence[Symbol.iterator]();

    expect(later.next().value).toBe(1);
  });

  it('hands every walk the same element objects, not copies', () => {
    const elements = [{ id: 1 }, { id: 2 }];
    const sequence = repeatable(counted(elements).source);
    const [firstWalk] = [...sequence];
    const [secondWalk] = [...sequence];

    expect(firstWalk).toBe(elements[0]);
    expect(secondWalk).toBe(firstWalk);
  });

  it('lets a lagging walk catch up from the cache without touching the source', () => {
    const { reads, source } = counted([1, 2, 3, 4]);
    const sequence = repeatable(source);
    const lagging = sequence[Symbol.iterator]();
    [...sequence];
    expect(reads.count).toBe(4);

    expect([...lagging]).toEqual([1, 2, 3, 4]);
    expect(reads.count).toBe(4);
  });

  it('does not cache the value a source returns alongside done', () => {
    let calls = 0;
    const iterator: Iterator<string, string> = { next: () => {
      calls++;
      return calls === 1 ? { done: false, value: 'kept' } : { done: true, value: 'dropped' };
    } };
    const sequence = repeatable(iterator);

    expect([...sequence]).toEqual(['kept']);
    expect([...sequence]).toEqual(['kept']);
  });

  it('surfaces a throwing source in the walk that pulled it and keeps what was cached', () => {
    function* faulty(): Generator<number> {
      yield 1;
      throw new Error('boom');
    }
    const sequence = repeatable(faulty());

    expect(() => [...sequence]).toThrow('boom');
    expect([...sequence]).toEqual([1]);
  });

  it('accepts a next-only object under Iterator.from without a Symbol.iterator of its own', () => {
    const nextOnly = { next: () => ({ done: true as const, value: undefined }) };
    expect(Symbol.iterator in nextOnly).toBe(false);

    expect([...repeatable(nextOnly)]).toEqual([]);
  });
});
