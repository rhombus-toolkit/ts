// http://compromise.cool/website/browse/from_infinitive.html
import { AnyOf, ReplaceEnding, Vowel } from '../util';
import { FromInfinitive as IrregularVerbs } from './irregular-verbs';

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase, including the unmatched fall-through.
export type FromInfinitive<T extends string> = _FromInfinitive<Lowercase<T>>;

type _FromInfinitive<T> =
    // T extends IrregularVerbs<T> ? IrregularVerbs<T> :
    // IrregularVerbs<T> extends string ? IrregularVerbs<T> :
    // (eave)$ => $1d
    T extends `${infer X}eave` ? `${X}eaved`
    : // (end)$ => ent
    T extends `${infer X}end` ? `${X}ent`
    : // (ide)$ => ode
    T extends `${infer X}ide` ? `${X}ode`
    : // (ake)$ => ook
    T extends `${infer X}ake` ? `${X}ook`
    : // (eed)$ => $1ed
    T extends `${infer X}eed` ? `${X}eeded`
    : // (e)(ep)$ => $1pt
    T extends `${infer X}eep` ? `${X}ept`
    : // (a[tg]|i[zn]|ur|nc|gl|is)e$ => $1ed
    T extends `${string}${`a${AnyOf<'tg'>}` | `i${AnyOf<'zn'>}` | `ur` | `nc` | `gl` | `is`}e` ? `${T}d`
    : // ([i|f|rr])y$ => $1ied
    T extends `${string}${'i' | 'f' | 'rr'}y` ? ReplaceEnding<T, 'y', 'ied'>
    : // ([td]er)$ => $1ed
    T extends `${string}${'t' | 'd'}er` ? ReplaceEnding<T, 'r', 'd'>
    : // ([bd]l)e$ => $1ed
    T extends `${string}${AnyOf<'bd'>}le` ? `${T}d`
    : // (ish|tch|ess)$ => $1ed
    T extends `${string}${`ish` | `tch` | `ess`}` ? `${T}ed`
    : // (ion|end|e[nc]t)$ => $1ed
    T extends `${string}${`ion` | `end` | `e${'n' | 'c'}t`}` ? `${T}ed`
    : // (om)e$ => ame
    T extends `${infer X}ome` ? `${X}ame`
    : // ([aeiu])([pt])$ => $1$2
    T extends `${string}${Exclude<Vowel, 'o'>}${AnyOf<'pt'>}` ? T
    : // (er)$ => $1ed
    T extends `${infer X}er` ? `${X}ered`
    : // (en)$ => $1ed
    T extends `${infer X}en` ? `${X}ened`
    : // (..)(ow)$ => $1ew
    T extends `${infer X}${infer Y}ow` ? `${X}${Y}ew`
    : T;
