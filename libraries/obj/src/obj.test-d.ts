import { obj } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// `keys<T>` is a tuple only where every key is a plain required string member,
// and a `ReadonlyArray` of the key union everywhere else.

namespace keysAreATupleForPlainMembersTest {
  const keys = obj.keys({ a: 1, b: 'x' });

  // @ts-expect-no-error
  isAssignable<typeof keys, readonly ['a', 'b']>;
  // @ts-expect-no-error
  isAssignable<typeof keys[0], 'a'>;
  // @ts-expect-no-error
  isAssignable<typeof keys['length'], 2>;
  // @ts-expect-error - the tuple is fixed in declaration order
  isAssignable<typeof keys, readonly ['b', 'a']>;

  for (const key of keys) {
    // @ts-expect-no-error - iteration yields the key union, not `string`
    isAssignable<typeof key, 'a' | 'b'>;
  }

  // @ts-expect-no-error
  isAssignable<obj.keys<{}>, readonly []>;
}

namespace keysDropSymbolMembersTest {
  // @ts-expect-no-error
  isAssignable<obj.keys<{ [Symbol.iterator]: number; a: string; }>, readonly ['a']>;
}

namespace keysFallBackToAnArrayWhereUntuplableTest {
  type WithIndexKey = obj.keys<{ 0: number; a: string; }>;

  // @ts-expect-no-error
  isAssignable<WithIndexKey, readonly ('0' | 'a')[]>;
  // @ts-expect-error - an index key is hoisted at runtime, so no tuple is promised
  isAssignable<WithIndexKey, readonly ['0', 'a']>;

  type WithOptionalKey = obj.keys<{ a?: number; b: string; }>;

  // @ts-expect-no-error
  isAssignable<WithOptionalKey, readonly ('a' | 'b')[]>;
  // @ts-expect-error - an optional key may be absent, so no position is fixed
  isAssignable<WithOptionalKey, readonly ['a', 'b']>;

  type WithIndexSignature = obj.keys<Record<string, number>>;

  // @ts-expect-no-error
  isAssignable<WithIndexSignature, readonly string[]>;
  // @ts-expect-error - an index signature admits any number of keys
  isAssignable<WithIndexSignature, readonly [string]>;

  // @ts-expect-no-error
  isAssignable<obj.keys<readonly [1, 2]>, readonly string[]>;
}

namespace valuesAreTheUnionOfStringKeyedMembersTest {
  type Subject = obj.values<{ a: number; b: string; [Symbol.iterator]: boolean; }>;

  // @ts-expect-no-error
  isAssignable<Subject, number | string>;
  // @ts-expect-no-error
  isAssignable<number | string, Subject>;
  // @ts-expect-error - a symbol-named member is never listed
  isAssignable<boolean, Subject>;

  const values = obj.values({ a: 1, b: 'x' });

  // @ts-expect-no-error
  isAssignable<typeof values, (number | string)[]>;
}

// Each pair carries its own key's member type, so a test on the key narrows the value.
namespace anyEntryCorrelatesKeyAndValueTest {
  type Subject = obj.AnyEntry<{ a: number; b: string; }>;

  // @ts-expect-no-error
  isAssignable<Subject, readonly ['a', number] | readonly ['b', string]>;
  // @ts-expect-no-error
  isAssignable<readonly ['a', number] | readonly ['b', string], Subject>;
  // @ts-expect-error - a key never pairs with another member's type
  isAssignable<readonly ['a', string], Subject>;
}

namespace entriesFollowKeysTest {
  const entries = obj.entries({ a: 1, b: 'x' });

  // @ts-expect-no-error
  isAssignable<typeof entries, readonly [readonly ['a', number], readonly ['b', string]]>;
  // @ts-expect-no-error
  isAssignable<typeof entries[0], readonly ['a', number]>;

  type Untuplable = obj.entries<{ a?: number; b: string; }>;

  // @ts-expect-no-error
  isAssignable<Untuplable, readonly (readonly ['a', number | undefined] | readonly ['b', string])[]>;
  // @ts-expect-error - no tuple where `keys` promises none
  isAssignable<Untuplable, readonly [readonly ['a', number | undefined], readonly ['b', string]]>;
}

namespace keysToEntriesPairsInTheOrderGivenTest {
  type Subject = obj.keysToEntries<{ a: 1; b: 2; }, ['b', 'a']>;

  // @ts-expect-no-error
  isAssignable<Subject, readonly [readonly ['b', 2], readonly ['a', 1]]>;
}

namespace entryDefaultsToAStringKeyTest {
  // @ts-expect-no-error
  isAssignable<readonly [string, unknown], obj.Entry>;
  // @ts-expect-error - a numeric key is not an `Entry`
  isAssignable<readonly [number, unknown], obj.Entry>;
}

namespace fromEntriesKeysByEachPairTest {
  type Subject = obj.fromEntries<readonly ['a', 1] | readonly ['b', 2]>;

  // @ts-expect-no-error
  isAssignable<Subject, { a: 1; b: 2; }>;
  // @ts-expect-no-error
  isAssignable<{ a: 1; b: 2; }, Subject>;
  // @ts-expect-no-error
  isAssignable<obj.fromEntries<never>, {}>;

  const literal = obj.fromEntries([['a', 1], ['b', 'x']] as const);

  // @ts-expect-no-error
  isAssignable<typeof literal, { a: 1; b: 'x'; }>;

  const widened = obj.fromEntries([['a', 1], ['b', 'x']]);

  // @ts-expect-no-error - without `as const` the keys widen to an index signature
  isAssignable<typeof widened, { [key: string]: number | string; }>;
  // @ts-expect-error
  isAssignable<typeof widened, { a: number; b: string; }>;
}

namespace assignMergesObjectsByKeyTest {
  type Subject = obj.assign<[{ a: number; b: string; }, { b: number; c: boolean; }]>;

  // @ts-expect-no-error
  isAssignable<Subject, { a: number; b: number; c: boolean; }>;
  // @ts-expect-no-error
  isAssignable<{ a: number; b: number; c: boolean; }, Subject>;

  type ThreeSources = obj.assign<[{ a: 1; }, { a: 2; }, { a: 3; b: 1; }]>;

  // @ts-expect-no-error - the rightmost source wins
  isAssignable<ThreeSources, { a: 3; b: 1; }>;
  // @ts-expect-no-error
  isAssignable<{ a: 3; b: 1; }, ThreeSources>;

  // @ts-expect-no-error
  isAssignable<obj.assign<[]>, {}>;

  const merged = obj.assign({ a: 1 }, { b: 'x' }, { a: 'z' });

  // @ts-expect-no-error
  isAssignable<typeof merged, { a: string; b: string; }>;

  const alone = obj.assign({ a: 1 });

  // @ts-expect-no-error
  isAssignable<typeof alone, { a: number; }>;
}

namespace assignMergesArraysIndexWiseTest {
  type ShortOverlay = obj.assign<[[1, 2, 3], ['x']]>;

  // @ts-expect-no-error
  isAssignable<ShortOverlay, ['x', 2, 3]>;
  // @ts-expect-no-error
  isAssignable<['x', 2, 3], ShortOverlay>;

  type LongOverlay = obj.assign<[['a'], ['b', 'c']]>;

  // @ts-expect-no-error
  isAssignable<LongOverlay, ['b', 'c']>;
  // @ts-expect-no-error
  isAssignable<['b', 'c'], LongOverlay>;

  type UndefinedOverlay = obj.assign<[[1, 2], [undefined, 'y']]>;

  // @ts-expect-no-error - an explicit `undefined` falls back, unlike the runtime
  isAssignable<UndefinedOverlay, [1, 'y']>;

  type ObjectOverArray = obj.assign<[[1, 2], { a: 1; }]>;

  // @ts-expect-no-error - a non-array source merges by key onto the array's members
  isAssignable<ObjectOverArray, { 0: 1; 1: 2; a: 1; }>;
  // @ts-expect-no-error
  isAssignable<ObjectOverArray['length'], 2>;
}
