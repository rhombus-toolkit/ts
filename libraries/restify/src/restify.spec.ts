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

  it('turns several arguments into a marked copy of the tuple', () => {
    const args = ['a', 'b'];
    const payload = unrestify(args);

    expect(payload).toEqual(['a', 'b'] as any);
    expect(payload).not.toBe(args as any);
    expect(Object.getOwnPropertySymbols(payload)).toEqual([marker]);
    expect(Object.getOwnPropertySymbols(args)).toEqual([]);
  });

  it('hides the marker from enumeration', () => {
    expect(Object.keys(unrestify(['a', 'b']))).toEqual(['0', '1']);
  });

  it('pins the marker as non-writable and non-configurable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(unrestify(['a', 'b']), marker);

    expect(descriptor).toEqual({ value: true, writable: false, enumerable: false, configurable: false });
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

  it('gives a marked tuple back untouched, by identity', () => {
    const payload = unrestify(['a', 'b']);

    expect(restify(payload)).toBe(payload as any);
  });

  it('builds a fresh argument list for each call', () => {
    expect(restify('a')).not.toBe(restify('a'));
  });

  it('never marks the argument list it builds', () => {
    expect(Object.getOwnPropertySymbols(restify('a'))).toEqual([]);
    expect(Object.getOwnPropertySymbols(restify(undefined))).toEqual([]);
  });
});

describe('round trip', () => {
  function roundTrip(...args: unknown[]): unknown[] {
    return restify(unrestify(args));
  }

  it('hands a handler exactly the arguments the creator was called with', () => {
    const list = [1, 2];
    const value = { a: 1 };

    expect(roundTrip()).toEqual([]);
    expect(roundTrip('a')).toEqual(['a']);
    expect(roundTrip(null)).toEqual([null]);
    expect(roundTrip(list)[0]).toBe(list);
    expect(roundTrip(value)[0]).toBe(value);
    expect(roundTrip('a', 2)).toEqual(['a', 2]);
    expect(roundTrip(list, value)).toEqual([list, value]);
  });

  it('cannot tell an explicit undefined argument from none, which a handler cannot either', () => {
    expect(roundTrip(undefined)).toEqual([]);
  });
});
