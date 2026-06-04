// http://compromise.cool/website/browse/to_infinitive.html

import { AnyOf, Consonant, Letter, ReplaceEnding } from '../util';
import { ToInfinitive as IrregularVerbs } from './irregular-verbs';

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase, including the unmatched fall-through.
export type ToInfinitive<T extends string> = _ToInfinitive<Lowercase<T>>;

type _ToInfinitive<T> =
    // T extends IrregularVerbs<T> ? IrregularVerbs<T> :
    IrregularVerbs<T> extends string ? IrregularVerbs<T>
    : // {(ued) => 'ue'
    T extends `${string}ued` ? ReplaceEnding<T, 'ued', 'ue'>
    : // (e|i)lled => '$1ll'
    T extends `${string}${AnyOf<'ei'>}lled` ? ReplaceEnding<T, 'lled', 'll'>
    : // (sh|ch)ed => '$1'
    T extends `${string}${'sh' | 'ch'}ed` ? ReplaceEnding<T, 'ed', ''>
    : // (tl|gl)ed => '$1e'
    T extends `${string}${'tl' | 'gl'}ed` ? ReplaceEnding<T, 'ed', 'e'>
    : // (ss)ed => '$1'
    T extends `${string}ssed` ? ReplaceEnding<T, 'ed', ''>
    : // pped => 'p'
    T extends `${string}pped` ? ReplaceEnding<T, 'ped', ''>
    : // tted => 't'
    T extends `${string}tted` ? ReplaceEnding<T, 'ted', ''>
    : // gged => 'g'
    T extends `${string}gged` ? ReplaceEnding<T, 'ged', ''>
    : // (h|ion|n[dt]|ai.|[cs]t|pp|all|ss|tt|int|ail|ld|en|oo.|er|k|pp|w|ou.|rt|ght|rm)ed => '$1'
    T extends (
        `${string}${'h' | 'ion' | `n${AnyOf<'dt'>}` | `ai${Letter}` | `${AnyOf<'cs'>}t` | `pp` | `all` | `ss` | `tt` | `int` | `ail` | `ld` | `en` | `oo${Letter}` | `er` | `k` | `pp` | `w` | `ou${Letter}` | `rt` | `ght` | `rm`}ed`
    ) ?
        ReplaceEnding<T, 'ed', ''>
    : // (..[^aeiou])ed => '$1e'
    T extends `${string}${string}${Consonant}ed` ? ReplaceEnding<T, 'ed', ''>
    : // ied => 'y'
    T extends `${string}ied` ? ReplaceEnding<T, 'ied', 'y'>
    : // (.o)ed => '$1o'
    T extends `${string}oed` ? ReplaceEnding<T, 'ed', 'o'>
    : // (.i)ed => '$1''
    T extends `${string}ied` ? ReplaceEnding<T, 'ed', ''>
    : // ([rl])ew => '$1ow'
    T extends `${string}${AnyOf<'rl'>}ew` ? ReplaceEnding<T, 'ew', 'ow'>
    : // ([pl])t => '$1t' //wtf? there is no change here
        //T extends `${string}${AnyOf<'pl'>}t` ? ReplaceEnding<T, 'ew', 'ow'> :

        T;
