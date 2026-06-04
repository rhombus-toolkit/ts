// // Pronouns.
export type IrregularRules<T> =
    T extends 'I' ? 'we' :
    T extends 'me' ? 'us' :
    T extends 'he' ? 'they' :
    T extends 'she' ? 'they' :
    T extends 'them' ? 'them' :
    T extends 'myself' ? 'ourselves' :
    T extends 'yourself' ? 'yourselves' :
    T extends 'itself' ? 'themselves' :
    T extends 'herself' ? 'themselves' :
    T extends 'himself' ? 'themselves' :
    T extends 'themself' ? 'themselves' :
    T extends 'is' ? 'are' :
    T extends 'was' ? 'were' :
    T extends 'has' ? 'have' :
    T extends 'this' ? 'these' :
    T extends 'that' ? 'those' :
    // Words ending in with a consonant and `o`.
    T extends 'echo' ? 'echoes' :
    T extends 'dingo' ? 'dingoes' :
    T extends 'volcano' ? 'volcanoes' :
    T extends 'tornado' ? 'tornadoes' :
    T extends 'torpedo' ? 'torpedoes' :
    // Ends with `us`.
    T extends 'genus' ? 'genera' :
    T extends 'viscus' ? 'viscera' :
    // Ends with `ma`.
    T extends 'stigma' ? 'stigmata' :
    T extends 'stoma' ? 'stomata' :
    T extends 'dogma' ? 'dogmata' :
    T extends 'lemma' ? 'lemmata' :
    T extends 'schema' ? 'schemata' :
    T extends 'anathema' ? 'anathemata' :
    // Other irregular rules.
    T extends 'ox' ? 'oxen' :
    T extends 'axe' ? 'axes' :
    T extends 'die' ? 'dice' :
    T extends 'yes' ? 'yeses' :
    T extends 'foot' ? 'feet' :
    T extends 'eave' ? 'eaves' :
    T extends 'goose' ? 'geese' :
    T extends 'tooth' ? 'teeth' :
    T extends 'quiz' ? 'quizzes' :
    T extends 'human' ? 'humans' :
    T extends 'proof' ? 'proofs' :
    T extends 'carve' ? 'carves' :
    T extends 'valve' ? 'valves' :
    T extends 'looey' ? 'looies' :
    T extends 'thief' ? 'thieves' :
    T extends 'groove' ? 'grooves' :
    T extends 'pickaxe' ? 'pickaxes' :
    T extends 'passerby' ? 'passerby' :
    T;
