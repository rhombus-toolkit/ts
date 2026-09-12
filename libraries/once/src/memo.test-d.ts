// Type-level probes for memo: the memoized function keeps compute's exact parameter tuple and
// answer, and every key has to be something a WeakMap can hold.

import { memo } from './memo';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace keysMustBeWeaklyHoldableTest {
  // @ts-expect-no-error
  memo((key: object) => key);
  // @ts-expect-no-error
  memo((key: { id: number; }, other: readonly string[]) => key.id + other.length);
  // @ts-expect-error - a number cannot key a WeakMap
  memo((key: number) => key);
  // @ts-expect-error - every key in the tuple has to be weakly holdable, not just the first
  memo((key: object, other: string) => [key, other]);
}

// A compute taking no key is not turned away -- fewer parameters always assign -- but the memo
// it answers with still demands a key at every call.
namespace zeroParameterComputeStillDemandsAKeyTest {
  const constant = memo(() => 1);

  // @ts-expect-error - there is no key to remember the answer under
  constant();
  // @ts-expect-no-error
  constant({});
}

namespace signatureIsKeptExactTest {
  const sizeOf = memo((key: { items: number[]; }) => key.items.length);

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof sizeOf>, number>;
  // @ts-expect-no-error
  isAssignable<Parameters<typeof sizeOf>, [{ items: number[]; }]>;
  // @ts-expect-error - a second key is not part of the tuple
  sizeOf({ items: [] }, {});
  // @ts-expect-error - the key's shape is compute's, not a loose WeakKey
  sizeOf({});

  const join = memo((left: { name: string; }, right: { name: string; }) => left.name + right.name);

  // @ts-expect-no-error
  isAssignable<Parameters<typeof join>, [{ name: string; }, { name: string; }]>;
  // @ts-expect-error - the tuple is exact, so the second key cannot be dropped
  join({ name: 'a' });
}

namespace answerTypeFlowsThroughTest {
  const nothing = memo((_key: object) => undefined);
  const maybe = memo((_key: object) => Math.random() > 0.5 ? 'yes' : undefined);

  // @ts-expect-no-error
  isAssignable<ReturnType<typeof nothing>, undefined>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof maybe>, string | undefined>;
  // @ts-expect-error - the answer is not narrowed past what compute declares
  isAssignable<ReturnType<typeof maybe>, string>;
}

namespace selectKeysAdmitsAPrimitiveArgumentTest {
  // @ts-expect-no-error
  memo((n: number) => n, (n) => [n]);
  // @ts-expect-error - without selectKeys, a number cannot key a WeakMap
  memo((n: number) => n);
  // @ts-expect-error - selectKeys has to answer an array of keys
  memo((n: number) => n, (n) => n);
}

namespace selectKeysOverloadKeepsArgsAndValueTest {
  const idOf = memo((person: { id: number; }) => person.id, (person) => [person.id]);

  // @ts-expect-no-error
  isAssignable<Parameters<typeof idOf>, [{ id: number; }]>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof idOf>, number>;
  // @ts-expect-error - the key's shape is compute's argument, not a loose object
  idOf({});
}
