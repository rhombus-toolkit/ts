// Public composed entry points.
export type { Pluralize, Singularize } from './public';

// Underlying layer types, re-exported for callers that want a single stage.
export type { PluralizeIrregular, SingularizeIrregular } from './irregular-nouns';
export type { IsUncountable, UncountableWord } from './uncountables';
export type { PluralizationRules } from './pluralization-rules';
export type { SingularizationRules } from './singularization-rules';
