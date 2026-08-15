import { ToAdverb } from './to-adverb';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Empirically verified against a node oracle that transcribes
// http://compromise.cool/website/browse/to_adverb.html exactly (dont-list ->
// null, irregular map, str.length<=3 guard, not_matches, first-match
// transforms, +ly fall-through). Every assertion below resolves to the literal
// the oracle produces (modulo the accepted lowercase divergence). Upstream
// null / no-conversion maps to `never`. Word lists for the irregular map and
// dont list are generated from the upstream data, not hand-typed.
//
// NOTE on enforcement: this file is `.test-d.ts`, the repo's type-level test
// convention -- the package's tsconfig.ci.json includes it in the type-check
// program run by `bun run lint`, so these assertion bodies genuinely gate the
// build. (Formerly inert under heft, which treated `*.d.test.ts` as a
// skipLibCheck'd `.d.ts` declaration file.)

namespace irregularMap {
  // full membership of the irregular adjective->adverb map
  // @ts-expect-no-error
  isAssignable<ToAdverb<'idle'>, 'idly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'public'>, 'publicly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'vague'>, 'vaguely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'day'>, 'daily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'icy'>, 'icily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'single'>, 'singly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'female'>, 'womanly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'male'>, 'manly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'simple'>, 'simply'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'whole'>, 'wholly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'special'>, 'especially'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'straight'>, 'straight'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'wrong'>, 'wrong'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fast'>, 'fast'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'hard'>, 'hard'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'late'>, 'late'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'early'>, 'early'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'well'>, 'well'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'best'>, 'best'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'latter'>, 'latter'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'bad'>, 'badly'>;
}

namespace dontList {
  // full membership of the dont list (no adverb form -> never)
  // @ts-expect-no-error
  isAssignable<ToAdverb<'foreign'>, never>; // 'foreign' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'black'>, never>; // 'black' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'modern'>, never>; // 'modern' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'next'>, never>; // 'next' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'difficult'>, never>; // 'difficult' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'degenerate'>, never>; // 'degenerate' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'young'>, never>; // 'young' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'awake'>, never>; // 'awake' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'back'>, never>; // 'back' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'blue'>, never>; // 'blue' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'brown'>, never>; // 'brown' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'orange'>, never>; // 'orange' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'complex'>, never>; // 'complex' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'cool'>, never>; // 'cool' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'dirty'>, never>; // 'dirty' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'done'>, never>; // 'done' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'empty'>, never>; // 'empty' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fat'>, never>; // 'fat' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fertile'>, never>; // 'fertile' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'frozen'>, never>; // 'frozen' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'gold'>, never>; // 'gold' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'grey'>, never>; // 'grey' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'gray'>, never>; // 'gray' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'green'>, never>; // 'green' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'medium'>, never>; // 'medium' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'parallel'>, never>; // 'parallel' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'outdoor'>, never>; // 'outdoor' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'unknown'>, never>; // 'unknown' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'undersized'>, never>; // 'undersized' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'used'>, never>; // 'used' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'welcome'>, never>; // 'welcome' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'yellow'>, never>; // 'yellow' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'white'>, never>; // 'white' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fixed'>, never>; // 'fixed' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'mixed'>, never>; // 'mixed' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'super'>, never>; // 'super' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'guilty'>, never>; // 'guilty' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'tiny'>, never>; // 'tiny' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'able'>, never>; // 'able' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'unable'>, never>; // 'unable' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'same'>, never>; // 'same' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'adult'>, never>; // 'adult' -> null
}

namespace transform_al_____ally {
  // transform: al$ -> ally
  // @ts-expect-no-error
  isAssignable<ToAdverb<'normal'>, 'normally'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'final'>, 'finally'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'equal'>, 'equally'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'usual'>, 'usually'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'loyal'>, 'loyally'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'total'>, 'totally'>;
}

namespace transform_ly_____ly__4__char__non_irregular_ {
  // transform: ly$ -> ly (4+ char, non-irregular)
  // @ts-expect-no-error
  isAssignable<ToAdverb<'holy'>, 'holy'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'ugly'>, 'ugly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'wily'>, 'wily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'curly'>, 'curly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'silly'>, 'silly'>;
}

namespace transform____3__y______1ily {
  // transform: (.{3})y$ -> $1ily
  // @ts-expect-no-error
  isAssignable<ToAdverb<'happy'>, 'happily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'lucky'>, 'luckily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'tidy'>, 'tidily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fairy'>, 'fairily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'merry'>, 'merrily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'crazy'>, 'crazily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'pretty'>, 'prettily'>;
}

namespace transform_que_____quely {
  // transform: que$ -> quely
  // @ts-expect-no-error
  isAssignable<ToAdverb<'unique'>, 'uniquely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'opaque'>, 'opaquely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'grotesque'>, 'grotesquely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'antique'>, 'antiquely'>;
}

namespace transform_ue_____uly {
  // transform: ue$ -> uly
  // @ts-expect-no-error
  isAssignable<ToAdverb<'true'>, 'truly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'clue'>, 'cluly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'value'>, 'valuly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'argue'>, 'arguly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'queue'>, 'queuly'>;
}

namespace transform_ic_____ically {
  // transform: ic$ -> ically
  // @ts-expect-no-error
  isAssignable<ToAdverb<'basic'>, 'basically'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'music'>, 'musically'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'magic'>, 'magically'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'toxic'>, 'toxically'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'tragic'>, 'tragically'>;
}

namespace transform_ble_____bly {
  // transform: ble$ -> bly
  // @ts-expect-no-error
  isAssignable<ToAdverb<'terrible'>, 'terribly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'stable'>, 'stably'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'noble'>, 'nobly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'double'>, 'doubly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'horrible'>, 'horribly'>;
}

namespace transform_l_____ly {
  // transform: l$ -> ly
  // @ts-expect-no-error
  isAssignable<ToAdverb<'cruel'>, 'cruely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'civil'>, 'civily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'evil'>, 'evily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'level'>, 'levely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'cool'>, never>; // 'cool' -> null
}

namespace notMatch_airs_ {
  // not_match: /airs$/ -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'fairs'>, never>; // 'fairs' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'stairs'>, never>; // 'stairs' -> null
}

namespace notMatch_ll_ {
  // not_match: /ll$/ -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'tall'>, never>; // 'tall' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'small'>, never>; // 'small' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'ball'>, never>; // 'ball' -> null
}

namespace notMatch_ee__ {
  // not_match: /ee.$/ -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'agree'>, 'agreely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'freed'>, never>; // 'freed' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'speed'>, never>; // 'speed' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'three'>, 'threely'>;
}

namespace notMatch_ile_ {
  // not_match: /ile$/ -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'mile'>, never>; // 'mile' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'while'>, never>; // 'while' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'smile'>, never>; // 'smile' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'facile'>, never>; // 'facile' -> null
}

namespace boundaryLengths {
  // length guard: 1-3 char words -> null (str.length <= 3); 4-char passes
  // @ts-expect-no-error
  isAssignable<ToAdverb<'a'>, never>; // 'a' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'ab'>, never>; // 'ab' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'abc'>, never>; // 'abc' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'abcd'>, 'abcdly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'sky'>, never>; // 'sky' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'dry'>, never>; // 'dry' -> null
}

namespace fallThrough {
  // no rule matches -> str + ly
  // @ts-expect-no-error
  isAssignable<ToAdverb<'quick'>, 'quickly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'slow'>, 'slowly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'warm'>, 'warmly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'cold'>, 'coldly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'great'>, 'greatly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'strange'>, 'strangely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'quiet'>, 'quietly'>;
}

namespace crossArmPriority {
  // dont/irregular checked before transforms; ordering probes
  // @ts-expect-no-error
  isAssignable<ToAdverb<'guilty'>, never>; // 'guilty' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'able'>, never>; // 'able' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'parallel'>, never>; // 'parallel' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'super'>, never>; // 'super' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'welcome'>, never>; // 'welcome' -> null
  // @ts-expect-no-error
  isAssignable<ToAdverb<'subtle'>, 'subtlely'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'gentle'>, 'gentlely'>;
}

namespace caseFolding {
  // Accepted divergence: input folded through Lowercase<T>, output lowercase;
  // upstream /i regexes preserve case.
  // @ts-expect-no-error
  isAssignable<ToAdverb<'HAPPY'>, 'happily'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'Public'>, 'publicly'>;
  // @ts-expect-no-error
  isAssignable<ToAdverb<'Foreign'>, never>;
}
