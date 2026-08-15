// http://compromise.cool/website/browse/to_noun.html
//
// Adjective/verb -> noun. Upstream `to_noun(w)`: returns '' for empty input,
// then checks a 2-entry irregular map, then two early gates (contains a space;
// ends in `w`), then iterates 11 transform rules first-match-wins, then a final
// `/s$/` gate, then falls through appending `ness`.
//
// `never` mapping: upstream returns '' only for falsy (empty) input. Per the
// "upstream returns null/undefined/'' (no conversion) => the type resolves to
// never" convention, the empty-string input maps to `never` here. Every other
// path returns a real string, so there are no other `never` cases.
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream regexes are non-/i but only ever see
// lowercase input, so behaviour is identical.

import { ReplaceEnding } from '../util';

// Irregular adjective/verb->noun pairs (upstream `irregulars` object literal).
type irregulars = {
  clean: 'cleanliness'; // 'clean': 'cleanliness'
  naivety: 'naivety'; // 'naivety': 'naivety'
};

export type ToNoun<T extends string> = _ToNoun<Lowercase<T>>;

type _ToNoun<T extends string> =
  // if (!w) return ''; — empty input has no conversion => never
  T extends '' ? never
    // if (irregulars.hasOwnProperty(w)) return irregulars[w];
    : T extends keyof irregulars ? irregulars[T]
    // if (w.match(' ')) return w; — contains a space anywhere
    : T extends `${string} ${string}` ? T
    // if (w.match(/w$/)) return w;
    : T extends `${string}w` ? T
    // {'reg': /y$/, 'repl': 'iness'}
    : T extends `${string}y` ? ReplaceEnding<T, 'y', 'iness'>
    // {'reg': /le$/, 'repl': 'ility'}
    : T extends `${string}le` ? ReplaceEnding<T, 'le', 'ility'>
    // {'reg': /ial$/, 'repl': 'y'}
    : T extends `${string}ial` ? ReplaceEnding<T, 'ial', 'y'>
    // {'reg': /al$/, 'repl': 'ality'}
    : T extends `${string}al` ? ReplaceEnding<T, 'al', 'ality'>
    // {'reg': /ting$/, 'repl': 'ting'} — no-op
    : T extends `${string}ting` ? T
    // {'reg': /ring$/, 'repl': 'ring'} — no-op
    : T extends `${string}ring` ? T
    // {'reg': /bing$/, 'repl': 'bingness'}
    : T extends `${string}bing` ? ReplaceEnding<T, 'bing', 'bingness'>
    // {'reg': /sing$/, 'repl': 'se'}
    : T extends `${string}sing` ? ReplaceEnding<T, 'sing', 'se'>
    // {'reg': /ing$/, 'repl': 'ment'}
    : T extends `${string}ing` ? ReplaceEnding<T, 'ing', 'ment'>
    // {'reg': /ess$/, 'repl': 'essness'}
    : T extends `${string}ess` ? ReplaceEnding<T, 'ess', 'essness'>
    // {'reg': /ous$/, 'repl': 'ousness'}
    : T extends `${string}ous` ? ReplaceEnding<T, 'ous', 'ousness'>
    // if (w.match(/s$/)) return w;
    : T extends `${string}s` ? T
    // return w + 'ness'; — unconditional append (matches upstream)
    : `${T}ness`;
