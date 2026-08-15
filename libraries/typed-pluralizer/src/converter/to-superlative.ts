// http://compromise.cool/website/browse/to_superlative.html
import { Letter } from '../util';
import { Convertable } from './convertables';

// Faithful translation of upstream `to_superlative(str)`. Note the stage order
// differs from to_comparative: the convertables gate runs BEFORE `dont` and the
// irregulars, and there is no leading `dont => null` short-circuit. Each stage
// short-circuits on first match:
//
//   1. `transforms` (4, /i)     -> first regex that hits wins
//   2. `convertables` gate      -> generic: ends in 'e' ? str+'st' : str+'est'
//   3. `dont` lookup (2)        -> 'most ' + str
//   4. `irregulars` lookup (9)
//   5. `not_matches` (1)        -> 'most ' + str
//   6. `matches` (9)            -> generic (ends in 'e' ? str+'st' : str+'est')
//   7. fall-through             -> 'most ' + str
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream's /i regexes preserved input case.
export type ToSuperlative<T extends string> = _ToSuperlative<Lowercase<T>>;

// generic_transformation(s): /e$/ ? s+'st' : s+'est'
type Generic<T extends string> = T extends `${string}e` ? `${T}st` : `${T}est`;

type _ToSuperlative<T> =
  // STAGE 1 — transforms (first-match wins, in source order):
  // [/y$/i, 'iest']
  T extends `${infer X}y` ? `${X}iest`
    // [/([aeiou])t$/i, '$1ttest'] — captured vowel baked into each arm's suffix
    // literal; a single constrained middle infer doesn't backtrack in TS and
    // fails on consonant-cluster words (flat/great/neat), so one arm per vowel.
    : T extends `${infer X}at` ? `${X}attest`
    : T extends `${infer X}et` ? `${X}ettest`
    : T extends `${infer X}it` ? `${X}ittest`
    : T extends `${infer X}ot` ? `${X}ottest`
    : T extends `${infer X}ut` ? `${X}uttest`
    // [/([aeou])de$/i, '$1dest'] — [aeou] excludes 'i'; per-vowel arms.
    : T extends `${infer X}ade` ? `${X}adest`
    : T extends `${infer X}ede` ? `${X}edest`
    : T extends `${infer X}ode` ? `${X}odest`
    : T extends `${infer X}ude` ? `${X}udest`
    // [/nge$/i, 'ngest']
    : T extends `${infer X}nge` ? `${X}ngest`
    // STAGE 2 — convertables gate: hasOwnProperty(str) ? generic_transformation(str)
    : T extends Convertable ? Generic<T>
    // STAGE 3 — `dont`: { overweight, ready } => 'most ' + str
    // ('ready' is intercepted by the /y$/ transform above; only 'overweight' reaches here)
    : T extends 'overweight' | 'ready' ? `most ${T & string}`
    // STAGE 4 — irregulars
    // 'nice' => 'nicest'
    : T extends 'nice' ? 'nicest'
    // 'late' => 'latest'
    : T extends 'late' ? 'latest'
    // 'hard' => 'hardest'
    : T extends 'hard' ? 'hardest'
    // 'inner' => 'innermost'
    : T extends 'inner' ? 'innermost'
    // 'outer' => 'outermost'
    : T extends 'outer' ? 'outermost'
    // 'far' => 'furthest'
    : T extends 'far' ? 'furthest'
    // 'worse' => 'worst'
    : T extends 'worse' ? 'worst'
    // 'bad' => 'worst'
    : T extends 'bad' ? 'worst'
    // 'good' => 'best'
    : T extends 'good' ? 'best'
    // STAGE 5 — not_matches: [/ary$/] => 'most ' + str
    : T extends `${string}ary` ? `most ${T & string}`
    // STAGE 6 — matches (first-match wins, in source order) => generic_transformation(str)
    // [/ght$/, /nge$/, /ough$/, /ain$/, /uel$/, /[au]ll$/, /ow$/, /oud$/, /...p$/]
    : T extends `${string}${'ght' | 'nge' | 'ough' | 'ain' | 'uel' | `${'a' | 'u'}ll` | 'ow' | 'oud'}`
      ? Generic<T & string>
    // /...p$/ — three of any character followed by 'p' at end (length >= 4, ending 'p')
    : T extends `${string}${Letter}${Letter}${Letter}p` ? Generic<T & string>
    // STAGE 7 — fall-through => 'most ' + str
    : T extends string ? `most ${T}`
    : never;
