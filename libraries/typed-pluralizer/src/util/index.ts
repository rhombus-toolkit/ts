// BNF-style character classes. Lowercase-only by design: the public rule
// types fold their input through `Lowercase<T>` before matching, so the
// internal rule chains only ever see lowercase words.
export type Vowel = 'a' | 'e' | 'i' | 'o' | 'u';

export type Consonant =
    | 'b'
    | 'c'
    | 'd'
    | 'f'
    | 'g'
    | 'h'
    | 'j'
    | 'k'
    | 'l'
    | 'm'
    | 'n'
    | 'p'
    | 'q'
    | 'r'
    | 's'
    | 't'
    | 'v'
    | 'w'
    | 'x'
    | 'y'
    | 'z';

export type Letter = Vowel | Consonant;

export type Replace<S, P extends string, R extends string> = S extends `${infer X}${P}${infer Y}` ? `${X}${R}${Y}` : S;

type ClearStart<S, P extends string> = S extends `${P}${infer X}` ? X : S;

export type ExtractEnding<S, P extends string> = S extends `${infer X}${P}` ? ClearStart<S, X> : never;

export type ReplaceEnding<S, P extends string, R extends string> =
    S extends `${infer X}${ExtractEnding<S, P>}` ? `${X}${R}` : S;

export type AnyOf<T> =
    T extends '' ? never
    : T extends `${infer X}${infer Y}` ? X | AnyOf<Y>
    : never;

export type NoneOf<T> = Exclude<Letter, AnyOf<T>>;

export type Not<T extends string, U> = T extends U ? never : T;
