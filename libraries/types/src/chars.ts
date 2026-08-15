/**
 * ASCII: 32
 * regex: \s
 */
export type SpaceChar = ' ';

/**
 * regex: \S
 */
export type NonSpaceChar = Exclude<AnyChar, SpaceChar>;

/**
 * ASCII: 33-47
 */
type SymbolChar1 = '!' | '"' | '#' | '$' | '%' | '&' | "'" | '(' | ')' | '*' | '+' | ',' | '-' | '.' | '/';

/**
 * ASCII: 48-57
 * regex: \d
 */
export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/**
 * regex: \D
 */
export type NonDigitChar = Exclude<AnyChar, DigitChar>;

/**
 * ASCII: 58 - 64
 */
type SymbolChar2 = ':' | ';' | '<' | '=' | '>' | '?' | '@';

/**
 * ASCII: 65 - 90
 * regex: [A-Z]
 */
export type UpperCaseChar = Uppercase<LowerCaseChar>;

/**
 * ASCII: 91 - 96
 */
type SymbolChar3 = '[' | '\\' | ']' | '^' | '_' | '`';

/**
 * ASCII: 97 - 122
 * regex: [a-z]
 */
export type LowerCaseChar = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o'
  | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z';

/**
 * ASCII: 123 - 126
 */
type SymbolChar4 = '{' | '|' | '}' | '~';

export type SymbolChar = SymbolChar1 | SymbolChar2 | SymbolChar3 | SymbolChar4;
export type LetterChar = UpperCaseChar | LowerCaseChar;

/**
 * almost the same as string but excludes things like \t, \n, etc that is highly unlikely one would want to be explicitely typed
 */
export type AnyChar = LetterChar | DigitChar | SymbolChar | SpaceChar;

/**
 * regez: \w
 */
export type WordChar = LetterChar | DigitChar | '_';

/**
 * regez: \W
 */
export type NonWordChar = Exclude<AnyChar, WordChar>;
