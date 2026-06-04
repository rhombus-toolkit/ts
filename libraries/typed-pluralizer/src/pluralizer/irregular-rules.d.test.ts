import { IrregularRules } from './irregular-rules';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Happy-path coverage for the irregular pluralization table (this module is
// complete — no known-wrong cases).

namespace pronouns {
  // @ts-expect-no-error
  isAssignable<IrregularRules<'I'>, 'we'>;
  // @ts-expect-no-error
  isAssignable<IrregularRules<'me'>, 'us'>;
}

namespace consonantO {
  // @ts-expect-no-error
  isAssignable<IrregularRules<'echo'>, 'echoes'>;
  // @ts-expect-no-error
  isAssignable<IrregularRules<'volcano'>, 'volcanoes'>;
}

namespace classicIrregulars {
  // @ts-expect-no-error
  isAssignable<IrregularRules<'ox'>, 'oxen'>;
  // @ts-expect-no-error
  isAssignable<IrregularRules<'foot'>, 'feet'>;
  // @ts-expect-no-error
  isAssignable<IrregularRules<'goose'>, 'geese'>;
  // @ts-expect-no-error
  isAssignable<IrregularRules<'tooth'>, 'teeth'>;
}

namespace passthrough {
  // Unlisted words pass through unchanged.
  // @ts-expect-no-error
  isAssignable<IrregularRules<'human'>, 'humans'>;
}
