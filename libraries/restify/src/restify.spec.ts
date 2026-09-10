import { describe, expect, it } from 'bun:test';
import vm from 'node:vm';
import { restify, unrestify } from './restify';

/** The marker symbol, read back off a wrapped value since the module keeps it private. */
const marker = Object.getOwnPropertySymbols(restify('a'))[0]!;

describe('restify', () => {
  it('wraps a scalar in a one-element array', () => {
    expect(restify('a')).toEqual(['a'] as any);
  });

  it('gives an array back untouched, by identity', () => {
    const source = ['a', 'b'];
    expect(restify(source)).toBe(source as any);
  });

  it('turns undefined into an empty array', () => {
    expect(restify(undefined)).toEqual([] as any);
  });

  it('hides its marker from enumeration', () => {
    expect(Object.keys(restify('a'))).toEqual(['0']);
  });

  it('wraps null as an argument rather than treating it as absent', () => {
    expect(restify(null)).toEqual([null] as any);
  });

  it('wraps a falsy scalar rather than treating it as nullish', () => {
    expect(restify(0)).toEqual([0] as any);
    expect(restify('')).toEqual([''] as any);
    expect(restify(false)).toEqual([false] as any);
    expect(restify(NaN)).toEqual([NaN] as any);
  });

  it('gives an empty array back untouched, by identity', () => {
    const source: string[] = [];

    expect(restify(source)).toBe(source as any);
  });

  it('gives an array from another realm back untouched', () => {
    const foreign = vm.runInNewContext('["a"]');

    expect(foreign).not.toBeInstanceOf(Array);
    expect(restify(foreign)).toBe(foreign);
  });

  it('wraps an array-like object as a scalar', () => {
    const arrayLike = { length: 1, 0: 'a' };

    expect(restify(arrayLike)).toEqual([arrayLike] as any);
  });

  it('wraps a fresh array for each call', () => {
    expect(restify('a')).not.toBe(restify('a'));
  });

  it('pins the marker as non-writable and non-configurable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(restify('a'), marker);

    expect(descriptor).toEqual({ value: true, writable: false, enumerable: false, configurable: false });
    expect(Object.getOwnPropertySymbols(restify(undefined))).toEqual([marker]);
  });

  it('leaves an incoming array unmarked', () => {
    expect(Object.getOwnPropertySymbols(restify(['a']))).toEqual([]);
  });
});

describe('unrestify', () => {
  it('unwraps what restify wrapped', () => {
    expect(unrestify(restify('a'))).toBe('a');
  });

  it('unwraps a wrapped undefined back to undefined', () => {
    expect(unrestify(restify(undefined))).toBeUndefined();
  });

  /** The marker's whole job: an array the caller passed in is a payload, not a wrapper to open. */
  it('leaves an unmarked one-element array alone', () => {
    expect(unrestify(['a'])).toEqual(['a']);
  });

  it('drops the marker from a multi-element wrap, returning a copy', () => {
    const wrapped = restify('a') as any;
    wrapped.push('b');
    const result = unrestify(wrapped);

    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(wrapped);
  });

  it('drops the marker from the copy it returns', () => {
    const wrapped = restify('a') as any;
    wrapped.push('b');

    expect(Object.getOwnPropertySymbols(unrestify(wrapped))).toEqual([]);
  });

  it('unwraps a wrapped null back to null', () => {
    expect(unrestify(restify(null))).toBeNull();
  });

  it('unwraps a wrapped falsy scalar to that scalar', () => {
    expect(unrestify(restify(0))).toBe(0);
    expect(unrestify(restify(''))).toBe('');
    expect(unrestify(restify(false))).toBe(false);
  });

  it('unwraps a wrapped object to the same object, by identity', () => {
    const value = { a: 1 };

    expect(unrestify(restify(value))).toBe(value);
  });

  it('leaves an unmarked empty array alone, by identity', () => {
    const source: string[] = [];

    expect(unrestify(source)).toBe(source);
  });

  it('leaves an unmarked multi-element array alone, by identity', () => {
    const source = ['a', 'b'];

    expect(unrestify(source)).toBe(source);
  });

  it('leaves an unmarked array from another realm alone, by identity', () => {
    const foreign = vm.runInNewContext('["a"]');

    expect(unrestify(foreign)).toBe(foreign);
  });

  it('throws a TypeError for a marked value that is not an array', () => {
    const impostor = { length: 1, 0: 'a' };
    Reflect.defineProperty(impostor, marker, { value: true });

    expect(() => unrestify(impostor as any)).toThrow(TypeError);
    expect(() => unrestify(impostor as any)).toThrow('Value must be an array');
  });

  it('throws a TypeError for a marked object with no length at all', () => {
    const impostor = {};
    Reflect.defineProperty(impostor, marker, { value: true });

    expect(() => unrestify(impostor as any)).toThrow(TypeError);
  });
});
