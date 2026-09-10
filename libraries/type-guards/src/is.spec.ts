import type { Func } from '@rhombus-toolkit/types';
import { describe, expect, test } from 'bun:test';
import { AsyncGeneratorFunctionCtor, GeneratorFunctionCtor, hasMember, hasValue, isAllThere, isArray, isAsyncGenerator,
  isAsyncGeneratorFunction, isAsyncIterable, isAsyncIterableIterator, isAsyncIteratorObject, isDefined, isFunction,
  isGenerator, isGeneratorFunction, isIterable, isIterableIterator, isIterator, isIteratorObject, isObject, isPromise,
  isPromiseLike, isReadonlyArray, isUndefined } from './is';

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

/** `%IteratorPrototype%`, reached through the seed the way `is.ts` reaches it — the intrinsic has no global binding under this package's ES2018 lib. */
const IteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(genFn.prototype));

/**
 * The mirror of {@link handRolledIterator}: inherits every helper and has no `next` for them to
 * pull. `Object.create(Iterator.prototype)` and `class B extends Iterator {}` both land here.
 */
const helpersWithoutNext: { next?: unknown; toArray?: Func<[], unknown>; } = Object.create(IteratorPrototype);

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

  test('isIteratorObject rejects an inheritor with no next to drive the helpers', () => {
    expect(helpersWithoutNext.next).toBeUndefined();
    expect(typeof helpersWithoutNext.toArray).toBe('function');
    expect(isIterator(helpersWithoutNext)).toBe(false);
    expect(isIteratorObject(helpersWithoutNext)).toBe(false);
    expect(() => helpersWithoutNext.toArray?.()).toThrow(TypeError);
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

describe('isAllThere', () => {
  test('is true when no element is undefined', () => {
    expect(isAllThere([1, 2, 3])).toBe(true);
  });

  test('is false when any element is undefined', () => {
    expect(isAllThere([1, undefined, 3])).toBe(false);
  });

  test('is true for an empty source', () => {
    expect(isAllThere([])).toBe(true);
  });

  test('counts every other falsy value as present', () => {
    expect(isAllThere([0, '', false, null, Number.NaN])).toBe(true);
  });

  test('reads to the end rather than stopping at the first defined element', () => {
    expect(isAllThere(['a', 'b'])).toBe(true);
    expect(isAllThere(['a', undefined])).toBe(false);
  });
});

describe('hasMember', () => {
  test('is true for an own member whatever it holds, undefined included', () => {
    expect(hasMember({ foo: undefined }, 'foo')).toBe(true);
    expect(hasMember({ foo: 0 }, 'foo')).toBe(true);
  });

  test('is false for a key the object does not carry', () => {
    expect(hasMember({}, 'foo')).toBe(false);
    expect(hasMember(Object.create(null), 'foo')).toBe(false);
  });

  test('sees inherited members', () => {
    expect(hasMember({}, 'toString')).toBe(true);
    expect(hasMember(Object.create({ inherited: 1 }), 'inherited')).toBe(true);
  });

  test('boxes a primitive rather than throwing, so a string carries length', () => {
    expect(hasMember('', 'length')).toBe(true);
    expect(hasMember(42, 'toFixed')).toBe(true);
    expect(hasMember(42, 'foo')).toBe(false);
  });

  test('is false for null and undefined', () => {
    expect(hasMember(null, 'foo')).toBe(false);
    expect(hasMember(undefined, 'foo')).toBe(false);
  });

  test('accepts a symbol key', () => {
    expect(hasMember([], Symbol.iterator)).toBe(true);
    expect(hasMember({}, Symbol.iterator)).toBe(false);
  });

  test('accepts a numeric key, so an array index counts', () => {
    expect(hasMember(['a'], 0)).toBe(true);
    expect(hasMember(['a'], 1)).toBe(false);
  });
});

describe('the generator function constructors', () => {
  test('GeneratorFunctionCtor is what every generator function is an instance of', () => {
    expect(genFn).toBeInstanceOf(GeneratorFunctionCtor);
    expect(asyncGenFn).not.toBeInstanceOf(GeneratorFunctionCtor);
    expect(() => {}).not.toBeInstanceOf(GeneratorFunctionCtor);
  });

  test('AsyncGeneratorFunctionCtor is what every async generator function is an instance of', () => {
    expect(asyncGenFn).toBeInstanceOf(AsyncGeneratorFunctionCtor);
    expect(genFn).not.toBeInstanceOf(AsyncGeneratorFunctionCtor);
  });

  test('each builds a function of its kind from source text', () => {
    const built = new GeneratorFunctionCtor('yield 1; yield 2;');
    const builtAsync = new AsyncGeneratorFunctionCtor('yield 1;');

    expect(isGeneratorFunction(built)).toBe(true);
    expect([...built()]).toEqual([1, 2]);
    expect(isAsyncGeneratorFunction(builtAsync)).toBe(true);
  });
});

describe('contract guards, the shapes that fall short', () => {
  test('isIterator rejects a next that is not callable', () => {
    expect(isIterator({ next: 1 })).toBe(false);
    expect(isIterator({ next: undefined })).toBe(false);
  });

  test('isIterable rejects a Symbol.iterator that is not callable', () => {
    expect(isIterable({ [Symbol.iterator]: 1 })).toBe(false);
  });

  test('isIterable rejects null-prototype objects and primitives without the protocol', () => {
    expect(isIterable(Object.create(null))).toBe(false);
    expect(isIterable(42)).toBe(false);
    expect(isIterable(Symbol('s'))).toBe(false);
  });

  test('isAsyncIterable rejects a sync-only iterable', () => {
    expect(isAsyncIterable([])).toBe(false);
    expect(isAsyncIterable('ab')).toBe(false);
    expect(isAsyncIterable({ [Symbol.asyncIterator]: 1 })).toBe(false);
  });

  test('isAsyncIterable accepts a hand-rolled async iterable', () => {
    expect(isAsyncIterable({ [Symbol.asyncIterator]() {
      return handRolledIterator;
    } })).toBe(true);
  });

  test('isAsyncIterableIterator needs next as well as Symbol.asyncIterator', () => {
    expect(isAsyncIterableIterator({ [Symbol.asyncIterator]() {
      return handRolledIterator;
    } })).toBe(false);
    expect(isAsyncIterableIterator({ next() {
      return Promise.resolve({ done: true as const, value: undefined });
    }, [Symbol.asyncIterator]() {
      return this;
    } })).toBe(true);
  });

  test('isPromiseLike rejects a then that is not callable', () => {
    expect(isPromiseLike({ then: true })).toBe(false);
    expect(isPromiseLike({})).toBe(false);
    expect(isPromiseLike(42)).toBe(false);
  });

  test('isPromise rejects a thenable class instance that is not a Promise', () => {
    class Thenable {
      then(): undefined {
        return undefined;
      }
    }

    expect(isPromise(new Thenable())).toBe(false);
    expect(isPromiseLike(new Thenable())).toBe(true);
  });

  test('isPromise accepts a subclass of Promise', () => {
    class Deferred extends Promise<number> {}

    expect(isPromise(Deferred.resolve(1))).toBe(true);
  });
});

describe('prototype guards, inheritors and lookalikes', () => {
  test('isIteratorObject accepts an inheritor of %IteratorPrototype% that supplies its own next', () => {
    const inheritor = Object.create(IteratorPrototype, { next: { value: () => ({ done: true, value: undefined }) } });

    expect(isIteratorObject(inheritor)).toBe(true);
    expect(isIterator(inheritor)).toBe(true);
  });

  test('isIteratorObject accepts every built-in iterator kind', () => {
    expect(isIteratorObject('ab'[Symbol.iterator]())).toBe(true);
    expect(isIteratorObject(new Set([1]).values())).toBe(true);
    expect(isIteratorObject(new Map([[1, 2]]).keys())).toBe(true);
    expect(isIteratorObject([1, 2].entries())).toBe(true);
  });

  test('isIteratorObject rejects an iterable that is not itself an iterator', () => {
    expect(isIteratorObject([])).toBe(false);
    expect(isIteratorObject(new Set())).toBe(false);
    expect(isIteratorObject('ab')).toBe(false);
  });

  test('isAsyncIteratorObject rejects a hand-rolled async iterator', () => {
    expect(isAsyncIteratorObject({ next() {
      return Promise.resolve({ done: true as const, value: undefined });
    }, [Symbol.asyncIterator]() {
      return this;
    } })).toBe(false);
  });

  test('isGenerator rejects an object that merely satisfies the iterator contract', () => {
    expect(isGenerator([].values())).toBe(false);
    expect(isGenerator(handRolledIterator)).toBe(false);
  });

  test('isGenerator accepts a generator made from a generator method or an arrow-bound class', () => {
    const holder = { *walk() {
      yield 1;
    } };
    class Walker {
      *walk() {
        yield 1;
      }
    }

    expect(isGenerator(holder.walk())).toBe(true);
    expect(isGenerator(new Walker().walk())).toBe(true);
    expect(isGeneratorFunction(holder.walk)).toBe(true);
    expect(isGeneratorFunction(Walker.prototype.walk)).toBe(true);
  });

  test('a bound generator function is still a generator function, and calling it still makes a generator', () => {
    const bound = genFn.bind(null);

    expect(isGeneratorFunction(bound)).toBe(true);
    expect(isGenerator(bound())).toBe(true);
  });
});

describe('cross-realm values', () => {
  const { runInNewContext } = require('node:vm') as { runInNewContext: Func<[string], any>; };
  const foreignGenFn = runInNewContext('(function* () { yield 1; })');
  const foreignAsyncGenFn = runInNewContext('(async function* () { yield 1; })');
  const foreignArray = runInNewContext('[1, 2]');
  const foreignPromise = runInNewContext('Promise.resolve(1)');
  const foreignArrayIterator = runInNewContext('[1, 2].values()');

  test("the fixtures inherit the other realm's intrinsics, not this one's", () => {
    expect(Object.getPrototypeOf(foreignArray)).not.toBe(Array.prototype);
    expect(foreignPromise instanceof Promise).toBe(false);
    expect(Object.getPrototypeOf(foreignGenFn)).not.toBe(Object.getPrototypeOf(genFn));
  });

  test('isArray and isReadonlyArray see a foreign array', () => {
    expect(isArray(foreignArray)).toBe(true);
    expect(isReadonlyArray(foreignArray)).toBe(true);
  });

  test('isGenerator and isAsyncGenerator fall back to the type tag for a foreign generator', () => {
    expect(isGenerator(foreignGenFn())).toBe(true);
    expect(isAsyncGenerator(foreignAsyncGenFn())).toBe(true);
    expect(isGenerator(foreignAsyncGenFn())).toBe(false);
    expect(isAsyncGenerator(foreignGenFn())).toBe(false);
  });

  test('isGeneratorFunction and isAsyncGeneratorFunction fall back to the type tag for a foreign function', () => {
    expect(isGeneratorFunction(foreignGenFn)).toBe(true);
    expect(isAsyncGeneratorFunction(foreignAsyncGenFn)).toBe(true);
    expect(isGeneratorFunction(foreignAsyncGenFn)).toBe(false);
    expect(isAsyncGeneratorFunction(foreignGenFn)).toBe(false);
  });

  test('a foreign promise reads as isPromiseLike only', () => {
    expect(isPromiseLike(foreignPromise)).toBe(true);
    expect(isPromise(foreignPromise)).toBe(false);
  });

  test('the contract guards accept foreign iterators and iterables', () => {
    expect(isIterable(foreignArray)).toBe(true);
    expect(isIterator(foreignArrayIterator)).toBe(true);
    expect(isIterableIterator(foreignArrayIterator)).toBe(true);
    expect(isIterator(foreignGenFn())).toBe(true);
  });

  test('isIteratorObject recognises a foreign built-in iterator by its tag, as the generator guards do', () => {
    expect(typeof foreignArrayIterator.map).toBe('function');
    expect(isIteratorObject(foreignArrayIterator)).toBe(true);
    expect(isIteratorObject(foreignGenFn())).toBe(true);
    expect(isIteratorObject(runInNewContext('new Map().entries().map((entry) => entry)'))).toBe(true);
    expect(isIteratorObject(runInNewContext('Iterator.from({ next() { return { done: true }; } })'))).toBe(true);
    // a foreign %IteratorPrototype% carries the tag but no next, so it still fails
    expect(isIteratorObject(runInNewContext('Iterator.prototype'))).toBe(false);
    // a spoofed tag without next fails; with next it passes, the same weakness isGenerator accepts
    expect(isIteratorObject({ [Symbol.toStringTag]: 'Array Iterator' })).toBe(false);
  });

  test('isAsyncIteratorObject recognises a foreign async generator by its tag', () => {
    expect(isAsyncIteratorObject(foreignAsyncGenFn())).toBe(true);
  });
});
