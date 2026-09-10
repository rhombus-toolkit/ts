import { describe, expect, it } from 'bun:test';
import { concat, first, firstDefined, iterable, replace, sequenceEquals, tryFirst, tryFirstDefined,
  zip } from './utils';

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

  it('yields nothing for zero sources in either mode', () => {
    const none: Iterable<number>[] = [];

    expect([...zip('inner', ...(none as [Iterable<number>, Iterable<number>]))]).toEqual([]);
    expect([...zip('outer', ...(none as [Iterable<number>, Iterable<number>]))]).toEqual([]);
  });

  it('closes the sources still open when inner ends on the shortest one', () => {
    const closed: string[] = [];
    function* tracked(name: string, count: number): Generator<number> {
      try {
        for (let i = 0; i < count; i++) {
          yield i;
        }
      } finally {
        closed.push(name);
      }
    }

    expect([...zip('inner', tracked('short', 1), tracked('long', 3))]).toEqual([[0, 0]]);
    expect(closed.sort()).toEqual(['long', 'short']);
  });

  it('closes every source when the consumer stops early', () => {
    const closed: string[] = [];
    function* tracked(name: string): Generator<number> {
      try {
        yield* [1, 2, 3];
      } finally {
        closed.push(name);
      }
    }

    for (const pair of zip('outer', tracked('a'), tracked('b'))) {
      if (pair[0] === 1) {
        break;
      }
    }
    expect(closed.sort()).toEqual(['a', 'b']);
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

describe('replace, the match', () => {
  it('calls the predicate with every element in order', () => {
    const seen: number[] = [];
    [...replace([1, 2, 3], n => {
      seen.push(n);
      return false;
    }, 0)];

    expect(seen).toEqual([1, 2, 3]);
  });

  it('treats a function match as a predicate, never as a value to look for', () => {
    const always = (): boolean => true;
    const other = (): boolean => false;

    expect([...replace([always, other], always, 'X')]).toEqual(['X', 'X']);
  });

  it('matches undefined as a value', () => {
    expect([...replace([1, undefined, 2], undefined, 0)]).toEqual([1, 0, 2]);
  });

  it('matches by identity, so an equal-looking object is not a match', () => {
    const target = { id: 1 };

    expect([...replace([target, { id: 1 }], target, 'X')]).toEqual(['X', { id: 1 }]);
  });

  it('yields nothing for an empty source', () => {
    expect([...replace([], 1, 2)]).toEqual([]);
  });
});

describe('tryFirst, the edges', () => {
  it('gives undefined when the first element is undefined, the same as for an empty source', () => {
    expect(tryFirst([undefined, 1])).toBeUndefined();
  });

  it('gives the first character of a string', () => {
    expect(tryFirst('ab')).toBe('a');
  });

  it('gives a null first element as itself', () => {
    expect(tryFirst([null, 1])).toBeNull();
  });
});

describe('first, the edges', () => {
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

  it('keeps a falsy first element other than undefined', () => {
    expect(first([0, 1])).toBe(0);
    expect(first([null, 1])).toBeNull();
  });
});

describe('tryFirstDefined, the edges', () => {
  it('stops reading at the first defined element', () => {
    let read = 0;
    function* counted(): Generator<number | undefined> {
      for (const n of [undefined, 2, 3]) {
        read++;
        yield n;
      }
    }

    expect(tryFirstDefined(counted())).toBe(2);
    expect(read).toBe(2);
  });
});

describe('concat, the edges', () => {
  it('flattens one level only, so a nested iterable comes through whole', () => {
    expect(concat<number[] | number>([[1, 2]], 3).toArray()).toEqual([[1, 2], 3]);
  });

  it('contributes nothing for an empty iterable argument', () => {
    expect(concat<number>([], 1, [], [2]).toArray()).toEqual([1, 2]);
  });

  it('yields a plain object argument as itself', () => {
    const item = { id: 1 };

    expect(concat<{ id: number; }>(item).toArray()).toEqual([item]);
  });

  it('yields null and undefined arguments as themselves', () => {
    expect(concat<null | undefined>(null, undefined).toArray()).toEqual([null, undefined]);
  });

  it('is lazy, so nothing is read until the result is consumed', () => {
    let read = 0;
    function* counted(): Generator<number> {
      for (const n of [1, 2]) {
        read++;
        yield n;
      }
    }

    const joined = concat(counted(), [3]);
    expect(read).toBe(0);
    expect(joined.next().value).toBe(1);
    expect(read).toBe(1);
  });

  it('spends a one-shot iterable source on its single walk', () => {
    const joined = concat([1, 2].values(), [3]);

    expect(joined.toArray()).toEqual([1, 2, 3]);
    expect(joined.toArray()).toEqual([]);
  });
});

describe('iterable, the edges', () => {
  it('accepts a generator function as the factory', () => {
    function* numbers(): Generator<number> {
      yield 1;
      yield 2;
    }

    expect([...iterable(numbers)]).toEqual([1, 2]);
  });

  it('does not ask the factory until a walk begins', () => {
    let walks = 0;
    iterable(() => {
      walks++;
      return [][Symbol.iterator]();
    });

    expect(walks).toBe(0);
  });

  it('spends a one-shot factory result on its walk, so the second walk is empty', () => {
    const spent = [1, 2].values();
    const numbers = iterable(() => spent);

    expect([...numbers]).toEqual([1, 2]);
    expect([...numbers]).toEqual([]);
  });
});

describe('zip, the edges', () => {
  it("'outer' fills whichever source ends first, in either position", () => {
    expect([...zip('outer', [1], ['a', 'b'])]).toEqual([[1, 'a'], [undefined, 'b']]);
    expect([...zip('outer', [1, 2], ['a'])]).toEqual([[1, 'a'], [2, undefined]]);
  });

  it("'outer' yields nothing when every source is empty", () => {
    expect([...zip('outer', [], [])]).toEqual([]);
  });

  it("'outer' keeps going while any of three sources has elements", () => {
    expect([...zip('outer', [1], [], ['a', 'b'])]).toEqual([[1, undefined, 'a'], [undefined, undefined, 'b']]);
  });

  it("'inner' stops at the shortest of three sources", () => {
    expect([...zip('inner', [1, 2, 3], ['a'], [true, false])]).toEqual([[1, 'a', true]]);
  });

  it("'outer' cannot tell a yielded undefined from an exhausted source", () => {
    expect([...zip('outer', [undefined, 1], ['a'])]).toEqual([[undefined, 'a'], [1, undefined]]);
  });

  it('yields nothing for two empty sources under inner', () => {
    expect([...zip('inner', [], [])]).toEqual([]);
  });

  it('accepts one-shot iterators as sources', () => {
    expect([...zip('inner', [1, 2].values(), new Set(['a', 'b']))]).toEqual([[1, 'a'], [2, 'b']]);
  });

  it('is lazy, pulling one element from each source per tuple', () => {
    const pulls: string[] = [];
    function* counted(name: string, values: number[]): Generator<number> {
      for (const value of values) {
        pulls.push(`${name}${value}`);
        yield value;
      }
    }

    const pairs = zip('inner', counted('l', [1, 2]), counted('r', [1, 2]));
    expect(pulls).toEqual([]);
    pairs.next();
    expect(pulls).toEqual(['l1', 'r1']);
  });

  it("'inner' pulls from every source before noticing that one has ended", () => {
    const pulls: string[] = [];
    function* counted(name: string, values: number[]): Generator<number> {
      for (const value of values) {
        pulls.push(`${name}${value}`);
        yield value;
      }
    }

    [...zip('inner', counted('l', []), counted('r', [1]))];
    expect(pulls).toEqual(['r1']);
  });
});

describe('sequenceEquals, the edges', () => {
  const strictEquals = (left: unknown, right: unknown): boolean => left === right;

  it('stops reading at the first difference', () => {
    let read = 0;
    function* counted(): Generator<number> {
      for (const n of [1, 9, 3]) {
        read++;
        yield n;
      }
    }

    expect(sequenceEquals([1, 2, 3], counted(), strictEquals)).toBe(false);
    expect(read).toBe(2);
  });

  it('hands the comparison the left element from the first source and the right from the second', () => {
    const pairs: Array<[string, number]> = [];
    sequenceEquals(['a', 'b'], [1, 2], (left: string | number, right: string | number) => {
      pairs.push([left as string, right as number]);
      return true;
    });

    expect(pairs).toEqual([['a', 1], ['b', 2]]);
  });

  it('never calls the comparison for an empty pair of sources', () => {
    let calls = 0;
    sequenceEquals([], [], () => {
      calls++;
      return true;
    });

    expect(calls).toBe(0);
  });

  it('is false when one source is empty and the other is not', () => {
    expect(sequenceEquals([], [1], strictEquals)).toBe(false);
    expect(sequenceEquals([1], [], strictEquals)).toBe(false);
  });

  it('compares across iterable kinds by element order alone', () => {
    expect(sequenceEquals(new Set([1, 2]), [1, 2], strictEquals)).toBe(true);
    expect(sequenceEquals('ab', ['a', 'b'], strictEquals)).toBe(true);
  });

  it('compares the same one-shot iterator against itself as two interleaved pulls', () => {
    const shared = [1, 2, 3, 4].values();

    expect(sequenceEquals(shared, shared, strictEquals)).toBe(false);
  });

  it('treats a result that omits done as an element, and ends together only when both report done', () => {
    let calls = 0;
    const omitsDone: Iterator<number> = { next: () => {
      calls++;
      return calls === 1 ? { value: 1 } as IteratorResult<number> : { done: true, value: undefined };
    } };

    expect(sequenceEquals(omitsDone, [1], strictEquals)).toBe(true);
  });

  it('is false rather than true when the comparison is always true but the lengths differ', () => {
    expect(sequenceEquals([1, 2], [1, 2, 3], () => true)).toBe(false);
  });
});
