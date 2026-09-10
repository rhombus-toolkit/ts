import { AnyChar, DigitChar, LetterChar, LowerCaseChar, NonDigitChar, NonSpaceChar, NonWordChar, SpaceChar, SymbolChar,
  UpperCaseChar, WordChar } from './chars';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace caseTest {
  // @ts-expect-no-error
  isAssignable<'a' | 'm' | 'z', LowerCaseChar>;
  // @ts-expect-no-error
  isAssignable<'A' | 'M' | 'Z', UpperCaseChar>;
  // @ts-expect-error
  isAssignable<'A', LowerCaseChar>;
  // @ts-expect-error
  isAssignable<'a', UpperCaseChar>;

  // the two cases are the same alphabet
  // @ts-expect-no-error
  isAssignable<Uppercase<LowerCaseChar>, UpperCaseChar>;
  // @ts-expect-no-error
  isAssignable<Lowercase<UpperCaseChar>, LowerCaseChar>;
  // @ts-expect-no-error
  isAssignable<LowerCaseChar, Lowercase<UpperCaseChar>>;

  // @ts-expect-no-error
  isAssignable<LetterChar, UpperCaseChar | LowerCaseChar>;
  // @ts-expect-no-error
  isAssignable<UpperCaseChar | LowerCaseChar, LetterChar>;
}

namespace digitTest {
  // @ts-expect-no-error
  isAssignable<'0' | '5' | '9', DigitChar>;
  // @ts-expect-error
  isAssignable<'a', DigitChar>;
  // @ts-expect-error
  isAssignable<'10', DigitChar>;

  // @ts-expect-no-error
  isAssignable<'a' | '_' | ' ', NonDigitChar>;
  // @ts-expect-error
  isAssignable<'5', NonDigitChar>;
}

namespace spaceTest {
  // @ts-expect-no-error
  isAssignable<' ', SpaceChar>;
  // @ts-expect-no-error
  isAssignable<'a' | '5' | '_', NonSpaceChar>;
  // @ts-expect-error
  isAssignable<' ', NonSpaceChar>;
}

/** `\w` is letters, digits and the underscore; `\W` is every other printable. */
namespace wordTest {
  // @ts-expect-no-error
  isAssignable<'a' | 'Z' | '5' | '_', WordChar>;
  // @ts-expect-error
  isAssignable<'-', WordChar>;
  // @ts-expect-error
  isAssignable<' ', WordChar>;

  // @ts-expect-no-error
  isAssignable<'-' | ' ' | '.' | '@' | '~', NonWordChar>;
  // @ts-expect-error
  isAssignable<'_', NonWordChar>;
  // @ts-expect-error
  isAssignable<'a', NonWordChar>;
}

/** Every printable ASCII symbol, across all four gaps in the table. */
namespace symbolTest {
  // @ts-expect-no-error
  isAssignable<'!' | '/' | ':' | '@' | '[' | '`' | '{' | '~', SymbolChar>;
  // the underscore is a symbol as well as a word char
  // @ts-expect-no-error
  isAssignable<'_', SymbolChar & WordChar>;
  // @ts-expect-error
  isAssignable<'a', SymbolChar>;
  // @ts-expect-error
  isAssignable<' ', SymbolChar>;
}

/** Printable ASCII only: control characters are deliberately absent. */
namespace anyCharTest {
  // @ts-expect-no-error
  isAssignable<LetterChar | DigitChar | SymbolChar | SpaceChar, AnyChar>;
  // @ts-expect-no-error
  isAssignable<AnyChar, string>;
  // @ts-expect-error
  isAssignable<'\n', AnyChar>;
  // @ts-expect-error
  isAssignable<'\t', AnyChar>;
  // @ts-expect-error
  isAssignable<'ab', AnyChar>;
  // @ts-expect-error
  isAssignable<'é', AnyChar>;
}
