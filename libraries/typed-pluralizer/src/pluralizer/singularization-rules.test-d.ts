import { SingularizationRules } from './singularization-rules';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Coverage for the singularization rule set, grouped by rule arm. Every case was
// verified against a node oracle replicating blakeembrey/pluralize v8.0.0
// `sanitizeWord` over the `singularRules` array (rules layer only). Oracle and
// type agree on every case, so all assertions are @ts-expect-no-error.

namespace menRule {
  // [/men$/i, "man"] — highest priority
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'men'>, 'man'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'women'>, 'woman'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'omen'>, 'oman'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'specimen'>, 'speciman'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'acumen'>, 'acuman'>;
}

namespace eauxRule {
  // [/(eau)x?$/i, "$1"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'bureaux'>, 'bureau'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'tableaux'>, 'tableau'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'chateaux'>, 'chateau'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'eaux'>, 'eau'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'eau'>, 'eau'>;
}

namespace childrenRule {
  // [/(child)ren$/i, "$1"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'children'>, 'child'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'grandchildren'>, 'grandchild'>;
}

namespace personRule {
  // [/(pe)(rson|ople)$/i, "$1rson"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'people'>, 'person'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'salespeople'>, 'salesperson'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'person'>, 'person'>;
}

namespace matrAppendIcesRule {
  // [/(matr|append)ices$/i, "$1ix"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'matrices'>, 'matrix'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'appendices'>, 'appendix'>;
}

namespace codMurIcesRule {
  // [/(cod|mur|sil|vert|ind)ices$/i, "$1ex"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'codices'>, 'codex'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'murices'>, 'murex'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'silices'>, 'silex'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'vertices'>, 'vertex'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'indices'>, 'index'>;
}

namespace alumnAeRule {
  // [/(alumn|alg|vertebr)ae$/i, "$1a"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'alumnae'>, 'alumna'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'algae'>, 'alga'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'vertebrae'>, 'vertebra'>;
}

namespace onRule {
  // [/(apheli|…|automat)a$/i, "$1on"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'aphelia'>, 'aphelion'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'phenomena'>, 'phenomenon'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'criteria'>, 'criterion'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'organa'>, 'organon'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'automata'>, 'automaton'>;
}

namespace umRule {
  // [/(agend|…|quor)a$/i, "$1um"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'data'>, 'datum'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'agenda'>, 'agendum'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'addenda'>, 'addendum'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'bacteria'>, 'bacterium'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'curricula'>, 'curriculum'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'ova'>, 'ovum'>;
}

namespace usRule {
  // [/(alumn|…|strat)(?:us|i)$/i, "$1us"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'alumni'>, 'alumnus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cacti'>, 'cactus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'foci'>, 'focus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'radii'>, 'radius'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'syllabi'>, 'syllabus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'fungi'>, 'fungus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'nuclei'>, 'nucleus'>;
}

namespace testRule {
  // [/(test)(?:is|es)$/i, "$1is"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'testis'>, 'testis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'testes'>, 'testis'>;
}

namespace movieRule {
  // [/(movie|twelve|abuse|e[mn]u)s$/i, "$1"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'movies'>, 'movie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'twelves'>, 'twelve'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'abuses'>, 'abuse'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'emus'>, 'emu'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'menus'>, 'menu'>;
}

namespace sisRule {
  // [/(analy|…|ne)(?:sis|ses)$/i, "$1sis"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'analyses'>, 'analysis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'crises'>, 'crisis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'theses'>, 'thesis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'diagnoses'>, 'diagnosis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'emphases'>, 'emphasis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'synopses'>, 'synopsis'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'parentheses'>, 'parenthesis'>;
}

namespace esRule {
  // [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, "$1"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'boxes'>, 'box'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'box'>, 'box'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'churches'>, 'church'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'glasses'>, 'glass'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dishes'>, 'dish'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'buzzes'>, 'buzz'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'echo'>, 'echo'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'aliases'>, 'alias'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'campuses'>, 'campus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'buses'>, 'bus'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'atlases'>, 'atlas'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'gases'>, 'gas'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'irises'>, 'iris'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'heroes'>, 'hero'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'potatoes'>, 'potato'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'matrixes'>, 'matrix'>;
}

namespace seraphimRule {
  // [/(seraph|cherub)im$/i, "$1"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'seraphim'>, 'seraph'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cherubim'>, 'cherub'>;
}

namespace miceRule {
  // [/\b((?:tit)?m|l)ice$/i, "$1ouse"] — \b-anchored
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'mice'>, 'mouse'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lice'>, 'louse'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'titmice'>, 'titmouse'>;
}

namespace moniesRule {
  // [/\b(mon|smil)ies$/i, "$1ey"] — \b-anchored
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'monies'>, 'money'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'smilies'>, 'smiley'>;
}

namespace ieRule {
  // [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, "$1ie"] — \b-anchored
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'zombies'>, 'zombie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'pies'>, 'pie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lies'>, 'lie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'ties'>, 'tie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'neckties'>, 'necktie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'crossties'>, 'crosstie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'collies'>, 'collie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'faeries'>, 'faerie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'foodies'>, 'foodie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'genies'>, 'genie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'goonies'>, 'goonie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'groupies'>, 'groupie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lassies'>, 'lassie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'talkies'>, 'talkie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'goalies'>, 'goalie'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cuties'>, 'cutie'>;
}

namespace iesYRule {
  // [/ies$/i, "y"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'colonies'>, 'colony'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'bodies'>, 'body'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cities'>, 'city'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'ladies'>, 'lady'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'bowties'>, 'bowty'>;
}

namespace vesFRule {
  // [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, "$1f"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'wolves'>, 'wolf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'shelves'>, 'shelf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'loaves'>, 'loaf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'halves'>, 'half'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'elves'>, 'elf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'selves'>, 'self'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'calves'>, 'calf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'leaves'>, 'leaf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'wharves'>, 'wharf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'scarves'>, 'scarf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dwarves'>, 'dwarf'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'themselves'>, 'themself'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'ourselves'>, 'ourself'>;
}

namespace vesFeRule {
  // [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, "$1fe"]
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'wives'>, 'wife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'knives'>, 'knife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lives'>, 'life'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'afterlives'>, 'afterlife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'halflives'>, 'halflife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'midlives'>, 'midlife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'nightlives'>, 'nightlife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lowlives'>, 'lowlife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'nonlives'>, 'nonlife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'highlives'>, 'highlife'>;
}

namespace sStripRule {
  // [/s$/i, ""] — lowest priority fall-back
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cats'>, 'cat'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'houses'>, 'house'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dogs'>, 'dog'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'thieves'>, 'thieve'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dives'>, 'dive'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'gives'>, 'give'>;
}

namespace collisionProbes {
  // Words that resemble a higher rule but resolve elsewhere.
  // rule 5 is \b-anchored, so the inner `zomb` does not match
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'azombies'>, 'azomby'>;
  // rule 5 \b-anchored; falls to /ies$/
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'apies'>, 'apy'>;
  // rule 2 needs `kni` immediately before `ves`
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'kniives'>, 'kniive'>;
  // rule 2 `li` branch only fires after the listed prefixes / start
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'gaslives'>, 'gaslive'>;
  // same — `i` is not a listed prefix
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'ilives'>, 'ilive'>;
  // not in the cod|mur|sil|vert|ind set; falls to /s$/
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cervices'>, 'cervice'>;
  // not in the matr|append or cod|… sets; falls to /s$/
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'radices'>, 'radice'>;
  // rule 9 needs `tto` then optional `es`, not `tto`+`s`; falls to /s$/
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'lottos'>, 'lotto'>;
  // matched by the `ss` alternative of rule 9, NOT /(ss)$/
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'boss'>, 'boss'>;
  // rule 7 \b-anchored; `m` is not at a word boundary
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dormice'>, never>;
}

namespace unmatched {
  // Words that match no rule fall through to `never`.
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'cat'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'dog'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'geese'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'oxen'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'rice'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'tree'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'sky'>, never>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'genera'>, never>;
  // @ts-expect-no-error
  isAssignable<never, SingularizationRules<'cat'>>;
}

namespace caseFolding {
  // Input is folded through Lowercase<T> before matching; output is lowercase.
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'MEN'>, 'man'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'Knives'>, 'knife'>;
  // @ts-expect-no-error
  isAssignable<SingularizationRules<'MATRICES'>, 'matrix'>;
}
