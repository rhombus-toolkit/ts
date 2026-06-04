import { PluralizationRules } from './pluralization-rules';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Coverage for the implemented regex-derived rules. Assertions pin what the
// rules emit TODAY; cases that are linguistically wrong but expected-someday are
// marked @ts-expect-error with the actual produced literal in the TODO.

namespace axis {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'axis'>, 'axes'>;
}

namespace alias {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alias'>, 'aliases'>;
}

namespace alumnus {
  // expected 'alumni'
  // @ts-expect-error
  isAssignable<PluralizationRules<'alumnus'>, 'alumni'>; // TODO known-wrong: produces 'alumnuses'
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alumnus'>, 'alumnuses'>;
}

namespace hero {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'hero'>, 'heroes'>;
}

namespace unmatched {
  // Words that match no implemented rule fall through to `never`.
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cat'>, never>;
  // @ts-expect-no-error
  isAssignable<never, PluralizationRules<'cat'>>;
}
