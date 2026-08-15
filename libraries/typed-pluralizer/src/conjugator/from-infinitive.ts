// http://compromise.cool/website/browse/from_infinitive.html
import { AnyOf, Letter, ReplaceEnding, Vowel } from '../util';
import { FromInfinitive as IrregularVerbs } from './irregular-verbs';

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase, including the unmatched fall-through.
export type FromInfinitive<T extends string> = _FromInfinitive<Lowercase<T>>;

type _FromInfinitive<T> =
  // T extends IrregularVerbs<T> ? IrregularVerbs<T> :
  // IrregularVerbs<T> extends string ? IrregularVerbs<T> :
  // (eave)$ => $1d
  T extends `${infer X}eave` ? `${X}eaved`
    // (end)$ => ent
    : T extends `${infer X}end` ? `${X}ent`
    // (ide)$ => ode
    : T extends `${infer X}ide` ? `${X}ode`
    // (ake)$ => ook
    : T extends `${infer X}ake` ? `${X}ook`
    // (eed)$ => $1ed
    : T extends `${infer X}eed` ? `${X}eeded`
    // (e)(ep)$ => $1pt
    : T extends `${infer X}eep` ? `${X}ept`
    // (a[tg]|i[zn]|ur|nc|gl|is)e$ => $1ed
    : T extends `${string}${`a${AnyOf<'tg'>}` | `i${AnyOf<'zn'>}` | `ur` | `nc` | `gl` | `is`}e` ? `${T}d`
    // ([i|f|rr])y$ => $1ied
    // The regex char class [i|f|rr] matches a SINGLE char (i, |, f, or r);
    // 'rr' would never match a single-r word like 'try', so the union member is 'r'.
    : T extends `${string}${'i' | 'f' | 'r'}y` ? ReplaceEnding<T, 'y', 'ied'>
    // ([td]er)$ => $1ed
    // $1 captures the whole '[td]er'; the replacement APPENDS 'ed'
    // (water -> watered, ponder -> pondered), it does not rewrite the ending.
    : T extends `${string}${'t' | 'd'}er` ? `${T}ed`
    // ([bd]l)e$ => $1ed
    : T extends `${string}${AnyOf<'bd'>}le` ? `${T}d`
    // (ish|tch|ess)$ => $1ed
    : T extends `${string}${`ish` | `tch` | `ess`}` ? `${T}ed`
    // (ion|end|e[nc]t)$ => $1ed
    : T extends `${string}${`ion` | `end` | `e${'n' | 'c'}t`}` ? `${T}ed`
    // (om)e$ => ame
    : T extends `${infer X}ome` ? `${X}ame`
    // ([aeiu])([pt])$ => $1$2
    : T extends `${string}${Exclude<Vowel, 'o'>}${AnyOf<'pt'>}` ? T
    // (er)$ => $1ed
    : T extends `${infer X}er` ? `${X}ered`
    // (en)$ => $1ed
    : T extends `${infer X}en` ? `${X}ened`
    // (..)(ow)$ => $1ew
    // The regex requires at least TWO chars before the final 'ow'
    // (know -> knew, throw -> threw); a single-char prefix like 'tow' must fall
    // through past this arm. Gate on two leading letters, then swap 'ow' -> 'ew'.
    : T extends `${string}${Letter}${Letter}ow` ? ReplaceEnding<T, 'ow', 'ew'>
    : T;
