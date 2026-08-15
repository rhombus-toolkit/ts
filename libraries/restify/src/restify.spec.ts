import { describe, expect, it } from 'bun:test';
import { restify, unrestify } from './restify';

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
});
