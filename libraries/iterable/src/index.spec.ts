import { describe, expect, it } from 'bun:test';
import { concat, first, firstDefined, iterable, replace, sequenceEquals, tryFirst, tryFirstDefined,
  zip } from './index';

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

describe('tryFirst', () => {
  it('gives the first element of a non-empty source', () => {
    expect(tryFirst([7, 8, 9])).toBe(7);
  });

  it('gives undefined for an empty source', () => {
    expect(tryFirst([])).toBeUndefined();
  });

  it('reads one element only', () => {
    let read = 0;
    function* counted(): Generator<number> {
      for (const n of [1, 2, 3]) {
        read++;
        yield n;
      }
    }

    expect(tryFirst(counted())).toBe(1);
    expect(read).toBe(1);
  });
});

describe('first', () => {
  it('gives the first element of a non-empty source', () => {
    expect(first([7, 8, 9])).toBe(7);
  });

  it('throws a TypeError for an empty source', () => {
    expect(() => first([])).toThrow(TypeError);
  });

  it('throws when the first element is undefined, which is indistinguishable from empty', () => {
    expect(() => first([undefined, 1])).toThrow(TypeError);
  });

  it('names itself in the message', () => {
    expect(() => first([])).toThrow('first: the source yielded nothing.');
  });
});

describe('tryFirstDefined', () => {
  it('skips leading undefined elements', () => {
    expect(tryFirstDefined([undefined, undefined, 3])).toBe(3);
  });

  it('gives undefined when every element is undefined', () => {
    expect(tryFirstDefined([undefined, undefined])).toBeUndefined();
  });

  it('gives undefined for an empty source', () => {
    expect(tryFirstDefined([])).toBeUndefined();
  });

  it('keeps other falsy values', () => {
    expect(tryFirstDefined([undefined, 0])).toBe(0);
    expect(tryFirstDefined([undefined, null])).toBeNull();
  });
});

describe('firstDefined', () => {
  it('skips leading undefined elements', () => {
    expect(firstDefined([undefined, undefined, 3])).toBe(3);
  });

  it('throws a TypeError when every element is undefined', () => {
    expect(() => firstDefined([undefined, undefined])).toThrow(TypeError);
  });

  it('throws a TypeError for an empty source', () => {
    expect(() => firstDefined([])).toThrow(TypeError);
  });

  it('names itself in the message', () => {
    expect(() => firstDefined([])).toThrow('firstDefined: the source yielded no defined element.');
  });

  it('keeps other falsy values rather than skipping them', () => {
    expect(firstDefined([undefined, 0])).toBe(0);
    expect(firstDefined([undefined, ''])).toBe('');
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
