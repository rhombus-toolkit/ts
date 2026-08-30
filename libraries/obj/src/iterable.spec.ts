import { describe, expect, it } from 'bun:test';
import { concat, first, isAllThere, iterable, replace, sequenceEquals, zip } from './iterable';

describe('replace', () => {
  it('substitutes a value replacement for every exact-value match', () => {
    expect([...replace(['a', 'b', 'a'], 'a', 'X')]).toEqual(['X', 'b', 'X']);
  });

  it('substitutes a value replacement for every predicate match', () => {
    expect([...replace([1, 2, 3, 4], n => n % 2 === 0, 0)]).toEqual([1, 0, 3, 0]);
  });

  it('calls a function replacement with the matched element', () => {
    expect([...replace([1, 2, 3], 2, n => n * 10)]).toEqual([1, 20, 3]);
  });

  it('calls a function replacement for every predicate match', () => {
    expect([...replace([1, 2, 3, 4], n => n > 2, n => -n)]).toEqual([1, 2, -3, -4]);
  });

  it('yields the source unchanged when nothing matches', () => {
    expect([...replace(['a', 'b'], 'z', 'X')]).toEqual(['a', 'b']);
  });

  it('is lazy — nothing is read until the result is consumed', () => {
    let read = 0;
    function* counted(): Generator<number> {
      for (const n of [1, 2, 3]) {
        read++;
        yield n;
      }
    }

    const replaced = replace(counted(), 2, 20);
    expect(read).toBe(0);
    expect(replaced.next().value).toBe(1);
    expect(read).toBe(1);
  });
});

describe('first', () => {
  it('gives the first element of a non-empty source', () => {
    expect(first([7, 8, 9])).toBe(7);
  });

  it('gives undefined for an empty source', () => {
    expect(first([])).toBeUndefined();
  });

  it('reads one element only', () => {
    let read = 0;
    function* counted(): Generator<number> {
      for (const n of [1, 2, 3]) {
        read++;
        yield n;
      }
    }

    expect(first(counted())).toBe(1);
    expect(read).toBe(1);
  });
});

describe('isAllThere', () => {
  it('is true when no element is undefined', () => {
    expect(isAllThere([1, 2, 3])).toBe(true);
  });

  it('is false when any element is undefined', () => {
    expect(isAllThere([1, undefined, 3])).toBe(false);
  });

  it('is true for an empty source', () => {
    expect(isAllThere([])).toBe(true);
  });

  it('counts every other falsy value as present', () => {
    expect(isAllThere([0, '', false, null, Number.NaN])).toBe(true);
  });

  it('accepts a non-array iterable', () => {
    expect(isAllThere(['a', 'b'])).toBe(true);
    expect(isAllThere(['a', undefined])).toBe(false);
  });
});

describe('concat', () => {
  it('runs the arguments together, flattening the iterable ones', () => {
    expect(concat([1, 2], 3, [4, 5]).toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('yields a non-iterable argument as itself', () => {
    expect(concat(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });

  it('flattens a string argument into its characters — a string is iterable', () => {
    expect(concat<string>(['a'], 'bc').toArray()).toEqual(['a', 'b', 'c']);
  });

  it('yields nothing for no arguments', () => {
    expect(concat<number>().toArray()).toEqual([]);
  });
});

describe('iterable', () => {
  it('turns an iterator factory into something for…of accepts', () => {
    expect([...iterable(() => [1, 2, 3][Symbol.iterator]())]).toEqual([1, 2, 3]);
  });

  it('asks the factory again on every walk, so the result is re-readable', () => {
    let walks = 0;
    const numbers = iterable(() => {
      walks++;
      return [1, 2][Symbol.iterator]();
    });

    expect([...numbers]).toEqual([1, 2]);
    expect([...numbers]).toEqual([1, 2]);
    expect(walks).toBe(2);
  });
});

describe('zip', () => {
  it('pairs elements positionally', () => {
    expect([...zip('inner', [1, 2], ['a', 'b'])]).toEqual([[1, 'a'], [2, 'b']]);
  });

  it("'inner' ends with the shortest source", () => {
    expect([...zip('inner', [1, 2, 3], ['a', 'b'])]).toEqual([[1, 'a'], [2, 'b']]);
  });

  it("'outer' runs to the longest source, filling an exhausted slot with undefined", () => {
    expect([...zip('outer', [1, 2, 3], ['a', 'b'])]).toEqual([[1, 'a'], [2, 'b'], [3, undefined]]);
  });

  it('zips more than two sources', () => {
    expect([...zip('inner', [1, 2], ['a', 'b'], [true, false])]).toEqual([[1, 'a', true], [2, 'b', false]]);
  });

  it('yields nothing when a source is empty under inner', () => {
    expect([...zip('inner', [1, 2], [])]).toEqual([]);
  });
});

describe('sequenceEquals', () => {
  const strictEquals = (left: unknown, right: unknown): boolean => left === right;

  it('is true for pairwise-equal sources that end together', () => {
    expect(sequenceEquals([1, 2, 3], [1, 2, 3], strictEquals)).toBe(true);
  });

  it('is false when an element differs', () => {
    expect(sequenceEquals([1, 2, 3], [1, 9, 3], strictEquals)).toBe(false);
  });

  it('is false when one source is a prefix of the other', () => {
    expect(sequenceEquals([1, 2], [1, 2, 3], strictEquals)).toBe(false);
    expect(sequenceEquals([1, 2, 3], [1, 2], strictEquals)).toBe(false);
  });

  it('is true for two empty sources', () => {
    expect(sequenceEquals([], [], strictEquals)).toBe(true);
  });

  it('uses the supplied comparison rather than ===', () => {
    const sameLength = (left: string, right: string): boolean => left.length === right.length;
    expect(sequenceEquals(['ab', 'cd'], ['xy', 'zw'], sameLength)).toBe(true);
  });
});
