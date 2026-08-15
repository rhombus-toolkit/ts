// http://compromise.cool/website/browse/to_adjective.html
//
// Adverb -> adjective. Upstream `to_adjective(str)`: checks an 18-entry
// irregular map first, then iterates 7 transform rules first-match-wins, then
// falls through returning the input unchanged. Upstream never returns
// null/undefined, so there is no `never` case here: an unmatched word converts
// to itself (folded to lowercase). The `never` mapping convention — "upstream
// returns null/undefined => the type resolves to never" — does not apply to
// this file because to_adjective has no null/undefined return path.
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream /i regexes preserve case.

import { AnyOf, Letter, ReplaceEnding } from '../util';

// Irregular adverb->adjective pairs (upstream `irregulars` object literal).
type irregulars = {
  idly: 'idle'; // 'idly': 'idle'
  sporadically: 'sporadic'; // 'sporadically': 'sporadic'
  basically: 'basic'; // 'basically': 'basic'
  grammatically: 'grammatical'; // 'grammatically': 'grammatical'
  alphabetically: 'alphabetical'; // 'alphabetically': 'alphabetical'
  economically: 'economical'; // 'economically': 'economical'
  conically: 'conical'; // 'conically': 'conical'
  politically: 'political'; // 'politically': 'political'
  vertically: 'vertical'; // 'vertically': 'vertical'
  practically: 'practical'; // 'practically': 'practical'
  theoretically: 'theoretical'; // 'theoretically': 'theoretical'
  critically: 'critical'; // 'critically': 'critical'
  fantastically: 'fantastic'; // 'fantastically': 'fantastic'
  mystically: 'mystical'; // 'mystically': 'mystical'
  pornographically: 'pornographic'; // 'pornographically': 'pornographic'
  fully: 'full'; // 'fully': 'full'
  jolly: 'jolly'; // 'jolly': 'jolly'
  wholly: 'whole'; // 'wholly': 'whole'
};

export type ToAdjective<T extends string> = _ToAdjective<Lowercase<T>>;

type _ToAdjective<T> =
  // if (irregulars.hasOwnProperty(str)) return irregulars[str];
  T extends keyof irregulars ? irregulars[T]
    // {'reg': /bly$/i, 'repl': 'ble'}
    : T extends `${string}bly` ? ReplaceEnding<T, 'bly', 'ble'>
    // {'reg': /gically$/i, 'repl': 'gical'}
    : T extends `${string}gically` ? ReplaceEnding<T, 'gically', 'gical'>
    // {'reg': /([rsdh])ically$/i, 'repl': '$1ical'}
    : T extends `${string}${AnyOf<'rsdh'>}ically` ? ReplaceEnding<T, 'ically', 'ical'>
    // {'reg': /ically$/i, 'repl': 'ic'}
    : T extends `${string}ically` ? ReplaceEnding<T, 'ically', 'ic'>
    // {'reg': /uly$/i, 'repl': 'ue'}
    : T extends `${string}uly` ? ReplaceEnding<T, 'uly', 'ue'>
    // {'reg': /ily$/i, 'repl': 'y'}
    : T extends `${string}ily` ? ReplaceEnding<T, 'ily', 'y'>
    // {'reg': /(.{3})ly$/i, 'repl': '$1'} — 3+ chars before `ly`, drop `ly`
    : T extends `${string}${Letter}${Letter}${Letter}ly` ? ReplaceEnding<T, 'ly', ''>
    // for-loop exhausted: return str (input unchanged, lowercased)
    : T;
