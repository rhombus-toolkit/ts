// blakeembrey/pluralize v8.0.0 — https://github.com/plurals/pluralize
//
// This module implements the `pluralizationRules` LAYER of pluralize: what
// `sanitizeWord` does with the rule array. The uncountable and irregular gates
// that the public `pluralize()` applies BEFORE the rules run live in other
// modules — this type deliberately exercises the rules in isolation.
//
// TRUE PRIORITY SEMANTICS. `sanitizeWord` iterates the array BOTTOM-UP
// (`while (len--)`) and returns on the first regex that matches, so the LAST
// array entry has the HIGHEST priority. The ternary chain below is therefore
// ordered from the last array entry (`['thou','you']`) down to the first
// (`/s?$/ -> 's'`), which is the lowest-priority fallback. Each arm carries the
// upstream `[regex, replacement]` it implements, in array order, immediately
// adjacent.
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream's `/i` regexes preserve input case.

import { AnyOf, Consonant, LastChar, Letter, NoneOf, ReplaceEnding, Vowel } from '../util';

// `[^aeiouy]` in the lowercase-letter domain: a consonant other than `y`.
type ConsonantNotY = Exclude<Consonant, 'y'>;

export type PluralizationRules<T extends string> = _PluralizationRules<Lowercase<T>>;

type _PluralizationRules<T extends string> =
  // ['thou', 'you']  (sanitizeRule wraps as /^thou$/i)
  T extends 'thou' ? 'you'
    // [/m[ae]n$/i, 'men']
    : T extends `${string}${'man' | 'men'}` ? ReplaceEnding<T, 'man' | 'men', 'men'>
    // [/eaux$/i, '$0']  (identity)
    : T extends `${string}eaux` ? T
    // [/(child)(?:ren)?$/i, '$1ren']
    : T extends `${infer X}child${'ren' | ''}` ? `${X}children`
    // [/(pe)(?:rson|ople)$/i, '$1ople']
    : T extends `${infer X}pe${'rson' | 'ople'}` ? `${X}people`
    // [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice']
    // The leading \b plus the lowercase-letter input domain means the
    // (tit)?m | l group can only sit at the word start (any letter prefix
    // would defeat the boundary), so the rule reduces to these whole words.
    : T extends 'mouse' | 'mice' ? 'mice'
    : T extends 'louse' | 'lice' ? 'lice'
    : T extends 'titmouse' | 'titmice' ? 'titmice'
    // [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices']
    : T extends `${string}${'matr' | 'cod' | 'mur' | 'sil' | 'vert' | 'ind' | 'append'}${'ix' | 'ex'}`
      ? ReplaceEnding<T, 'ix' | 'ex', 'ices'>
    // [/(x|ch|ss|sh|zz)$/i, '$1es']
    : T extends `${string}${'x' | 'ch' | 'ss' | 'sh' | 'zz'}` ? `${T}es`
    // [/([^ch][ieo][ln])ey$/i, '$1ies']
    : T extends `${string}${NoneOf<'ch'>}${AnyOf<'ieo'>}${AnyOf<'ln'>}ey` ? ReplaceEnding<T, 'ey', 'ies'>
    // [/([^aeiouy]|qu)y$/i, '$1ies']
    : T extends `${string}${ConsonantNotY | 'qu'}y` ? ReplaceEnding<T, 'y', 'ies'>
    // [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves']
    : T extends `${string}${'kni' | 'wi' | 'li'}fe` ? ReplaceEnding<T, 'fe', 'ves'>
    : T extends `${string}${'ar' | 'l' | 'ea' | 'eo' | 'oa' | 'hoo'}f` ? ReplaceEnding<T, 'f', 'ves'>
    // [/sis$/i, 'ses']
    : T extends `${string}sis` ? ReplaceEnding<T, 'sis', 'ses'>
    // [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a']
    : T extends
      (`${string}${'apheli' | 'hyperbat' | 'periheli' | 'asyndet' | 'noumen' | 'phenomen' | 'criteri' | 'organ'
        | 'prolegomen' | 'hedr' | 'automat'}${'a' | 'on'}`) ? ReplaceEnding<T, 'a' | 'on', 'a'>
    // [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a']
    : T extends
      (`${string}${'agend' | 'addend' | 'millenni' | 'dat' | 'extrem' | 'bacteri' | 'desiderat' | 'strat' | 'candelabr'
        | 'errat' | 'ov' | 'symposi' | 'curricul' | 'automat' | 'quor'}${'a' | 'um'}`)
      ? ReplaceEnding<T, 'a' | 'um', 'a'>
    // [/(her|at|gr)o$/i, '$1oes']
    : T extends `${string}${'her' | 'at' | 'gr'}o` ? ReplaceEnding<T, 'o', 'oes'>
    // [/(seraph|cherub)(?:im)?$/i, '$1im']
    : T extends `${string}${'seraph' | 'cherub'}${'im' | ''}` ? `${ReplaceEnding<T, 'im', ''>}im`
    // [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae']
    : T extends `${string}${'alumn' | 'alg' | 'vertebr'}${'a' | 'ae'}` ? `${ReplaceEnding<T, 'a' | 'ae', ''>}ae`
    // [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i']
    : T extends
      (`${string}${'alumn' | 'syllab' | 'vir' | 'radi' | 'nucle' | 'fung' | 'cact' | 'stimul' | 'termin' | 'bacill'
        | 'foc' | 'uter' | 'loc' | 'strat'}${'us' | 'i'}`) ? ReplaceEnding<T, 'us' | 'i', 'i'>
    // [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1']  (identity)
    : T extends `${string}${`${NoneOf<'l'>}ias` | `${Vowel}las` | `${AnyOf<'ejzr'>}as` | `${AnyOf<'iu'>}am`}` ? T
    // [/(e[mn]u)s?$/i, '$1s']
    : T extends `${string}e${AnyOf<'mn'>}${'us' | 'u'}` ? ReplaceEnding<T, 'us' | 'u', 'us'>
    // [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es']
    : T extends `${string}${'alias' | `${NoneOf<'aou'>}us` | `t${AnyOf<'lm'>}as` | 'gas' | 'ris'}` ? `${T}es`
    // [/(ax|test)is$/i, '$1es']
    : T extends `${string}${'ax' | 'test'}is` ? ReplaceEnding<T, 'is', 'es'>
    // [/([^aeiou]ese)$/i, '$1']  (identity)
    : T extends `${string}${Consonant}ese` ? T
    // [/[^\u0000-\u007F]$/i, '$0']  (identity, second-lowest priority)
    // TS literal types cannot test a UTF-16 code point against 127. The
    // input is folded through Lowercase<T> and the Letter class is
    // ASCII-lowercase-only, so we approximate the rule as "last char is not
    // an ASCII lowercase letter". Documented divergence class: a word whose
    // final char is an ASCII non-letter (digit/punctuation, e.g. 'cat5')
    // takes this identity arm here, whereas upstream — where that char IS in
    // 0x00-0x7F — would fall through to /s?$/ and append 's'. Genuine
    // non-ASCII-letter endings ('café') agree with upstream: identity.
    : LastChar<T> extends Letter ? _SFallback<T>
    : T;

// [/s?$/i, 's']  (lowest-priority fallback). On an s-ending word /s?$/ matches
// the trailing s and rewrites it to 's' (identity, e.g. 'canvas' -> 'canvas');
// otherwise it matches the empty end position and appends 's' (cat -> cats).
type _SFallback<T extends string> = T extends `${string}s` ? T : `${T}s`;
