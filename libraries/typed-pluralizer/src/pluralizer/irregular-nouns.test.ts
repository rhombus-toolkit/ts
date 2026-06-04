import { PluralizeIrregular, SingularizeIrregular } from './irregular-nouns';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Generated from blakeembrey/pluralize v8.0.0 irregular pairs. Every pair is
// asserted in both directions (PluralizeIrregular single->plural,
// SingularizeIrregular plural->single), plus never-controls for non-members.
// This module is complete — no known-wrong cases.

namespace pluralizeForward {
    // singular -> plural, all 47 pairs.
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'i'>, 'we'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'me'>, 'us'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'he'>, 'they'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'she'>, 'they'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'them'>, 'them'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'myself'>, 'ourselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'yourself'>, 'yourselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'itself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'herself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'himself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'themself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'is'>, 'are'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'was'>, 'were'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'has'>, 'have'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'this'>, 'these'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'that'>, 'those'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'echo'>, 'echoes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'dingo'>, 'dingoes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'volcano'>, 'volcanoes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'tornado'>, 'tornadoes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'torpedo'>, 'torpedoes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'genus'>, 'genera'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'viscus'>, 'viscera'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'stigma'>, 'stigmata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'stoma'>, 'stomata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'dogma'>, 'dogmata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'lemma'>, 'lemmata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'schema'>, 'schemata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'anathema'>, 'anathemata'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'ox'>, 'oxen'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'axe'>, 'axes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'die'>, 'dice'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'yes'>, 'yeses'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'foot'>, 'feet'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'eave'>, 'eaves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'goose'>, 'geese'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'tooth'>, 'teeth'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'quiz'>, 'quizzes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'human'>, 'humans'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'proof'>, 'proofs'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'carve'>, 'carves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'valve'>, 'valves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'looey'>, 'looies'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'thief'>, 'thieves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'groove'>, 'grooves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'pickaxe'>, 'pickaxes'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'passerby'>, 'passersby'>;
}

namespace singularizeInverse {
    // plural -> singular, all 43 resolved inverse entries. Four plurals
    // collide in the upstream inverse map; the last-written single wins:
    //   'they'       <- he, she                            => 'she'
    //   'themselves' <- itself, herself, himself, themself => 'themself'
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'we'>, 'i'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'us'>, 'me'>;
    // collision winner (last write): they -> she
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'they'>, 'she'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'them'>, 'them'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'ourselves'>, 'myself'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'yourselves'>, 'yourself'>;
    // collision winner (last write): themselves -> themself
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'themselves'>, 'themself'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'are'>, 'is'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'were'>, 'was'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'have'>, 'has'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'these'>, 'this'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'those'>, 'that'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'echoes'>, 'echo'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'dingoes'>, 'dingo'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'volcanoes'>, 'volcano'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'tornadoes'>, 'tornado'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'torpedoes'>, 'torpedo'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'genera'>, 'genus'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'viscera'>, 'viscus'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'stigmata'>, 'stigma'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'stomata'>, 'stoma'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'dogmata'>, 'dogma'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'lemmata'>, 'lemma'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'schemata'>, 'schema'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'anathemata'>, 'anathema'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'oxen'>, 'ox'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'axes'>, 'axe'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'dice'>, 'die'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'yeses'>, 'yes'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'feet'>, 'foot'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'eaves'>, 'eave'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'geese'>, 'goose'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'teeth'>, 'tooth'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'quizzes'>, 'quiz'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'humans'>, 'human'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'proofs'>, 'proof'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'carves'>, 'carve'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'valves'>, 'valve'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'looies'>, 'looey'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'thieves'>, 'thief'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'grooves'>, 'groove'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'pickaxes'>, 'pickaxe'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'passersby'>, 'passerby'>;
}

namespace collisionLosers {
    // The singulars that LOST the inverse collision still pluralize forward
    // (their single->plural entry is intact), but the plural singularizes
    // back to the winner, not to them. These assert the asymmetry.
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'he'>, 'they'>;
    // 'they' singularizes to the winner 'she', not back to 'he'.
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'they'>, 'she'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'itself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'herself'>, 'themselves'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'himself'>, 'themselves'>;
    // 'themselves' singularizes to the winner 'themself'.
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'themselves'>, 'themself'>;
}

namespace caseFolding {
    // Input is folded through Lowercase<T> before matching; output is lowercase.
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'OX'>, 'oxen'>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'Goose'>, 'geese'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'OXEN'>, 'ox'>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'Teeth'>, 'tooth'>;
}

namespace nonMembers {
    // Non-members resolve to never in both directions.
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'cat'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'cat'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'dog'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'dog'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'house'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'house'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'book'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'book'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'running'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'running'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'xyzzy'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'xyzzy'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'foots'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'foots'>, never>;
    // @ts-expect-no-error
    isAssignable<PluralizeIrregular<'gooses'>, never>;
    // @ts-expect-no-error
    isAssignable<SingularizeIrregular<'gooses'>, never>;
}
