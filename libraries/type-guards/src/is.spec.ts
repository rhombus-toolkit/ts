import { describe, expect, test } from 'bun:test';
import { hasValue, isArray, isAsyncGenerator, isAsyncGeneratorFunction, isAsyncIterable, isAsyncIterableIterator,
  isAsyncIteratorObject, isDefined, isFunction, isGenerator, isGeneratorFunction, isIterable, isIterableIterator,
  isIterator, isIteratorObject, isObject, isPromise, isPromiseLike, isReadonlyArray, isUndefined } from './is';

function* genFn() {
  yield 1;
}

async function* asyncGenFn() {
  yield 1;
}

/** A hand-rolled iterator: satisfies the contract, inherits nothing. */
const handRolledIterator = { next() {
  return { done: true as const, value: undefined };
} };

/** Iterable by contract only — the iterator it yields is a plain object. */
const handRolledIterable = { [Symbol.iterator]() {
  return handRolledIterator;
} };

const nothings = [null, undefined, 42, 'ab', {}, [], Object.create(null), 0, '', false, Symbol('s'), 10n, NaN];

/** Every exported guard, so the whole-surface invariants below cannot silently miss a new one. */
const everyGuard = [isArray, isReadonlyArray, isObject, isUndefined, isDefined, hasValue, isFunction, isPromise,
  isPromiseLike, isIterable, isAsyncIterable, isIterator, isIterableIterator, isAsyncIterableIterator, isIteratorObject,
  isAsyncIteratorObject, isGenerator, isAsyncGenerator, isGeneratorFunction, isAsyncGeneratorFunction];

describe('no guard has side effects', () => {
  test('none invokes Symbol.iterator, Symbol.asyncIterator, or next', () => {
    const calls: string[] = [];
    const spy = { get [Symbol.iterator]() {
      return () => {
        calls.push('Symbol.iterator');
        return handRolledIterator;
      };
    }, get [Symbol.asyncIterator]() {
      return () => {
        calls.push('Symbol.asyncIterator');
        return handRolledIterator;
      };
    }, next() {
      calls.push('next');
      return { done: true as const, value: undefined };
    } };

    for (const guard of [isIterable, isAsyncIterable, isIterator, isIterableIterator, isAsyncIterableIterator,
      isIteratorObject, isAsyncIteratorObject, isGenerator, isAsyncGenerator, isGeneratorFunction,
      isAsyncGeneratorFunction])
    {
      guard(spy);
    }

    expect(calls).toEqual([]);
  });
});

describe('no guard throws on primitives or nullish', () => {
  test('every guard returns a boolean for every non-object input', () => {
    for (const guard of everyGuard) {
      for (const value of nothings) {
        expect(typeof guard(value)).toBe('boolean');
      }
    }
  });

  test('a string is iterable rather than a TypeError', () => {
    expect(isIterable('ab')).toBe(true);
  });
});

describe('contract guards', () => {
  test('isIterable', () => {
    expect(isIterable('ab')).toBe(true);
    expect(isIterable([])).toBe(true);
    expect(isIterable(new Map())).toBe(true);
    expect(isIterable(handRolledIterable)).toBe(true);
    expect(isIterable({})).toBe(false);
    expect(isIterable(42)).toBe(false);
  });

  test('isIterator accepts a hand-rolled iterator', () => {
    expect(isIterator(handRolledIterator)).toBe(true);
    expect(isIterator([].values())).toBe(true);
    expect(isIterator([])).toBe(false);
  });

  test('isIterableIterator requires both halves', () => {
    expect(isIterableIterator([].values())).toBe(true);
    expect(isIterableIterator(genFn())).toBe(true);
    expect(isIterableIterator(handRolledIterator)).toBe(false);
    expect(isIterableIterator([])).toBe(false);
  });

  test('isAsyncIterable / isAsyncIterableIterator', () => {
    expect(isAsyncIterable(asyncGenFn())).toBe(true);
    expect(isAsyncIterable(genFn())).toBe(false);
    expect(isAsyncIterableIterator(asyncGenFn())).toBe(true);
    expect(isAsyncIterableIterator(genFn())).toBe(false);
  });
});

describe('prototype guards', () => {
  test('isIteratorObject separates intrinsic iterators from hand-rolled ones', () => {
    expect(isIteratorObject([].values())).toBe(true);
    expect(isIteratorObject(new Map().entries())).toBe(true);
    expect(isIteratorObject(genFn())).toBe(true);
    expect(isIteratorObject(handRolledIterator)).toBe(false);
    expect(isIteratorObject(asyncGenFn())).toBe(false);
  });

  test('an IteratorObject carries the ES2025 iterator helpers', () => {
    // Read through a cast: the helper methods are only on `IteratorObject`
    // from lib.esnext.iterator, and this package pins ES2018 deliberately.
    // The assertion is about runtime presence, not about naming the type.
    const iterator: unknown = [1, 2, 3].values();
    expect(isIteratorObject(iterator)).toBe(true);
    expect(typeof (iterator as { map?: unknown; }).map).toBe('function');
    expect(typeof (handRolledIterator as { map?: unknown; }).map).toBe('undefined');
  });

  test('isAsyncIteratorObject', () => {
    expect(isAsyncIteratorObject(asyncGenFn())).toBe(true);
    expect(isAsyncIteratorObject([].values())).toBe(false);
    expect(isAsyncIteratorObject(genFn())).toBe(false);
  });
});

describe('generators — the regression', () => {
  test('isGenerator accepts a generator OBJECT, not the function', () => {
    expect(isGenerator(genFn())).toBe(true);
    expect(isGenerator(genFn)).toBe(false);
  });

  test('isAsyncGenerator accepts an async generator object', () => {
    expect(isAsyncGenerator(asyncGenFn())).toBe(true);
    expect(isAsyncGenerator(asyncGenFn)).toBe(false);
  });

  test('sync and async generators are never conflated', () => {
    expect(isGenerator(asyncGenFn())).toBe(false);
    expect(isAsyncGenerator(genFn())).toBe(false);
  });

  test('an ordinary function is neither', () => {
    expect(isGenerator(() => {})).toBe(false);
    expect(isAsyncGenerator(() => {})).toBe(false);
  });

  test('isGeneratorFunction', () => {
    expect(isGeneratorFunction(genFn)).toBe(true);
    expect(isGeneratorFunction(asyncGenFn)).toBe(false);
    expect(isGeneratorFunction(genFn())).toBe(false);
    expect(isGeneratorFunction(() => {})).toBe(false);
    expect(isGeneratorFunction(async function() {})).toBe(false);
    expect(isGeneratorFunction(class {})).toBe(false);
  });

  test('isAsyncGeneratorFunction', () => {
    expect(isAsyncGeneratorFunction(asyncGenFn)).toBe(true);
    expect(isAsyncGeneratorFunction(genFn)).toBe(false);
    expect(isAsyncGeneratorFunction(asyncGenFn())).toBe(false);
  });
});

describe('promises', () => {
  test('isPromise is the prototype guard, isPromiseLike the contract guard', () => {
    const thenable = { then() {
      return undefined;
    } };
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise(thenable)).toBe(false);
    expect(isPromiseLike(Promise.resolve())).toBe(true);
    expect(isPromiseLike(thenable)).toBe(true);
  });
});

describe('the rest', () => {
  test('isArray / isFunction', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(genFn)).toBe(true);
    expect(isFunction({})).toBe(false);
  });

  test('isDefined admits null, hasValue does not', () => {
    expect(isDefined(null)).toBe(true);
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(0)).toBe(true);
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue(0)).toBe(true);
  });
});

describe('isObject', () => {
  test('null is not an object, despite typeof saying so', () => {
    expect(typeof null).toBe('object');
    expect(isObject(null)).toBe(false);
  });

  test('accepts every object shape, including exotic ones', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(true);
    expect(isObject(Object.create(null))).toBe(true);
    expect(isObject(new Map())).toBe(true);
    expect(isObject(Promise.resolve())).toBe(true);
    expect(isObject(genFn())).toBe(true);
  });

  test('rejects primitives and functions', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject('ab')).toBe(false);
    expect(isObject(false)).toBe(false);
    expect(isObject(Symbol('s'))).toBe(false);
    expect(isObject(10n)).toBe(false);
    // `typeof` reports 'function', not 'object', so a callable does not pass.
    expect(isObject(() => {})).toBe(false);
  });

  test('a boxed primitive is an object', () => {
    expect(isObject(Object(42))).toBe(true);
    expect(isObject(Object('ab'))).toBe(true);
  });
});

describe('isUndefined', () => {
  test('separates undefined from null and from other falsy values', () => {
    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined(0)).toBe(false);
    expect(isUndefined('')).toBe(false);
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined(NaN)).toBe(false);
  });

  test('is the exact complement of isDefined', () => {
    for (const value of nothings) {
      expect(isUndefined(value)).toBe(!isDefined(value));
    }
  });
});

describe('isReadonlyArray', () => {
  test('agrees with isArray on every input — readonly is a type-level distinction only', () => {
    for (const value of [...nothings, [1, 2], new Array(3), Object.freeze([1])]) {
      expect(isReadonlyArray(value)).toBe(isArray(value));
    }
  });

  test('a frozen array still passes', () => {
    expect(isReadonlyArray(Object.freeze([1, 2]))).toBe(true);
  });

  test('array-likes are not arrays', () => {
    expect(isArray({ length: 0 })).toBe(false);
    expect(isReadonlyArray({ length: 0 })).toBe(false);
  });
});

describe('isFunction', () => {
  test('accepts every callable form', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function() {})).toBe(true);
    expect(isFunction(async () => {})).toBe(true);
    expect(isFunction(genFn)).toBe(true);
    expect(isFunction(asyncGenFn)).toBe(true);
    expect(isFunction(class {})).toBe(true);
    expect(isFunction(Math.max)).toBe(true);
  });

  test('rejects non-callables', () => {
    expect(isFunction({})).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction('ab')).toBe(false);
  });
});

describe('nullish inputs specifically', () => {
  // Regression: hasMethod indexes its argument, so dropping its nullish guard
  // turns every contract guard into a TypeError on null rather than false.
  test('the contract guards return false for null and undefined', () => {
    for (const guard of [isIterable, isAsyncIterable, isIterator, isIterableIterator, isAsyncIterableIterator,
      isPromiseLike])
    {
      expect(guard(null)).toBe(false);
      expect(guard(undefined)).toBe(false);
    }
  });

  test('the prototype guards return false for null and undefined', () => {
    for (const guard of [isIteratorObject, isAsyncIteratorObject, isGenerator, isAsyncGenerator, isGeneratorFunction,
      isAsyncGeneratorFunction, isPromise])
    {
      expect(guard(null)).toBe(false);
      expect(guard(undefined)).toBe(false);
    }
  });

  test('an object with a null prototype does not throw', () => {
    const bare = Object.create(null) as object;
    for (const guard of everyGuard) {
      expect(typeof guard(bare)).toBe('boolean');
    }
  });
});

describe('the two guard kinds stay distinct', () => {
  test('every prototype-guard hit is also a contract-guard hit, never the reverse', () => {
    expect(isIteratorObject([].values())).toBe(true);
    expect(isIterator([].values())).toBe(true);

    // The hand-rolled iterator satisfies the contract and nothing else.
    expect(isIterator(handRolledIterator)).toBe(true);
    expect(isIteratorObject(handRolledIterator)).toBe(false);
  });

  test('a generator satisfies every sync guard at once', () => {
    const generator = genFn();
    expect(isIterator(generator)).toBe(true);
    expect(isIterable(generator)).toBe(true);
    expect(isIterableIterator(generator)).toBe(true);
    expect(isIteratorObject(generator)).toBe(true);
    expect(isGenerator(generator)).toBe(true);
    expect(isAsyncGenerator(generator)).toBe(false);
  });
});
