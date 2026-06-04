// http://compromise.cool/website/browse/to_adverb.html
import { Letter } from '../util';

// Irregular adjective -> adverb map. Exact full-word lookups, checked AFTER the
// `dont` list but BEFORE the short-word length guard, so the <=3-char entries
// (`day`, `icy`, `bad`) still resolve.
type irregulars = {
    idle: 'idly'; // 'idle': 'idly'
    public: 'publicly'; // 'public': 'publicly'
    vague: 'vaguely'; // 'vague': 'vaguely'
    day: 'daily'; // 'day': 'daily'
    icy: 'icily'; // 'icy': 'icily'
    single: 'singly'; // 'single': 'singly'
    female: 'womanly'; // 'female': 'womanly'
    male: 'manly'; // 'male': 'manly'
    simple: 'simply'; // 'simple': 'simply'
    whole: 'wholly'; // 'whole': 'wholly'
    special: 'especially'; // 'special': 'especially'
    straight: 'straight'; // 'straight': 'straight'
    wrong: 'wrong'; // 'wrong': 'wrong'
    fast: 'fast'; // 'fast': 'fast'
    hard: 'hard'; // 'hard': 'hard'
    late: 'late'; // 'late': 'late'
    early: 'early'; // 'early': 'early'
    well: 'well'; // 'well': 'well'
    best: 'best'; // 'best': 'best'
    latter: 'latter'; // 'latter': 'latter'
    bad: 'badly'; // 'bad': 'badly'
};

// `dont` list: adjectives that have no adverb form. Upstream returns `null` for
// these; the typed equivalent is `never`. Exact full-word lookups, checked
// first of all.
type dont =
    | 'foreign' // 'foreign': 1
    | 'black' // 'black': 1
    | 'modern' // 'modern': 1
    | 'next' // 'next': 1
    | 'difficult' // 'difficult': 1
    | 'degenerate' // 'degenerate': 1
    | 'young' // 'young': 1
    | 'awake' // 'awake': 1
    | 'back' // 'back': 1
    | 'blue' // 'blue': 1
    | 'brown' // 'brown': 1
    | 'orange' // 'orange': 1
    | 'complex' // 'complex': 1
    | 'cool' // 'cool': 1
    | 'dirty' // 'dirty': 1
    | 'done' // 'done': 1
    | 'empty' // 'empty': 1
    | 'fat' // 'fat': 1
    | 'fertile' // 'fertile': 1
    | 'frozen' // 'frozen': 1
    | 'gold' // 'gold': 1
    | 'grey' // 'grey': 1
    | 'gray' // 'gray': 1
    | 'green' // 'green': 1
    | 'medium' // 'medium': 1
    | 'parallel' // 'parallel': 1
    | 'outdoor' // 'outdoor': 1
    | 'unknown' // 'unknown': 1
    | 'undersized' // 'undersized': 1
    | 'used' // 'used': 1
    | 'welcome' // 'welcome': 1
    | 'yellow' // 'yellow': 1
    | 'white' // 'white': 1
    | 'fixed' // 'fixed': 1
    | 'mixed' // 'mixed': 1
    | 'super' // 'super': 1
    | 'guilty' // 'guilty': 1
    | 'tiny' // 'tiny': 1
    | 'able' // 'able': 1
    | 'unable' // 'unable': 1
    | 'same' // 'same': 1
    | 'adult'; // 'adult': 1

// Words of length 1, 2 or 3 enumerated structurally. Upstream guards with
// `if (str.length <= 3) return null;` AFTER the `dont`/`irregulars` lookups, so
// this is applied in that same position below — short irregulars like `bad`,
// `day`, `icy` are already resolved before we get here.
type ShortWord = `${Letter}` | `${Letter}${Letter}` | `${Letter}${Letter}${Letter}`;

// `not_matches`: case-sensitive suffix patterns that suppress conversion
// (`return null`). Folded to `never`. Checked after the length guard, before
// the transforms.
//   /airs$/  /ll$/  /ee.$/  /ile$/
type NotMatch =
    | `${string}airs` // /airs$/
    | `${string}ll` // /ll$/
    | `${string}ee${Letter}` // /ee.$/  (. = any single letter)
    | `${string}ile`; // /ile$/

// Matching is case-insensitive (input is folded to lowercase first); output is
// always lowercase. Upstream `null` / no-conversion maps to `never`. The
// accepted divergence from upstream: upstream `/i` regexes preserve the
// original case, here everything is lowercased via the `Lowercase<T>` fold.
export type ToAdverb<T extends string> = _ToAdverb<Lowercase<T>>;

type _ToAdverb<T> =
    // if (dont[str]) { return null; }
    T extends dont ? never
    : // if (irregulars[str]) { return irregulars[str]; }
    T extends keyof irregulars ? irregulars[T]
    : // if (str.length <= 3) { return null; }
    T extends ShortWord ? never
    : // not_matches: if (str.match(...)) { return null; }
    T extends NotMatch ? never
    : // transforms (first match wins):
    // { reg: /al$/i, repl: 'ally' }
    T extends `${infer X}al` ? `${X}ally`
    : // { reg: /ly$/i, repl: 'ly' }
    T extends `${string}ly` ? T
    : // { reg: /(.{3})y$/i, repl: '$1ily' }  (>=3 letters before the final y)
    // The captured `(.{3})` is replaced verbatim, so the net effect is: strip the
    // trailing `y` and append `ily`. The three mandatory `${Letter}`s enforce the
    // `.{3}` guard structurally.
    T extends `${string}${Letter}${Letter}${Letter}y` ? `${StripFinalY<T>}ily`
    : // { reg: /que$/i, repl: 'quely' }
    T extends `${infer X}que` ? `${X}quely`
    : // { reg: /ue$/i, repl: 'uly' }
    T extends `${infer X}ue` ? `${X}uly`
    : // { reg: /ic$/i, repl: 'ically' }
    T extends `${infer X}ic` ? `${X}ically`
    : // { reg: /ble$/i, repl: 'bly' }
    T extends `${infer X}ble` ? `${X}bly`
    : // { reg: /l$/i, repl: 'ly' }
    T extends `${infer X}l` ? `${X}ly`
    : // fall-through: return str + 'ly';
    T extends string ? `${T}ly`
    : never;

// Drops a single trailing `y`. Used by the `/(.{3})y$/ -> $1ily` arm above,
// which keeps the captured 3 chars verbatim and only swaps `y` for `ily`.
type StripFinalY<T> = T extends `${infer Base}y` ? Base : T;
