import { Pluralize, Singularize } from './public';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Regression gate for the composed public Pluralize<T> / Singularize<T>.
//
// Every assertion's expected literal is the type output VERIFIED against the
// real blakeembrey/pluralize v8.0.0 library used as an oracle:
//   node -e "const p=require('/tmp/pluralize-npm/pluralize.js');
//            console.log(p.plural(w), p.singular(w))"
// The full curated dataset (343 words, 686 directional cases) was probed via the
// tsc sentinel-assignment technique and compared to the lowercased oracle output:
// 684/686 agree; the 2 disagreements are the documented digit-ending divergence
// pinned in `documentedDivergences` below. The cases here are the
// layer-by-layer + collision + classic-family subset that locks the gate order.
//
// Accepted divergences from upstream (see public.ts header for the full proof):
//   (a) case-insensitive matching / always-lowercase output (asserted in
//       `caseFolding`);
//   (b) ASCII-non-letter-ending plural identity class (asserted in
//       `documentedDivergences`).

// ---------------------------------------------------------------------------
// Irregular singles (replaceMap on plural / keepMap on singular).
// Forward pluralizes to the irregular plural; singularize keeps the singular.
// ---------------------------------------------------------------------------
namespace irregularSingles {
  // @ts-expect-no-error
  isAssignable<Pluralize<'this'>, 'these'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'this'>, 'this'>; // keepMap(irregularSingles) hit -> identity
  // @ts-expect-no-error
  isAssignable<Pluralize<'echo'>, 'echoes'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'echo'>, 'echo'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'volcano'>, 'volcanoes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'tornado'>, 'tornadoes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'torpedo'>, 'torpedoes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'dingo'>, 'dingoes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'genus'>, 'genera'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'viscus'>, 'viscera'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'stigma'>, 'stigmata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'stoma'>, 'stomata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'dogma'>, 'dogmata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'lemma'>, 'lemmata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'schema'>, 'schemata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'anathema'>, 'anathemata'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'ox'>, 'oxen'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'die'>, 'dice'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'yes'>, 'yeses'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'eave'>, 'eaves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'thief'>, 'thieves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'quiz'>, 'quizzes'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'quiz'>, 'quiz'>;
  // passerby -> passersby (the bug the deleted irregular-rules.ts had backwards)
  // @ts-expect-no-error
  isAssignable<Pluralize<'passerby'>, 'passersby'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'passerby'>, 'passerby'>;
  // human pluralizes to humans via the irregular map (NOT humen via the man rule).
  // @ts-expect-no-error
  isAssignable<Pluralize<'human'>, 'humans'>;
}

// ---------------------------------------------------------------------------
// Irregular plurals (keepMap on plural / replaceMap on singular).
// Pluralize keeps an already-plural irregular; singularize maps it back.
// ---------------------------------------------------------------------------
namespace irregularPlurals {
  // @ts-expect-no-error
  isAssignable<Pluralize<'these'>, 'these'>; // keepMap(irregularPlurals) hit -> identity
  // @ts-expect-no-error
  isAssignable<Singularize<'these'>, 'this'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'oxen'>, 'oxen'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'oxen'>, 'ox'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'echoes'>, 'echo'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'geese'>, 'goose'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'feet'>, 'foot'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'teeth'>, 'tooth'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'genera'>, 'genus'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'viscera'>, 'viscus'>;
}

// ---------------------------------------------------------------------------
// Uncountables — the merged Set+regex gate. Both directions resolve to identity.
// ---------------------------------------------------------------------------
namespace uncountableSet {
  // @ts-expect-no-error
  isAssignable<Pluralize<'news'>, 'news'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'news'>, 'news'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'jeans'>, 'jeans'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'jeans'>, 'jeans'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'species'>, 'species'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'species'>, 'species'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'corps'>, 'corps'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'corps'>, 'corps'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'pliers'>, 'pliers'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'staff'>, 'staff'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'moose'>, 'moose'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'kudos'>, 'kudos'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'premises'>, 'premises'>;
}

namespace uncountableRegex {
  // /[^aeiou]ese$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'chinese'>, 'chinese'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'japanese'>, 'japanese'>;
  // /deer$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'deer'>, 'deer'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'reindeer'>, 'reindeer'>;
  // /fish$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'fish'>, 'fish'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'blowfish'>, 'blowfish'>;
  // /o[iu]s$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'carnivorous'>, 'carnivorous'>;
  // /pox$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'chickenpox'>, 'chickenpox'>;
  // /pok[eé]mon$/i — both spellings
  // @ts-expect-no-error
  isAssignable<Pluralize<'pokemon'>, 'pokemon'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'pokémon'>, 'pokémon'>;
  // /sheep$/i
  // @ts-expect-no-error
  isAssignable<Pluralize<'sheep'>, 'sheep'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'sheep'>, 'sheep'>;
}

// ---------------------------------------------------------------------------
// Rule layer — round-trip families where neither irregular nor uncountable fire.
// ---------------------------------------------------------------------------
namespace classicFamilies {
  // child / person / mouse
  // @ts-expect-no-error
  isAssignable<Pluralize<'child'>, 'children'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'children'>, 'child'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'person'>, 'people'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'people'>, 'person'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'mouse'>, 'mice'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'mice'>, 'mouse'>;
  // matrix / index family
  // @ts-expect-no-error
  isAssignable<Pluralize<'matrix'>, 'matrices'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'matrices'>, 'matrix'>;
  // knife / f->ves family
  // @ts-expect-no-error
  isAssignable<Pluralize<'knife'>, 'knives'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'knives'>, 'knife'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'wife'>, 'wives'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'life'>, 'lives'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'elf'>, 'elves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'loaf'>, 'loaves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'wolf'>, 'wolves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'half'>, 'halves'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'hoof'>, 'hooves'>;
  // criterion / phenomenon family
  // @ts-expect-no-error
  isAssignable<Pluralize<'criterion'>, 'criteria'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'criteria'>, 'criterion'>;
  // datum / -um -> -a family
  // @ts-expect-no-error
  isAssignable<Pluralize<'datum'>, 'data'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'data'>, 'datum'>;
  // alumnus / -us -> -i family
  // @ts-expect-no-error
  isAssignable<Pluralize<'alumnus'>, 'alumni'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'alumni'>, 'alumnus'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'cactus'>, 'cacti'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'focus'>, 'foci'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'virus'>, 'viri'>;
  // hero / -o -> -oes
  // @ts-expect-no-error
  isAssignable<Pluralize<'hero'>, 'heroes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'potato'>, 'potatoes'>;
  // seraph / cherub -> -im
  // @ts-expect-no-error
  isAssignable<Pluralize<'seraph'>, 'seraphim'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'cherub'>, 'cherubim'>;
  // alga / -a -> -ae
  // @ts-expect-no-error
  isAssignable<Pluralize<'alga'>, 'algae'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'vertebra'>, 'vertebrae'>;
  // crisis / -sis -> -ses
  // @ts-expect-no-error
  isAssignable<Pluralize<'crisis'>, 'crises'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'analysis'>, 'analyses'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'analyses'>, 'analysis'>;
  // x/ch/ss/sh/zz -> +es
  // @ts-expect-no-error
  isAssignable<Pluralize<'box'>, 'boxes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'church'>, 'churches'>;
  // consonant-y -> ies
  // @ts-expect-no-error
  isAssignable<Pluralize<'baby'>, 'babies'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'fly'>, 'flies'>;
  // emu / e[mn]u -> +s
  // @ts-expect-no-error
  isAssignable<Pluralize<'emu'>, 'emus'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'menu'>, 'menus'>;
  // [^aou]us -> +es
  // @ts-expect-no-error
  isAssignable<Pluralize<'bus'>, 'buses'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'alias'>, 'aliases'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'gas'>, 'gases'>;
  // ax|test is -> es
  // @ts-expect-no-error
  isAssignable<Pluralize<'axis'>, 'axes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'testis'>, 'testes'>;
  // man/men
  // @ts-expect-no-error
  isAssignable<Pluralize<'man'>, 'men'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'woman'>, 'women'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'men'>, 'man'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'women'>, 'woman'>;
  // /s?$/ fall-through
  // @ts-expect-no-error
  isAssignable<Pluralize<'cat'>, 'cats'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'dog'>, 'dogs'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'cats'>, 'cat'>;
  // bias -> identity ([^l]ias arm); singular drops the s.
  // @ts-expect-no-error
  isAssignable<Pluralize<'bias'>, 'bias'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'bias'>, 'bia'>;
  // axis singularizes to axi ([^aou]us-style identity then /s$/ drop).
  // @ts-expect-no-error
  isAssignable<Singularize<'axis'>, 'axi'>;
}

// ---------------------------------------------------------------------------
// LAYER-COLLISION probes — words that plausibly hit 2+ layers. These pin the
// gate order: irregular > uncountable > rules.
// ---------------------------------------------------------------------------
namespace layerCollisions {
  // 'axes' is BOTH an irregular plural (axe->axes inverse map) AND would hit the
  // (ax|test)is rule were it singular. The irregular keepMap wins for Pluralize
  // (identity) and the irregular replaceMap wins for Singularize (-> axe), NOT
  // the /s$/ rule (which would give 'axe' anyway here, but the win is the map).
  // @ts-expect-no-error
  isAssignable<Pluralize<'axes'>, 'axes'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'axes'>, 'axe'>;

  // 'goose' is an irregular single; the bare /s?$/ rule would otherwise append s
  // (-> 'gooses'). The irregular map wins: 'geese'.
  // @ts-expect-no-error
  isAssignable<Pluralize<'goose'>, 'geese'>;

  // 'fish' matches BOTH the /fish$/ uncountable regex AND the /sh$/ +es plural
  // rule. The merged uncountable gate fires first -> identity, NOT 'fishes'.
  // @ts-expect-no-error
  isAssignable<Pluralize<'fish'>, 'fish'>;

  // 'sheep' matches the /sheep$/ uncountable regex; the bare /s?$/ rule would
  // append s. Uncountable gate wins -> identity.
  // @ts-expect-no-error
  isAssignable<Pluralize<'sheep'>, 'sheep'>;

  // 'series' is an uncountable Set word AND ends in s (the /s$/ singular rule
  // would drop it -> 'serie'). The uncountable gate wins -> identity both ways.
  // @ts-expect-no-error
  isAssignable<Pluralize<'series'>, 'series'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'series'>, 'series'>;

  // 'this'/'these' are irregular; both are also short s-ending words a rule
  // could touch. The irregular maps win.
  // @ts-expect-no-error
  isAssignable<Pluralize<'this'>, 'these'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'these'>, 'this'>;
}

// ---------------------------------------------------------------------------
// Documented divergences from upstream.
// ---------------------------------------------------------------------------
namespace documentedDivergences {
  // (b) ASCII-non-letter-ending plural identity. A lowercased word ending in a
  // digit takes the [^<ascii-letter>]$ identity arm in PluralizationRules and so
  // Pluralize returns it unchanged, whereas upstream — where the digit IS in
  // 0x00-0x7F — falls through to /s?$/ and appends 's'. Verified type output is
  // identity; upstream p.plural('cat5') === 'cat5s', p.plural('data5') === 'data5s'.
  // @ts-expect-no-error
  isAssignable<Pluralize<'cat5'>, 'cat5'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'data5'>, 'data5'>;
  // Singularization has NO non-ASCII identity arm; its /s$/ -> '' only fires on
  // s-ending words, so a digit-ending input falls through to identity, matching
  // upstream exactly (no divergence in this direction).
  // @ts-expect-no-error
  isAssignable<Singularize<'cat5'>, 'cat5'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'data5'>, 'data5'>;

  // Genuine non-ASCII letter endings agree with upstream identity (café -> café).
  // @ts-expect-no-error
  isAssignable<Pluralize<'café'>, 'café'>;
  // 'naïve' ends in an ASCII letter, so /s?$/ runs: 'naïves' (matches upstream).
  // @ts-expect-no-error
  isAssignable<Pluralize<'naïve'>, 'naïves'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'café'>, 'café'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'naïve'>, 'naïve'>;
}

// ---------------------------------------------------------------------------
// Empty-string edge case — sanitizeWord step 3a (`!token.length -> word`).
// Upstream short-circuits the empty string to identity before any rule runs:
//   p.plural('') === '' && p.singular('') === ''  (verified against the oracle).
// Without the explicit `T extends '' ? ''` gate, Pluralize<''> fell into
// PluralizationRules<''> and resolved to 's' (LastChar<''> = never, never
// extends Letter, _SFallback<''> = 's') — a divergence outside both accepted
// classes (a)/(b). Pin both directions.
// ---------------------------------------------------------------------------
namespace emptyString {
  // @ts-expect-no-error
  isAssignable<Pluralize<''>, ''>;
  // @ts-expect-no-error
  isAssignable<Singularize<''>, ''>;
}

// ---------------------------------------------------------------------------
// (a) Case-insensitive matching, always-lowercase output.
// ---------------------------------------------------------------------------
namespace caseFolding {
  // @ts-expect-no-error
  isAssignable<Pluralize<'Hero'>, 'heroes'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'CHILD'>, 'children'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'Mouse'>, 'mice'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'OX'>, 'oxen'>;
  // @ts-expect-no-error
  isAssignable<Pluralize<'Thou'>, 'you'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'CHILDREN'>, 'child'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'People'>, 'person'>;
  // @ts-expect-no-error
  isAssignable<Singularize<'Axes'>, 'axe'>;
}
