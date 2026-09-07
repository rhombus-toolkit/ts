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
