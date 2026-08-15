// http://compromise.cool/website/browse/to_infinitive.html

import { AnyOf, Consonant, Letter, ReplaceEnding } from '../util';
import { ToInfinitive as IrregularVerbs } from './irregular-verbs';

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase, including the unmatched fall-through.
export type ToInfinitive<T extends string> = _ToInfinitive<Lowercase<T>>;

type _ToInfinitive<T> =
  // T extends IrregularVerbs<T> ? IrregularVerbs<T> :
  IrregularVerbs<T> extends string ? IrregularVerbs<T>
    // {(ued) => 'ue'
    : T extends `${string}ued` ? ReplaceEnding<T, 'ued', 'ue'>
    // (e|i)lled => '$1ll'
    : T extends `${string}${AnyOf<'ei'>}lled` ? ReplaceEnding<T, 'lled', 'll'>
    // (sh|ch)ed => '$1'
    : T extends `${string}${'sh' | 'ch'}ed` ? ReplaceEnding<T, 'ed', ''>
    // (tl|gl)ed => '$1e'
    : T extends `${string}${'tl' | 'gl'}ed` ? ReplaceEnding<T, 'ed', 'e'>
    // (ss)ed => '$1'
    : T extends `${string}ssed` ? ReplaceEnding<T, 'ed', ''>
    // pped => 'p'
    : T extends `${string}pped` ? ReplaceEnding<T, 'ped', ''>
    // tted => 't'
    : T extends `${string}tted` ? ReplaceEnding<T, 'ted', ''>
    // gged => 'g'
    : T extends `${string}gged` ? ReplaceEnding<T, 'ged', ''>
    // (h|ion|n[dt]|ai.|[cs]t|pp|all|ss|tt|int|ail|ld|en|oo.|er|k|pp|w|ou.|rt|ght|rm)ed => '$1'
    : T extends
      (`${string}${'h' | 'ion' | `n${AnyOf<'dt'>}` | `ai${Letter}` | `${AnyOf<'cs'>}t` | `pp` | `all` | `ss` | `tt`
        | `int` | `ail` | `ld` | `en` | `oo${Letter}` | `er` | `k` | `pp` | `w` | `ou${Letter}` | `rt` | `ght`
        | `rm`}ed`) ? ReplaceEnding<T, 'ed', ''>
    // (..[^aeiou])ed => '$1e'
    // $1 captures everything up to and including the consonant (not the 'ed');
    // the replacement strips 'ed' and APPENDS 'e' (curved -> curve), it does not
    // simply drop the trailing 'e'.
    // Upstream's `..` requires TWO chars before the pre-'ed' consonant, so the
    // minimum match is THREE chars before 'ed' (e.g. curv|ed matches, us|ed does
    // not). The two `${Letter}`s supply that `..`, `${Consonant}` is the
    // `[^aeiou]`, and the leading `${string}` absorbs any longer prefix. Without
    // both `${Letter}`s a 4-letter VCed word (used, aged, aped) would wrongly
    // match here; upstream leaves those unchanged.
    : T extends `${string}${Letter}${Letter}${Consonant}ed` ? ReplaceEnding<T, 'ed', 'e'>
    // ied => 'y'
    : T extends `${string}ied` ? ReplaceEnding<T, 'ied', 'y'>
    // (.o)ed => '$1o'
    : T extends `${string}oed` ? ReplaceEnding<T, 'ed', 'o'>
    // (.i)ed => '$1'
    // DEAD ARM: unreachable. Every '...ied' input is already consumed by the
    // earlier `ied => 'y'` arm above, so control never reaches here. Kept in
    // place to mirror upstream's rule order (this arm is index #12 upstream,
    // likewise shadowed by `ied -> y` at index #10).
    : T extends `${string}ied` ? ReplaceEnding<T, 'ed', ''>
    // ([rl])ew => '$1ow'
    : T extends `${string}${AnyOf<'rl'>}ew` ? ReplaceEnding<T, 'ew', 'ow'>
    // ([pl])t => '$1t' //wtf? there is no change here
    // T extends `${string}${AnyOf<'pl'>}t` ? ReplaceEnding<T, 'ew', 'ow'> :
    : T;
