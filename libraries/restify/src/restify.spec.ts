import { describe, expect, it } from 'bun:test';
import vm from 'node:vm';
import { restify, unrestify } from './restify';

/** The marker symbol, read back off a marked tuple since the module keeps it private. */
const marker = Object.getOwnPropertySymbols(unrestify(['a', 'b']))[0]!;

describe('unrestify', () => {
  it('turns no arguments into undefined', () => {
    expect(unrestify([])).toBeUndefined();
  });

  it('turns one argument into that argument itself', () => {
    expect(unrestify(['a'])).toBe('a');
  });

  it('keeps a null argument', () => {
    expect(unrestify([null])).toBeNull();
  });

  it('keeps a falsy argument', () => {
    expect(unrestify([0])).toBe(0);
    expect(unrestify([''])).toBe('');
    expect(unrestify([false])).toBe(false);
  });

  it('turns one array argument into that array, by identity', () => {
    const list = [1, 2];

    expect(unrestify([list])).toBe(list);
  });

  it('turns one object argument into that object, by identity', () => {
    const value = { a: 1 };

    expect(unrestify([value])).toBe(value);
  });

  it('turns several arguments into the tuple itself, marked in place', () => {
    const args = ['a', 'b'];
    const payload = unrestify(args);

    expect(payload).toBe(args as any);
    expect(Object.getOwnPropertySymbols(payload)).toEqual([marker]);
  });

  it('hides the marker from enumeration', () => {
    expect(Object.keys(unrestify(['a', 'b']))).toEqual(['0', '1']);
  });

  it('pins the marker as non-writable, non-enumerable and removable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(unrestify(['a', 'b']), marker);

    expect(descriptor).toEqual({ value: true, writable: false, enumerable: false, configurable: true });
  });

  it('marks a tuple of arguments from another realm', () => {
    const foreign = vm.runInNewContext('["a", "b"]');

    expect(Object.getOwnPropertySymbols(unrestify(foreign))).toEqual([marker]);
  });

  it('throws a TypeError for anything but an array', () => {
    expect(() => unrestify({ length: 2, 0: 'a', 1: 'b' } as any)).toThrow(TypeError);
    expect(() => unrestify('ab' as any)).toThrow('Value must be an array');
  });
});

describe('restify', () => {
  it('turns undefined into no arguments', () => {
    expect(restify(undefined)).toEqual([] as any);
  });

  it('turns a scalar into one argument', () => {
    expect(restify('a')).toEqual(['a'] as any);
  });

  it('turns null into one argument', () => {
    expect(restify(null)).toEqual([null] as any);
  });

  it('turns a falsy scalar into one argument', () => {
    expect(restify(0)).toEqual([0] as any);
    expect(restify('')).toEqual([''] as any);
    expect(restify(false)).toEqual([false] as any);
    expect(restify(NaN)).toEqual([NaN] as any);
  });

  /** The marker's whole job: an unmarked array is one argument, never an argument list. */
  it('turns an unmarked array into one argument, by identity', () => {
    const list = [1, 2];
    const args = restify(list);

    expect(args).toEqual([[1, 2]] as any);
    expect(args[0]).toBe(list);
  });

  it('turns an unmarked empty array into one argument', () => {
    expect(restify([])).toEqual([[]] as any);
  });

  it('turns an unmarked array from another realm into one argument', () => {
    const foreign = vm.runInNewContext('["a"]');

    expect(restify(foreign)[0]).toBe(foreign);
  });

  it('turns an array-like object into one argument', () => {
    const arrayLike = { length: 1, 0: 'a' };

    expect(restify(arrayLike)).toEqual([arrayLike] as any);
  });

  it('gives a marked tuple back by identity, with the mark removed', () => {
    const payload = unrestify(['a', 'b']);
    const args = restify(payload);

    expect(args).toBe(payload as any);
    expect(Object.getOwnPropertySymbols(args)).toEqual([]);
  });

  it('is not idempotent: a tuple already restified reads as one argument', () => {
    const args = restify(unrestify(['a', 'b']));

    expect(restify(args)).toEqual([['a', 'b']] as any);
  });

  it('builds a fresh argument list for each call', () => {
    expect(restify('a')).not.toBe(restify('a'));
  });

  it('never marks the argument list it builds', () => {
    expect(Object.getOwnPropertySymbols(restify('a'))).toEqual([]);
    expect(Object.getOwnPropertySymbols(restify(undefined))).toEqual([]);
  });
});

describe('payload shape', () => {
  /** Every non-array value a creator could be called with as its one argument. */
  const nonArrays: unknown[] = ['a', '', 0, NaN, false, null, undefined, 1n, Symbol('s'), { a: 1 }, { length: 1,
    0: 'a' }, () => {}, new Map(), new Set(), new Date(0), /x/];

  it('never turns one non-array argument into an array', () => {
    for (const value of nonArrays) {
      expect(Array.isArray(unrestify([value]))).toBe(false);
    }
  });

  it('turns one array argument into that array, unmarked', () => {
    const list = [1, 2];
    const payload = unrestify([list]);

    expect(Array.isArray(payload)).toBe(true);
    expect(Object.getOwnPropertySymbols(payload)).toEqual([]);
  });

  it('turns several arguments into a marked array', () => {
    const payload = unrestify(['a', 'b']);

    expect(Array.isArray(payload)).toBe(true);
    expect(Object.getOwnPropertySymbols(payload)).toEqual([marker]);
  });
});

describe('unmark', () => {
  it('is idempotent: restifying an unmarked array again does not throw and leaves it unmarked', () => {
    const args = restify(unrestify(['a', 'b']));

    expect(Object.getOwnPropertySymbols(args)).toEqual([]);
    expect(Object.getOwnPropertySymbols(restify(args)[0]!)).toEqual([]);
  });
});

describe('mark', () => {
  it('is idempotent: marking a marked tuple again changes nothing and keeps identity', () => {
    const args = ['a', 'b'];
    const once = unrestify(args);
    const twice = unrestify(once as any);

    expect(twice).toBe(once);
    expect(Object.getOwnPropertySymbols(twice)).toEqual([marker]);
    expect(Object.getOwnPropertyDescriptor(twice, marker)).toEqual({ value: true, writable: false, enumerable: false,
      configurable: true });
  });
});

describe('holes', () => {
  it('keeps a hole in one sparse array argument, by identity', () => {
    const sparse = [, 'b'];
    const payload = unrestify([sparse]);

    expect(payload).toBe(sparse);
    expect(0 in restify(payload)[0]!).toBe(false);
  });

  it('keeps a hole in a sparse argument list', () => {
    const payload = unrestify([, 'b'] as any[]);

    expect(payload.length).toBe(2);
    expect(0 in payload).toBe(false);
    expect(payload[1]).toBe('b');
  });

  it('hands a hole back to the handler as a hole', () => {
    const args = restify(unrestify([, 'b', , 'd'] as any[]));

    expect(args.length).toBe(4);
    expect(Object.keys(args)).toEqual(['1', '3']);
  });

  it('hands the handler the very array the creator received', () => {
    const args = ['a', 'b'];

    expect(restify(unrestify(args))).toBe(args as any);
  });
});

describe('round trip', () => {
  /** Element-for-element `===`: what a handler spread from the payload sees is what the creator was called with. */
  function sequenceEquals(left: readonly unknown[], right: readonly unknown[]): boolean {
    return left.length === right.length
      && Array.from(left.keys()).every((index) => index in left === index in right && left[index] === right[index]);
  }

  function roundTrips(...input: unknown[]): boolean {
    return sequenceEquals(input, restify(unrestify(input)));
  }

  it('hands a handler exactly the arguments the creator was called with', () => {
    const list = [1, 2];
    const value = { a: 1 };

    expect(roundTrips()).toBe(true);
    expect(roundTrips('a')).toBe(true);
    expect(roundTrips(null)).toBe(true);
    expect(roundTrips(0)).toBe(true);
    expect(roundTrips(list)).toBe(true);
    expect(roundTrips([])).toBe(true);
    expect(roundTrips(value)).toBe(true);
    expect(roundTrips('a', 2)).toBe(true);
    expect(roundTrips(list, value)).toBe(true);
    expect(roundTrips(null, undefined, 3)).toBe(true);
  });

  it('cannot tell an explicit undefined argument from none, which a handler cannot either', () => {
    expect(roundTrips(undefined)).toBe(false);
    expect(restify(unrestify([undefined]))).toEqual([]);
  });
});
