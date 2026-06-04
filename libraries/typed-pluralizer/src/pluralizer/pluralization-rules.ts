import { AnyOf, Consonant, Letter, NoneOf, Not, ReplaceEnding, Vowel } from '../util';

// const rules = [
//     [/s?$/i, 's'],
//     [/[^\u0000-\u007F]$/i, '$0'],
//     [/([^aeiou]ese)$/i, '$1'],
//     [/(ax|test)is$/i, '$1es'],
//     [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
//     [/(e[mn]u)s?$/i, '$1s'],
//     [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
//     [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
//     [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
//     [/(seraph|cherub)(?:im)?$/i, '$1im'],
//     [/(her|at|gr)o$/i, '$1oes'],
//     [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
//     [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
//     [/sis$/i, 'ses'],
//     [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
//     [/([^aeiouy]|qu)y$/i, '$1ies'],
//     [/([^ch][ieo][ln])ey$/i, '$1ies'],
//     [/(x|ch|ss|sh|zz)$/i, '$1es'],
//     [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
//     [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
//     [/(pe)(?:rson|ople)$/i, '$1ople'],
//     [/(child)(?:ren)?$/i, '$1ren'],
//     [/eaux$/i, '$0'],
//     [/m[ae]n$/i, 'men'],
//     ['thou', 'you']
// ];

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase. Unmatched input falls through to `never` until the rule
// set is complete.
export type PluralizationRules<T extends string> = _PluralizationRules<Lowercase<T>>;

type _PluralizationRules<T> =
    // //[/[^\u0000-\u007F]$/i, '$0'],
    // T extends `${infer X}${Not<infer Y, Letter>}` ? X :

    // [/([^aeiou]ese)$/i, '$1'],
    T extends `${string}${Consonant}ese` ? T
    : // [/(ax|test)is$/i, '$1es'],
    T extends `${infer X}${'ax' | 'test'}is` ? ReplaceEnding<T, 'is', 'es'>
    : // [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
    T extends `${infer X}${'alias' | `${NoneOf<'aou'>}us` | `t${AnyOf<'lm'>}as` | 'gas' | 'ris'}` ? `${T}es`
    : // [/(e[mn]u)s?$/i, '$1s'],
    T extends `${string}e${AnyOf<'mn'>}${'us' | 'u'}` ? ReplaceEnding<T, 'us' | 'u', 'us'>
    : // ([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$, '$1'],
    T extends `${infer X}${`${NoneOf<'l'>}ias` | `${Vowel}las` | `${AnyOf<'ejzr'>}as` | `${AnyOf<'iu'>}am`}` ? T
    : // [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
    T extends (
        `${string}${'alumn' | 'syllab' | 'vir' | 'radi' | 'nucle' | 'fung' | 'cact' | 'stimul' | 'termin' | 'bacill' | 'foc' | 'uter' | 'loc' | 'strat'}${'us' | 'i'}`
    ) ?
        ReplaceEnding<T, 'us' | 'i', `i`>
    : // [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
    T extends `${string}${'alumn' | 'alg' | 'vertebr'}${'a' | 'ae' | ''}` ? `${ReplaceEnding<T, 'a' | 'ae', ''>}ae`
    : // [/(seraph|cherub)(?:im)?$/i, '$1im'],
    // T extends `${string}${'seraph' | 'cherub' | 'vertebr'}` ? `${T}ae` :
    T extends `${string}${'seraph' | 'cherub' | 'vertebr'}${'im' | ''}` ? `${ReplaceEnding<T, 'im', ''>}im`
    : // [/(her|at|gr)o$/i, '$1oes'],
    T extends `${string}${'her' | 'at' | 'gr'}o` ? ReplaceEnding<T, 'o', 'oes'>
    : // [/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i, '$1a'],
        // [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
        // [/sis$/i, 'ses'],
        // [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
        // [/([^aeiouy]|qu)y$/i, '$1ies'],
        // [/([^ch][ieo][ln])ey$/i, '$1ies'],
        // [/(x|ch|ss|sh|zz)$/i, '$1es'],
        // [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
        // [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
        // [/(pe)(?:rson|ople)$/i, '$1ople'],
        // [/(child)(?:ren)?$/i, '$1ren'],
        // [/eaux$/i, '$0'],
        // [/m[ae]n$/i, 'men'],
        // ['thou', 'you']

        never;
