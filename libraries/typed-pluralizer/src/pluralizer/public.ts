// Public composed pluralization API for blakeembrey/pluralize v8.0.0.
// https://github.com/plurals/pluralize
//
// This module wires the individual layer modules (irregular-nouns,
// uncountables, pluralization-rules, singularization-rules) into the two public
// entry points, transcribing the upstream `replaceWord` pipeline EXACTLY.
//
// UPSTREAM PIPELINE (pluralize.js). Both public functions are
// `replaceWord(replaceMap, keepMap, rules)`:
//   pluralize.plural   = replaceWord(irregularSingles, irregularPlurals, pluralRules)
//   pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules)
//
//   replaceWord(replaceMap, keepMap, rules)(word):
//     token = word.toLowerCase()
//     1. keepMap.hasOwnProperty(token)    -> restoreCase(word, token)          [identity]
//     2. replaceMap.hasOwnProperty(token) -> restoreCase(word, replaceMap[token])
//     3. sanitizeWord(token, word, rules):
//          a. !token.length                       -> word                       [identity]
//             (the empty-string gate — implemented as the `T extends '' ? ''`
//             gate at the top of both _Pluralize and _Singularize below.)
//          b. uncountables.hasOwnProperty(token)  -> word                       [identity]
//          c. rules iterated BOTTOM-UP (while (len--)); first regex whose
//             test(word) passes -> replace(word, rule); else word.              [identity]
//
// CRITICAL ORDERING SUBTLETY — the merged uncountable gate.
//   `addUncountableRule` registers the uncountable list in TWO different places:
//     - STRING entries  -> uncountables[word] = true               (step 3b map)
//     - REGEX entries   -> addPluralRule(re,'$0') AND addSingularRule(re,'$0'),
//                          i.e. pushed onto BOTH rule arrays as identity rules,
//                          AFTER every normal rule was already pushed.
//   Because sanitizeWord walks the rules array bottom-up, those regex-uncountable
//   identity rules sit at the BOTTOM and are therefore tried BEFORE every normal
//   rule. So upstream step 3, for a non-empty token, is equivalent to:
//        (string-uncountable map hit)  OR  (any uncountable-regex matches)
//          -> identity
//        else -> normal rules, bottom-up.
//   The merged `IsUncountable<T>` answers exactly that disjunction (word Set OR
//   pattern arms). Hoisting it to a single gate BEFORE `*Rules<T>` is therefore
//   semantically equivalent to upstream's split-across-two-places evaluation:
//     - A word that hits ONLY the string map: upstream 3b returns identity before
//       the rules run; our gate returns identity before `*Rules<T>` runs. Same.
//     - A word that hits ONLY a regex uncountable: upstream's bottom rule fires
//       first (identity) and shadows any normal rule it would also match; our
//       gate returns identity first and shadows `*Rules<T>`. Same.
//     - A word that hits BOTH a regex uncountable AND a normal rule (the
//       collision case, e.g. /fish$/ vs /(x|ch|ss|sh|zz)$/-style arms): upstream
//       resolves to the regex-uncountable identity (it is lower in the array);
//       our gate resolves to identity first. Same.
//   The irregular maps are checked by upstream BEFORE sanitizeWord, so they win
//   over uncountables in both upstream and here — the gate order below preserves
//   that: keepMap identity, then replaceMap, then the merged uncountable gate,
//   then the rules. Proven empirically against the real library oracle over the
//   committed dataset (see public.test.ts); every probed input agrees.
//
// Accepted divergences from upstream (and only these):
//   (a) Matching is case-insensitive and output is always lowercase — every
//       layer folds input through `Lowercase<T>` and emits lowercase, whereas
//       upstream's `/i` regexes + `restoreCase` preserve the input casing.
//   (b) The ASCII-non-letter-ending class documented in pluralization-rules.ts
//       (a word whose lowercased final char is an ASCII non-letter, e.g. a digit,
//       takes the non-ASCII-letter identity arm here — our approximation of
//       upstream's "final code point outside the 0x00-0x7F range" rule —
//       instead of falling through to `/s?$/` and appending
//       's'). This propagates through `Pluralize`
//       unchanged. SINGULARIZATION has no analogue: its lowest-priority rule is
//       `/s$/i -> ''`, which only fires on an s-ending word and is gated by no
//       non-ASCII identity arm, so a digit-ending input simply falls through to
//       `never` in `SingularizationRules` and is surfaced as `Lowercase<T>` by
//       the `[...] extends [never]` guard below (see `_Singularize`). Both
//       behaviours are pinned in public.test.ts.

import { PluralizeIrregular, SingularizeIrregular } from './irregular-nouns';
import { PluralizationRules } from './pluralization-rules';
import { SingularizationRules } from './singularization-rules';
import { IsUncountable } from './uncountables';

// Pluralize a singular English word.
//
// Gate order mirrors `replaceWord(irregularSingles, irregularPlurals, pluralRules)`:
//   keepMap = irregularPlurals (already-plural irregulars -> identity),
//   replaceMap = irregularSingles (singular irregular -> its plural),
//   then the merged uncountable gate, then the pluralization rules.
// `[X] extends [never]` is the membership probe: `SingularizeIrregular<T>`
// resolves to `never` exactly when `Lowercase<T>` is NOT a key of the inverse
// (plural->singular) map, i.e. not an irregular plural; likewise
// `PluralizeIrregular<T>` is `never` exactly when not an irregular single.
export type Pluralize<T extends string> = _Pluralize<T>;

type _Pluralize<T extends string> =
  // 0. sanitizeWord step 3a: `if (!token.length) return word` — the empty string
  //    short-circuits to identity BEFORE any rule runs. The keep/replace maps and
  //    the uncountable Set/regexes never contain '' (all keys are non-empty), so
  //    hoisting this gate above them is equivalent to upstream's in-sanitizeWord
  //    placement. Without it, '' falls into PluralizationRules<''>, whose final
  //    guard takes the _SFallback branch (LastChar<''> = never, never extends
  //    Letter) and yields 's' — a divergence from upstream's identity ''.
  T extends '' ? ''
    // 1. keepMap (irregularPlurals) hit -> identity (word is already an irregular plural).
    : [SingularizeIrregular<T>] extends [never] // 2. replaceMap (irregularSingles) hit -> the irregular plural.
      ? [PluralizeIrregular<T>] extends [never] // 3. merged uncountable gate (string map OR uncountable regexes) -> identity.
        ? IsUncountable<T> extends true ? Lowercase<T>
          // 4. pluralization rules (bottom-up, regex-uncountables already hoisted into the gate above).
        : PluralizationRules<T>
      : PluralizeIrregular<T>
    : Lowercase<T>;

// Singularize a plural English word.
//
// Gate order mirrors `replaceWord(irregularPlurals, irregularSingles, singularRules)`:
//   keepMap = irregularSingles (already-singular irregulars -> identity),
//   replaceMap = irregularPlurals (irregular plural -> its singular),
//   then the merged uncountable gate, then the singularization rules.
export type Singularize<T extends string> = _Singularize<T>;

type _Singularize<T extends string> =
  // 0. sanitizeWord step 3a: `if (!token.length) return word` — the empty string
  //    short-circuits to identity BEFORE any rule runs (see _Pluralize note).
  //    Singularize<''> already resolved to '' by accident via the
  //    `[SingularizationRules<''>] extends [never]` fall-through, but pin it
  //    explicitly so the gate is symmetric with Pluralize and intent is clear.
  T extends '' ? ''
    // 1. keepMap (irregularSingles) hit -> identity (word is already an irregular singular).
    : [PluralizeIrregular<T>] extends [never] // 2. replaceMap (irregularPlurals) hit -> the irregular singular.
      ? [SingularizeIrregular<T>] extends [never] // 3. merged uncountable gate (string map OR uncountable regexes) -> identity.
        ? IsUncountable<T> extends true ? Lowercase<T>
          // 4. singularization rules. Unmatched input resolves to `never` in
          // `SingularizationRules`; surface the lowercased input instead, matching
          // upstream's `return word` fall-through at the end of `sanitizeWord`.
        : [SingularizationRules<T>] extends [never] ? Lowercase<T>
        : SingularizationRules<T>
      : SingularizeIrregular<T>
    : Lowercase<T>;
