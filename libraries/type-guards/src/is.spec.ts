import { describe, expect, test } from 'bun:test';
import {
    hasValue,
    isArray,
    isAsyncGenerator,
    isAsyncGeneratorFunction,
    isAsyncIterable,
    isAsyncIterableIterator,
    isAsyncIteratorObject,
    isDefined,
    isFunction,
    isGenerator,
    isGeneratorFunction,
    isIterable,
    isIterableIterator,
    isIterator,
    isIteratorObject,
    isPromise,
    isPromiseLike,
} from './is';

function* genFn() {
    yield 1;
}

async function* asyncGenFn() {
    yield 1;
}

/** A hand-rolled iterator: satisfies the contract, inherits nothing. */
const handRolledIterator = {
    next() {
        return { done: true as const, value: undefined };
    },
};

/** Iterable by contract only — the iterator it yields is a plain object. */
const handRolledIterable = {
    [Symbol.iterator]() {
        return handRolledIterator;
    },
};

const nothings = [null, undefined, 42, 'ab', {}, [], Object.create(null)];

describe('no guard has side effects', () => {
    test('none invokes Symbol.iterator, Symbol.asyncIterator, or next', () => {
        const calls: string[] = [];
        const spy = {
            get [Symbol.iterator]() {
                return () => {
                    calls.push('Symbol.iterator');
                    return handRolledIterator;
                };
            },
            get [Symbol.asyncIterator]() {
                return () => {
                    calls.push('Symbol.asyncIterator');
                    return handRolledIterator;
                };
            },
            next() {
                calls.push('next');
                return { done: true as const, value: undefined };
            },
        };

        for (const guard of [
            isIterable,
            isAsyncIterable,
            isIterator,
            isIterableIterator,
            isAsyncIterableIterator,
            isIteratorObject,
            isAsyncIteratorObject,
            isGenerator,
            isAsyncGenerator,
            isGeneratorFunction,
            isAsyncGeneratorFunction,
        ]) {
            guard(spy);
        }

        expect(calls).toEqual([]);
    });
});

describe('no guard throws on primitives or nullish', () => {
    test('every guard returns a boolean for every non-object input', () => {
        for (const guard of [
            isArray,
            isFunction,
            isPromise,
            isPromiseLike,
            isIterable,
            isAsyncIterable,
            isIterator,
            isIterableIterator,
            isAsyncIterableIterator,
            isIteratorObject,
            isAsyncIteratorObject,
            isGenerator,
            isAsyncGenerator,
            isGeneratorFunction,
            isAsyncGeneratorFunction,
        ]) {
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
        const iterator = [1, 2, 3].values();
        expect(isIteratorObject(iterator)).toBe(true);
        expect(typeof iterator.map).toBe('function');
        expect(typeof (handRolledIterator as { map?: unknown }).map).toBe('undefined');
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
        expect(isGeneratorFunction(async function () {})).toBe(false);
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
        const thenable = {
            then() {
                return undefined;
            },
        };
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
