import { mapEntries, mapValues } from './obj';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

const source = { a: 1, b: 'x', c: true };

// The pair arrives as one discriminated union, so testing the key narrows the value --
// the correlation two separate `(key, value)` parameters would have lost.
namespace correlatedEntryTest {
  mapEntries(source, entry => {
    if (entry[0] === 'a') {
      // @ts-expect-no-error
      isAssignable<typeof entry[1], number>();
    }
    if (entry[0] === 'b') {
      // @ts-expect-no-error
      isAssignable<typeof entry[1], string>();
    }
    return [entry[0], entry[1]] as const;
  });
}

namespace mapEntriesResultTest {
  const remapped = mapEntries(source, entry => [`k_${entry[0]}`, 0] as const);

  // @ts-expect-no-error
  isAssignable<typeof remapped, { k_a: 0; k_b: 0; k_c: 0; }>();
}

namespace mapValuesResultTest {
  const lengths = mapValues(source, entry => String(entry[1]).length);

  // @ts-expect-no-error
  isAssignable<typeof lengths, { a: number; b: number; c: number; }>();
}
