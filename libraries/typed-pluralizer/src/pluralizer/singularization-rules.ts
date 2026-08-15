// blakeembrey/pluralize v8.0.0 — https://github.com/plurals/pluralize
// Singularization rules, transcribed from pluralize.js (the `singularRules`
// array). Upstream `sanitizeWord` iterates the array back-to-front
// (`while (len--)`) and uses the first rule that matches, so the LAST array
// entry has the HIGHEST priority. The conditional chain below is therefore
// written in reversed-array order: rule 22 (`/men$/`) is tested first, rule 0
// (`/s$/`) last.
//
// This module is the rules layer ONLY — the uncountable and irregular gates
// that upstream applies before `sanitizeWord` live in other modules.

import { AnyOf, NoneOf, ReplaceEnding, Vowel } from '../util';

// const rules = [
//     [/s$/i, ''],
//     [/(ss)$/i, '$1'],
//     [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
//     [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
//     [/ies$/i, 'y'],
//     [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
//     [/\b(mon|smil)ies$/i, '$1ey'],
//     [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
//     [/(seraph|cherub)im$/i, '$1'],
//     [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
//     [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
//     [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
//     [/(test)(?:is|es)$/i, '$1is'],
//     [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
//     [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
//     [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
//     [/(alumn|alg|vertebr)ae$/i, '$1a'],
//     [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
//     [/(matr|append)ices$/i, '$1ix'],
//     [/(pe)(rson|ople)$/i, '$1rson'],
//     [/(child)ren$/i, '$1'],
//     [/(eau)x?$/i, '$1'],
//     [/men$/i, 'man'],
// ];

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase. Unmatched input falls through to `never`.
export type SingularizationRules<T extends string> = _SingularizationRules<Lowercase<T>>;

type _SingularizationRules<T> =
  // [/men$/i, 'man'],
  T extends `${infer X}men` ? `${X}man`
    // [/(eau)x?$/i, '$1'],
    : T extends `${string}eau${'x' | ''}` ? ReplaceEnding<T, 'eaux' | 'eau', 'eau'>
    // [/(child)ren$/i, '$1'],
    : T extends `${string}children` ? ReplaceEnding<T, 'children', 'child'>
    // [/(pe)(rson|ople)$/i, '$1rson'],
    : T extends `${string}pe${'rson' | 'ople'}` ? ReplaceEnding<T, 'person' | 'people', 'person'>
    // [/(matr|append)ices$/i, '$1ix'],
    : T extends `${string}${'matr' | 'append'}ices` ? ReplaceEnding<T, 'ices', 'ix'>
    // [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
    : T extends `${string}${'cod' | 'mur' | 'sil' | 'vert' | 'ind'}ices` ? ReplaceEnding<T, 'ices', 'ex'>
    // [/(alumn|alg|vertebr)ae$/i, '$1a'],
    : T extends `${string}${'alumn' | 'alg' | 'vertebr'}ae` ? ReplaceEnding<T, 'ae', 'a'>
    // [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
    : T extends
      (`${string}${'apheli' | 'hyperbat' | 'periheli' | 'asyndet' | 'noumen' | 'phenomen' | 'criteri' | 'organ'
        | 'prolegomen' | 'hedr' | 'automat'}a`) ? ReplaceEnding<T, 'a', 'on'>
    // [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i, '$1um'],
    : T extends
      (`${string}${'agend' | 'addend' | 'millenni' | 'dat' | 'extrem' | 'bacteri' | 'desiderat' | 'strat' | 'candelabr'
        | 'errat' | 'ov' | 'symposi' | 'curricul' | 'quor'}a`) ? ReplaceEnding<T, 'a', 'um'>
    // [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
    : T extends
      (`${string}${'alumn' | 'syllab' | 'vir' | 'radi' | 'nucle' | 'fung' | 'cact' | 'stimul' | 'termin' | 'bacill'
        | 'foc' | 'uter' | 'loc' | 'strat'}${'us' | 'i'}`) ? ReplaceEnding<T, 'us' | 'i', 'us'>
    // [/(test)(?:is|es)$/i, '$1is'],
    : T extends `${string}test${'is' | 'es'}` ? ReplaceEnding<T, 'is' | 'es', 'is'>
    // [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
    : T extends `${string}${'movie' | 'twelve' | 'abuse' | `e${AnyOf<'mn'>}u`}s` ? ReplaceEnding<T, 's', ''>
    // [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
    : T extends
      (`${string}${'analy' | 'diagno' | 'parenthe' | 'progno' | 'synop' | 'the' | 'empha' | 'cri' | 'ne'}${'sis'
        | 'ses'}`) ? ReplaceEnding<T, 'sis' | 'ses', 'sis'>
    // [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
    : T extends
      (`${string}${'x' | 'ch' | 'ss' | 'sh' | 'zz' | 'tto' | 'go' | 'cho' | 'alias' | `${NoneOf<'aou'>}us` | `t${AnyOf<
        'lm'
      >}as` | 'gas' | `${'her' | 'at' | 'gr'}o` | `${Vowel}ris`}${'es' | ''}`) ? ReplaceEnding<T, 'es', ''>
    // [/(seraph|cherub)im$/i, '$1'],
    : T extends `${string}${'seraph' | 'cherub'}im` ? ReplaceEnding<T, 'im', ''>
    // [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
    // `\b` anchors the captured group at a word boundary; for letter-only words
    // that means the start of the string, so this only fires for the exact words
    // `mice`, `titmice`, `lice`.
    : T extends 'mice' | 'titmice' | 'lice' ? ReplaceEnding<T, 'ice', 'ouse'>
    // [/\b(mon|smil)ies$/i, '$1ey'],
    // `\b`-anchored: only the exact words `monies`, `smilies`.
    : T extends 'monies' | 'smilies' ? ReplaceEnding<T, 'ies', 'ey'>
    // [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
    // `\b`-anchored: the captured stem sits at the start of the word, so no
    // leading `${string}`.
    : T extends
      (`${'p' | 'l' | 'zomb' | `${'neck' | 'cross' | ''}t` | 'coll' | 'faer' | 'food' | 'gen' | 'goon' | 'group'
        | 'lass' | 'talk' | 'goal' | 'cut'}ies`) ? ReplaceEnding<T, 'ies', 'ie'>
    // [/ies$/i, 'y'],
    : T extends `${string}ies` ? ReplaceEnding<T, 'ies', 'y'>
    // [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
    : T extends `${string}${'ar' | `${'wo' | AnyOf<'ae'>}l` | `${AnyOf<'eo'>}${AnyOf<'ao'>}`}ves`
      ? ReplaceEnding<T, 'ves', 'f'>
    // [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    // `wi`/`kni` are unanchored; the `li` branch requires a preceding word
    // boundary — `^` (whole word `lives`) or one of the listed prefixes. The
    // `[^\w]li` alternative cannot fire for letter-only input and is omitted.
    : T extends
      (`${string}${'wi' | 'kni'}ves` | `${'after' | 'half' | 'high' | 'low' | 'mid' | 'non' | 'night' | ''}lives`)
      ? ReplaceEnding<T, 'ves', 'fe'>
    // [/(ss)$/i, '$1'],
    // Identity for `ss` endings. Shadowed in practice by the `ss` alternative of
    // the `(x|ch|ss|…)` rule above (higher priority), which also returns `$1`.
    : T extends `${string}ss` ? T
    // [/s$/i, ''],
    : T extends `${infer X}s` ? X
    : never;
