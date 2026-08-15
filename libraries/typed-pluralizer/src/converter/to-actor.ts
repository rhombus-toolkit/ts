// http://compromise.cool/website/browse/to_actor.html
//
// Verb -> actor noun (the doer). Upstream `actor(str)`: coerces falsy input to
// '', checks a 12-word `dont` gate (returns null), then a 10-entry irregular
// map, then iterates 4 transform rules first-match-wins, then falls through
// appending `er`.
//
// `never` mapping: upstream returns null for any word in the `dont` list (no
// actor form exists). Per the "upstream returns null/undefined => the type
// resolves to never" convention, every `dont` member maps to `never`. The empty
// input (`str || ''`) also yields no real actor; it falls through the rules to
// 'er', matching upstream, so it is not special-cased to never.
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream /i regexes preserve case.

import { AnyOf, Letter, ReplaceEnding, Vowel } from '../util';

// Irregular verb->actor pairs (upstream `irregulars` object literal).
type irregulars = {
  tie: 'tier'; // 'tie': 'tier'
  dream: 'dreamer'; // 'dream': 'dreamer'
  sail: 'sailer'; // 'sail': 'sailer'
  run: 'runner'; // 'run': 'runner'
  rub: 'rubber'; // 'rub': 'rubber'
  begin: 'beginner'; // 'begin': 'beginner'
  win: 'winner'; // 'win': 'winner'
  claim: 'claimant'; // 'claim': 'claimant'
  deal: 'dealer'; // 'deal': 'dealer'
  spin: 'spinner'; // 'spin': 'spinner'
};

// Verbs with no actor form (upstream `dont` object literal); each => null => never.
type dont =
  | 'aid' // 'aid': 1
  | 'fail' // 'fail': 1
  | 'appear' // 'appear': 1
  | 'happen' // 'happen': 1
  | 'seem' // 'seem': 1
  | 'try' // 'try': 1
  | 'say' // 'say': 1
  | 'marry' // 'marry': 1
  | 'be' // 'be': 1
  | 'forbid' // 'forbid': 1
  | 'understand' // 'understand': 1
  | 'bet'; // 'bet': 1

export type ToActor<T extends string> = _ToActor<Lowercase<T>>;

type _ToActor<T extends string> =
  // if (dont.hasOwnProperty(str)) return null; — no actor form => never
  T extends dont ? never
    // if (irregulars.hasOwnProperty(str)) return irregulars[str];
    : T extends keyof irregulars ? irregulars[T]
    // {'reg': /e$/i, 'repl': 'er'}
    : T extends `${string}e` ? ReplaceEnding<T, 'e', 'er'>
    // {'reg': /([aeiou])([mlgp])$/i, 'repl': '$1$2$2er'} — double the m/l/g/p
    : T extends `${string}${Vowel}m` ? ReplaceEnding<T, 'm', 'mmer'>
    : T extends `${string}${Vowel}l` ? ReplaceEnding<T, 'l', 'ller'>
    : T extends `${string}${Vowel}g` ? ReplaceEnding<T, 'g', 'gger'>
    : T extends `${string}${Vowel}p` ? ReplaceEnding<T, 'p', 'pper'>
    // {'reg': /([rlf])y$/i, 'repl': '$1ier'}
    : T extends `${string}${AnyOf<'rlf'>}y` ? ReplaceEnding<T, 'y', 'ier'>
    // {'reg': /^(.?.[aeiou])t$/i, 'repl': '$1tter'} — ANCHORED whole word,
    // 3 or 4 chars: ([1-2 chars][vowel])t => double the final t.
    : T extends `${Letter}${Vowel}t` ? ReplaceEnding<T, 't', 'tter'>
    : T extends `${Letter}${Letter}${Vowel}t` ? ReplaceEnding<T, 't', 'tter'>
    // return str + 'er'; — unconditional append (matches upstream)
    : `${T}er`;
