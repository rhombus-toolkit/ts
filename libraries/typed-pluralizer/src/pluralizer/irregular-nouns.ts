// Irregular noun pairs transcribed from blakeembrey/pluralize v8.0.0
// (https://github.com/plurals/pluralize), the `addIrregularRule(single, plural)`
// list in pluralize.js. Generated from source — zero hand transcription.
//
// Upstream `addIrregularRule` lowercases both members and populates two maps:
//   irregularSingles[single] = plural   (forward, singular -> plural)
//   irregularPlurals[plural] = single   (inverse, plural -> singular)
// Both are plain-object assignments, so on a key collision the LAST pair wins.
// All 47 singles are distinct, but four plurals collide in the inverse map:
//   'they'       <- he, she                    => resolves to 'she'
//   'themselves' <- itself, herself, himself, themself => resolves to 'themself'
// The inverse map below encodes those last-write winners (see inline notes).
//
// Accepted divergence from upstream: matching is case-insensitive (input is
// folded through `Lowercase<T>`) and output is always lowercase; upstream's /i
// regexes preserve case.

// Forward direction: singular -> plural. 47 distinct keys.
interface IrregularSingles {
    i: 'we';
    me: 'us';
    he: 'they';
    she: 'they';
    them: 'them';
    myself: 'ourselves';
    yourself: 'yourselves';
    itself: 'themselves';
    herself: 'themselves';
    himself: 'themselves';
    themself: 'themselves';
    is: 'are';
    was: 'were';
    has: 'have';
    this: 'these';
    that: 'those';
    echo: 'echoes';
    dingo: 'dingoes';
    volcano: 'volcanoes';
    tornado: 'tornadoes';
    torpedo: 'torpedoes';
    genus: 'genera';
    viscus: 'viscera';
    stigma: 'stigmata';
    stoma: 'stomata';
    dogma: 'dogmata';
    lemma: 'lemmata';
    schema: 'schemata';
    anathema: 'anathemata';
    ox: 'oxen';
    axe: 'axes';
    die: 'dice';
    yes: 'yeses';
    foot: 'feet';
    eave: 'eaves';
    goose: 'geese';
    tooth: 'teeth';
    quiz: 'quizzes';
    human: 'humans';
    proof: 'proofs';
    carve: 'carves';
    valve: 'valves';
    looey: 'looies';
    thief: 'thieves';
    groove: 'grooves';
    pickaxe: 'pickaxes';
    passerby: 'passersby';
}

// Inverse direction: plural -> singular. 43 distinct keys (four plurals collide;
// last-write-wins, matching the upstream object assignment).
interface IrregularPlurals {
    we: 'i';
    us: 'me';
    they: 'she'; // collision: he->they then she->they; she wins (last write)
    them: 'them';
    ourselves: 'myself';
    yourselves: 'yourself';
    themselves: 'themself'; // collision: itself/herself/himself/themself->themselves; themself wins (last write)
    are: 'is';
    were: 'was';
    have: 'has';
    these: 'this';
    those: 'that';
    echoes: 'echo';
    dingoes: 'dingo';
    volcanoes: 'volcano';
    tornadoes: 'tornado';
    torpedoes: 'torpedo';
    genera: 'genus';
    viscera: 'viscus';
    stigmata: 'stigma';
    stomata: 'stoma';
    dogmata: 'dogma';
    lemmata: 'lemma';
    schemata: 'schema';
    anathemata: 'anathema';
    oxen: 'ox';
    axes: 'axe';
    dice: 'die';
    yeses: 'yes';
    feet: 'foot';
    eaves: 'eave';
    geese: 'goose';
    teeth: 'tooth';
    quizzes: 'quiz';
    humans: 'human';
    proofs: 'proof';
    carves: 'carve';
    valves: 'valve';
    looies: 'looey';
    thieves: 'thief';
    grooves: 'groove';
    pickaxes: 'pickaxe';
    passersby: 'passerby';
}

export type PluralizeIrregular<T extends string> =
    Lowercase<T> extends keyof IrregularSingles ? IrregularSingles[Lowercase<T>] : never;

export type SingularizeIrregular<T extends string> =
    Lowercase<T> extends keyof IrregularPlurals ? IrregularPlurals[Lowercase<T>] : never;
