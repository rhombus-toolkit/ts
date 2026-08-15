// Uncountable word and pattern rules from blakeembrey/pluralize v8.0.0.
// https://github.com/plurals/pluralize
//
// Upstream collects these in a single list passed to `addUncountableRule` at the
// bottom of pluralize.js. Two shapes live in that list:
//   - string entries  -> registered in the `uncountables` map as exact words
//     (`uncountables[word.toLowerCase()] = true`).
//   - regex entries   -> registered as plural+singular rules with the identity
//     replacement `'$0'`, so a matching word round-trips unchanged. Functionally
//     that is the same notion of "uncountable": singular === plural.
// `IsUncountable<T>` answers true when the lowercased input is an exact word in
// the union OR matches any of the pattern arms.
//
// const uncountables = [
//     // Singular words with no plurals.
//     'adulthood', 'advice', 'agenda', 'aid', 'aircraft', 'alcohol', 'ammo',
//     'analytics', 'anime', 'athletics', 'audio', 'bison', 'blood', 'bream',
//     'buffalo', 'butter', 'carp', 'cash', 'chassis', 'chess', 'clothing', 'cod',
//     'commerce', 'cooperation', 'corps', 'debris', 'diabetes', 'digestion',
//     'elk', 'energy', 'equipment', 'excretion', 'expertise', 'firmware',
//     'flounder', 'fun', 'gallows', 'garbage', 'graffiti', 'hardware',
//     'headquarters', 'health', 'herpes', 'highjinks', 'homework', 'housework',
//     'information', 'jeans', 'justice', 'kudos', 'labour', 'literature',
//     'machinery', 'mackerel', 'mail', 'media', 'mews', 'moose', 'music', 'mud',
//     'manga', 'news', 'only', 'personnel', 'pike', 'plankton', 'pliers',
//     'police', 'pollution', 'premises', 'rain', 'research', 'rice', 'salmon',
//     'scissors', 'series', 'sewage', 'shambles', 'shrimp', 'software', 'species',
//     'staff', 'swine', 'tennis', 'traffic', 'transportation', 'trout', 'tuna',
//     'wealth', 'welfare', 'whiting', 'wildebeest', 'wildlife', 'you',
//     /pok[eé]mon$/i,
//     // Regexes.
//     /[^aeiou]ese$/i, // "chinese", "japanese"
//     /deer$/i, // "deer", "reindeer"
//     /fish$/i, // "fish", "blowfish", "angelfish"
//     /measles$/i,
//     /o[iu]s$/i, // "carnivorous"
//     /pox$/i, // "chickpox", "smallpox"
//     /sheep$/i,
// ];

import { AnyOf, NoneOf } from '../util';

// The exact-word entries (string members of the upstream list), verbatim and
// lowercased. GENERATED from pluralize.js — do not hand-edit; regenerate from
// source if the upstream list changes.
export type UncountableWord = 'adulthood' | 'advice' | 'agenda' | 'aid' | 'aircraft' | 'alcohol' | 'ammo' | 'analytics'
  | 'anime' | 'athletics' | 'audio' | 'bison' | 'blood' | 'bream' | 'buffalo' | 'butter' | 'carp' | 'cash' | 'chassis'
  | 'chess' | 'clothing' | 'cod' | 'commerce' | 'cooperation' | 'corps' | 'debris' | 'diabetes' | 'digestion' | 'elk'
  | 'energy' | 'equipment' | 'excretion' | 'expertise' | 'firmware' | 'flounder' | 'fun' | 'gallows' | 'garbage'
  | 'graffiti' | 'hardware' | 'headquarters' | 'health' | 'herpes' | 'highjinks' | 'homework' | 'housework'
  | 'information' | 'jeans' | 'justice' | 'kudos' | 'labour' | 'literature' | 'machinery' | 'mackerel' | 'mail'
  | 'media' | 'mews' | 'moose' | 'music' | 'mud' | 'manga' | 'news' | 'only' | 'personnel' | 'pike' | 'plankton'
  | 'pliers' | 'police' | 'pollution' | 'premises' | 'rain' | 'research' | 'rice' | 'salmon' | 'scissors' | 'series'
  | 'sewage' | 'shambles' | 'shrimp' | 'software' | 'species' | 'staff' | 'swine' | 'tennis' | 'traffic'
  | 'transportation' | 'trout' | 'tuna' | 'wealth' | 'welfare' | 'whiting' | 'wildebeest' | 'wildlife' | 'you';

// Matching is case-insensitive: the public type folds input through
// `Lowercase<T>` before delegating to the internal chain, so the pattern arms
// only ever see lowercase words. Output is always lowercase. This is the one
// accepted divergence from upstream, whose regexes carry the `/i` flag and
// preserve case.
//
// Domain narrowing: `AnyOf`/`NoneOf` range over the 26-letter `Letter` domain
// (see ../util). Where an upstream character class is broader than 26 lowercase
// letters, the narrowing is called out on the arm:
//   - /[^aeiou]/ matches ANY non-vowel character (digits, punctuation, non-ASCII
//     letters). We narrow it to the non-vowel members of `Letter` via
//     `NoneOf<'aeiou'>` (consonants plus 'y'). Acceptable: real English words
//     ending "<consonant>ese" are the intended targets ("chinese", "japanese").
//   - /[eé]/ in pok[eé]mon includes 'é', which is outside `Letter`. We spell the
//     two literal options inline as `'e' | 'é'` so both "pokemon" and "pokémon"
//     match; 'é' cannot come from `AnyOf` because `Letter` is ASCII-only.
export type IsUncountable<T extends string> = _IsUncountable<Lowercase<T>>;

type _IsUncountable<T> =
  // Exact-word membership in the upstream `uncountables` map.
  T extends UncountableWord ? true
    // /pok[eé]mon$/i  — [eé] spelled inline; 'é' is outside the Letter domain.
    : T extends `${string}pok${'e' | 'é'}mon` ? true
    // /[^aeiou]ese$/i  — "chinese", "japanese". [^aeiou] narrowed to non-vowel Letters.
    : T extends `${string}${NoneOf<'aeiou'>}ese` ? true
    // /deer$/i  — "deer", "reindeer".
    : T extends `${string}deer` ? true
    // /fish$/i  — "fish", "blowfish", "angelfish".
    : T extends `${string}fish` ? true
    // /measles$/i
    : T extends `${string}measles` ? true
    // /o[iu]s$/i  — "carnivorous".
    : T extends `${string}o${AnyOf<'iu'>}s` ? true
    // /pox$/i  — "chickpox", "smallpox".
    : T extends `${string}pox` ? true
    // /sheep$/i
    : T extends `${string}sheep` ? true
    : false;
