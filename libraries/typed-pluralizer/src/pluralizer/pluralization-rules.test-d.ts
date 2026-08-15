import { PluralizationRules } from './pluralization-rules';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Verification gate for the full pluralizationRules layer (blakeembrey/pluralize
// v8.0.0) reordered to TRUE bottom-up priority. Every assertion is the resolved
// type output confirmed against a node oracle that transcribes sanitizeWord +
// the full rule array. Namespaces are grouped by the upstream array entry the
// word resolves to, ordered highest priority (last array entry) first.

namespace thou {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'thou'>, 'you'>;
}

namespace manMen {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'man'>, 'men'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'woman'>, 'women'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'men'>, 'men'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'women'>, 'women'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'human'>, 'humen'>;
}

namespace eauxIdentity {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bureaux'>, 'bureaux'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'tableaux'>, 'tableaux'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'plateaux'>, 'plateaux'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'chateaux'>, 'chateaux'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'eaux'>, 'eaux'>;
}

namespace children {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'child'>, 'children'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'children'>, 'children'>;
}

namespace people {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'person'>, 'people'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'people'>, 'people'>;
}

namespace miceLice {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'mouse'>, 'mice'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'mice'>, 'mice'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'louse'>, 'lice'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'titmouse'>, 'titmice'>;
}

namespace icesMatrIndEx {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'matrix'>, 'matrices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'index'>, 'indices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'appendix'>, 'appendices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'vertex'>, 'vertices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'codex'>, 'codices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'silex'>, 'silices'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'murex'>, 'murices'>;
}

namespace esXChSsShZz {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'helix'>, 'helixes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'box'>, 'boxes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'church'>, 'churches'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'dish'>, 'dishes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'buzz'>, 'buzzes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'fizz'>, 'fizzes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'fox'>, 'foxes'>;
}

namespace consonantYToIes {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'baby'>, 'babies'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'fly'>, 'flies'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'sky'>, 'skies'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cry'>, 'cries'>;
}

namespace fToVes {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'knife'>, 'knives'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'wife'>, 'wives'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'life'>, 'lives'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'elf'>, 'elves'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'loaf'>, 'loaves'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'leaf'>, 'leaves'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'hoof'>, 'hooves'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'wolf'>, 'wolves'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'half'>, 'halves'>;
}

namespace sisToSes {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'crisis'>, 'crises'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'sis'>, 'ses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'analysis'>, 'analyses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'basis'>, 'bases'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'thesis'>, 'theses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'chassis'>, 'chasses'>;
}

namespace aOnToA {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'criterion'>, 'criteria'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'phenomenon'>, 'phenomena'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'organon'>, 'organa'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'automaton'>, 'automata'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'prolegomenon'>, 'prolegomena'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'automata'>, 'automata'>;
}

namespace aUmToA {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'datum'>, 'data'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'agendum'>, 'agenda'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'ovum'>, 'ova'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'stratum'>, 'strata'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'millennium'>, 'millennia'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'symposium'>, 'symposia'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'curriculum'>, 'curricula'>;
}

namespace oToOes {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'hero'>, 'heroes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'potato'>, 'potatoes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'tomato'>, 'tomatoes'>;
}

namespace seraphimCherubim {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'seraph'>, 'seraphim'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cherub'>, 'cherubim'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'seraphim'>, 'seraphim'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cherubim'>, 'cherubim'>;
}

namespace aAeToAe {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alumna'>, 'alumnae'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alga'>, 'algae'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'vertebra'>, 'vertebrae'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alumnae'>, 'alumnae'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'algae'>, 'algae'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'vertebrae'>, 'vertebrae'>;
}

namespace usIToI {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alumnus'>, 'alumni'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cactus'>, 'cacti'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'focus'>, 'foci'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'virus'>, 'viri'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'radius'>, 'radii'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'locus'>, 'loci'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'fungus'>, 'fungi'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'stimulus'>, 'stimuli'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'nucleus'>, 'nuclei'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'syllabus'>, 'syllabi'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bacillus'>, 'bacilli'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'uterus'>, 'uteri'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'terminus'>, 'termini'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alumni'>, 'alumni'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cacti'>, 'cacti'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'foci'>, 'foci'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'radii'>, 'radii'>;
}

namespace iasLasAsAmIdentity {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bias'>, 'bias'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'areas'>, 'areas'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'pizzas'>, 'pizzas'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'liam'>, 'liam'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'guam'>, 'guam'>;
}

namespace emuMenu {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'emu'>, 'emus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'menu'>, 'menus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'emus'>, 'emus'>;
}

namespace usAsEs {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bus'>, 'buses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alias'>, 'aliases'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'campus'>, 'campuses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'atlas'>, 'atlases'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'gas'>, 'gases'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'ris'>, 'rises'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'genius'>, 'geniuses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'census'>, 'censuses'>;
}

namespace axTestIsToEs {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'axis'>, 'axes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'testis'>, 'testes'>;
}

namespace eseIdentity {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'chinese'>, 'chinese'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'japanese'>, 'japanese'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'manese'>, 'manese'>;
}

namespace sFallback {
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cat'>, 'cats'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'dog'>, 'dogs'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'goose'>, 'gooses'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'monkey'>, 'monkeys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'donkey'>, 'donkeys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'alley'>, 'alleys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'valley'>, 'valleys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'chimney'>, 'chimneys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'trolley'>, 'trolleys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'guy'>, 'guys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'day'>, 'days'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'key'>, 'keys'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'roof'>, 'roofs'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'proof'>, 'proofs'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'torpedo'>, 'torpedos'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'photo'>, 'photos'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'canvas'>, 'canvas'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'axes'>, 'axes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'testes'>, 'testes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'beau'>, 'beaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'tableau'>, 'tableaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'eau'>, 'eaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'chateau'>, 'chateaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bureau'>, 'bureaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'plateau'>, 'plateaus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'grotto'>, 'grottos'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'milieu'>, 'milieus'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'quiz'>, 'quizs'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cafe'>, 'cafes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'naive'>, 'naives'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'resume'>, 'resumes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'foo'>, 'foos'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'bird'>, 'birds'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'table'>, 'tables'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'window'>, 'windows'>;
}

namespace nonAsciiDivergence {
  // Approximation of [/[^\u0000-\u007F]$/i, '$0']: 'last char is not an
  // ASCII lowercase letter' stands in for 'code point > 127'. Genuine
  // non-ASCII letter endings agree with upstream identity.
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'café'>, 'café'>;
  // 'naïve' ends in an ASCII letter, so the rule does not fire and /s?$/ applies.
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'naïve'>, 'naïves'>;
  // Divergence class: an ASCII non-letter ending (e.g. a digit) takes this
  // identity arm here, whereas upstream falls through to /s?$/ and appends 's'.
  // The verified output is 'cat5' (identity). Upstream emits 'cat5s'
  // (its [^\u0000-\u007F] rule does not match the ASCII '5', so /s?$/ runs).
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'cat5'>, 'cat5'>;
}

namespace caseFolding {
  // Input is folded through Lowercase<T> before matching; output is lowercase.
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'AXIS'>, 'axes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'Hero'>, 'heroes'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'CHILD'>, 'children'>;
  // @ts-expect-no-error
  isAssignable<PluralizationRules<'Thou'>, 'you'>;
}
