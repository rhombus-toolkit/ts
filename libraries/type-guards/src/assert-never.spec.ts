import { describe, expect, it } from 'bun:test';
import { assertNever } from './assert-never';

/** Calls `assertNever` with a value the type system would never let through, which is exactly the runtime case it guards. */
function reach(value: unknown): never {
  return assertNever(value as never);
}

describe('assertNever', () => {
  it('throws an Error rather than returning', () => {
    expect(() => reach('unexpected')).toThrow(Error);
  });

  it('names the value it was given in the message', () => {
    expect(() => reach('unexpected')).toThrow('Unexpected object: unexpected');
  });

  it('survives a symbol argument, which a plain string concatenation would choke on', () => {
    expect(() => reach(Symbol('stray'))).toThrow('Unexpected object: Symbol(stray)');
  });

  it('survives null and undefined', () => {
    expect(() => reach(null)).toThrow('Unexpected object: null');
    expect(() => reach(undefined)).toThrow('Unexpected object: undefined');
  });

  it('describes an object through its own string form', () => {
    expect(() => reach({ kind: 'circle' })).toThrow('Unexpected object: [object Object]');
    expect(() => reach({ toString: () => 'circle' })).toThrow('Unexpected object: circle');
  });

  it('describes a bigint and a number without a type error', () => {
    expect(() => reach(10n)).toThrow('Unexpected object: 10');
    expect(() => reach(Number.NaN)).toThrow('Unexpected object: NaN');
  });
});
