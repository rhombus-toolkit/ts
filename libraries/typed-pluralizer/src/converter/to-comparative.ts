// http://compromise.cool/website/browse/to_comparative.html
import { Convertable } from './convertables';

// Faithful translation of upstream `to_comparative(str)`. The upstream control
// flow is a fixed sequence of stages, each short-circuiting on first match:
//
//   1. `dont` lookup            -> returns null          (here: type `never`)
//   2. `transforms` (4, /i)     -> first regex that hits wins
//   3. `convertables` gate      -> ends in 'e' ? str+'r' : str+'er'
//   4. `irregulars` lookup (9)
//   5. `not_matches` (2)        -> 'more ' + str
//   6. `matches` (10)           -> str + 'er'
//   7. fall-through             -> 'more ' + str
//
// Upstream's `dont` words return `null`; we surface that as `never` (no
// comparative exists). Documented per the spec: upstream null/undefined -> never.
//
// Accepted divergence: matching is case-insensitive via the `Lowercase<T>` fold
// and output is always lowercase; upstream's /i regexes preserved input case.
export type ToComparative<T extends string> = _ToComparative<Lowercase<T>>;

type _ToComparative<T> =
    // STAGE 1 — `dont`: { overweight, main, nearby, asleep, weekly, secret, certain } => null
    T extends 'overweight' | 'main' | 'nearby' | 'asleep' | 'weekly' | 'secret' | 'certain' ? never
    : // STAGE 2 — transforms (first-match wins, in source order):
    // [/y$/i, 'ier']
    T extends `${infer X}y` ? `${X}ier`
    : // [/([aeiou])t$/i, '$1tter'] — the captured vowel is baked into each arm's
    // suffix literal so the split is deterministic. A single constrained middle
    // infer (`${infer X}${infer V extends Vowel}t`) does NOT backtrack in TS, so
    // it fails on words with a consonant cluster (flat/great/neat) — empirically
    // verified. One arm per vowel sidesteps the limitation.
    T extends `${infer X}at` ? `${X}atter`
    : T extends `${infer X}et` ? `${X}etter`
    : T extends `${infer X}it` ? `${X}itter`
    : T extends `${infer X}ot` ? `${X}otter`
    : T extends `${infer X}ut` ? `${X}utter`
    : // [/([aeou])de$/i, '$1der'] — note [aeou] excludes 'i'; per-vowel arms for
    // the same deterministic-split reason.
    T extends `${infer X}ade` ? `${X}ader`
    : T extends `${infer X}ede` ? `${X}eder`
    : T extends `${infer X}ode` ? `${X}oder`
    : T extends `${infer X}ude` ? `${X}uder`
    : // [/nge$/i, 'nger']
    T extends `${infer X}nge` ? `${X}nger`
    : // STAGE 3 — convertables gate: hasOwnProperty(str) ? (/e$/ ? str+'r' : str+'er')
    T extends Convertable ?
        T extends `${string}e` ?
            `${T}r`
        :   `${T}er`
    : // STAGE 4 — irregulars
    // 'grey' => 'greyer'
    T extends 'grey' ? 'greyer'
    : // 'gray' => 'grayer'
    T extends 'gray' ? 'grayer'
    : // 'green' => 'greener'
    T extends 'green' ? 'greener'
    : // 'yellow' => 'yellower'
    T extends 'yellow' ? 'yellower'
    : // 'red' => 'redder'
    T extends 'red' ? 'redder'
    : // 'good' => 'better'
    T extends 'good' ? 'better'
    : // 'well' => 'better'
    T extends 'well' ? 'better'
    : // 'bad' => 'worse'
    T extends 'bad' ? 'worse'
    : // 'sad' => 'sadder'
    T extends 'sad' ? 'sadder'
    : // STAGE 5 — not_matches: [/ary$/, /ous$/] => 'more ' + str
    T extends `${string}${'ary' | 'ous'}` ? `more ${T & string}`
    : // STAGE 6 — matches (first-match wins, in source order) => str + 'er'
    // [/ght$/, /nge$/, /ough$/, /ain$/, /uel$/, /[au]ll$/, /ow$/, /old$/, /oud$/, /e[ae]p$/]
    T extends (
        `${string}${
            | 'ght'
            | 'nge'
            | 'ough'
            | 'ain'
            | 'uel'
            | `${'a' | 'u'}ll`
            | 'ow'
            | 'old'
            | 'oud'
            | `e${'a' | 'e'}p`}`
    ) ?
        `${T & string}er`
    : // STAGE 7 — fall-through => 'more ' + str
    T extends string ? `more ${T}`
    : never;
