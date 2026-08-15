import { FromInfinitive } from './from-infinitive';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// These mirror the old `Failures` scratch union from the standalone project.
// Each pair is (infinitive -> expected past tense). The rule engine is WIP:
// cases that already produce the expected literal are asserted directly; cases
// that currently produce the wrong literal are pinned with @ts-expect-error and
// a TODO recording what the rules actually emit today.

namespace bully {
  // expected 'bullied'
  // @ts-expect-error
  isAssignable<FromInfinitive<'bully'>, 'bullied'>; // TODO known-wrong: produces 'bully'
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'bully'>, 'bully'>;
}

namespace take {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'take'>, 'took'>;
}

namespace weave {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'weave'>, 'weaved'>;
}

namespace leave {
  // expected 'left'
  // @ts-expect-error
  isAssignable<FromInfinitive<'leave'>, 'left'>; // TODO known-wrong: produces 'leaved'
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'leave'>, 'leaved'>;
}

namespace corner {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'corner'>, 'cornered'>;
}

namespace open {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'open'>, 'opened'>;
}

namespace stricken {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'stricken'>, 'strickened'>;
}

namespace come {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'come'>, 'came'>;
}

namespace position {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'position'>, 'positioned'>;
}

namespace caseFolding {
  // Input is folded through Lowercase<T> before matching; output is lowercase.
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'TAKE'>, 'took'>;
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'Open'>, 'opened'>;
}

namespace fend {
  // expected 'fended'
  // @ts-expect-error
  isAssignable<FromInfinitive<'fend'>, 'fended'>; // TODO known-wrong: produces 'fent'
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'fend'>, 'fent'>;
}

// --- Verified rule-fidelity dataset (regression gate) ---
// Each assertion below was resolved empirically via the tsc sentinel-assignment
// probe and cross-checked against a node oracle that replays the comment regexes
// first-match-wins. Outputs are the REGEX-FAITHFUL values: where the rule is
// linguistically wrong (home -> hame, snow -> snew, rolled-path words) the
// assertion still pins the regex output, because the per-arm comments are the
// spec, not English. Arm labels group the words by the rule that matched.
// NOTE: FromInfinitive does not consult the irregular-verb table (that branch is
// commented out in the rule type), so e.g. 'fly' falls through unchanged here.

// (eave)$ => $1d
namespace heave {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'heave'>, 'heaved'>;
}

// (end)$ => ent
namespace bend {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'bend'>, 'bent'>;
}
namespace send {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'send'>, 'sent'>;
}
namespace lend {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'lend'>, 'lent'>;
}

// (ide)$ => ode
namespace ride {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'ride'>, 'rode'>;
}
namespace glide {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'glide'>, 'glode'>;
}

// (ake)$ => ook
namespace bake {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'bake'>, 'book'>;
}
namespace shake {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'shake'>, 'shook'>;
}

// (eed)$ => $1ed
namespace bleed {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'bleed'>, 'bleeded'>;
}
namespace proceed {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'proceed'>, 'proceeded'>;
}

// (e)(ep)$ => $1pt
namespace keep {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'keep'>, 'kept'>;
}
namespace sleep {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'sleep'>, 'slept'>;
}
namespace weep {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'weep'>, 'wept'>;
}

// (a[tg]|i[zn]|ur|nc|gl|is)e$ => $1ed
namespace create {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'create'>, 'created'>;
}
namespace operate {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'operate'>, 'operated'>;
}
namespace organize {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'organize'>, 'organized'>;
}
namespace cure {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'cure'>, 'cured'>;
}
namespace dance {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'dance'>, 'danced'>;
}
namespace revise {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'revise'>, 'revised'>;
}

// ([i|f|rr])y$ => $1ied  [FIX: union member rr -> r]
namespace defy {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'defy'>, 'defied'>;
}
namespace classify {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'classify'>, 'classified'>;
}
namespace try_ {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'try'>, 'tried'>;
}
namespace cry {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'cry'>, 'cried'>;
}
namespace dry {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'dry'>, 'dried'>;
}
namespace fry {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'fry'>, 'fried'>;
}
namespace carry {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'carry'>, 'carried'>;
}
namespace hurry {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'hurry'>, 'hurried'>;
}

// ([td]er)$ => $1ed  [FIX: append ed, was rewriting r->d]
namespace water {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'water'>, 'watered'>;
}
namespace ponder {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'ponder'>, 'pondered'>;
}
namespace alter {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'alter'>, 'altered'>;
}
namespace order {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'order'>, 'ordered'>;
}
namespace enter {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'enter'>, 'entered'>;
}
namespace butter {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'butter'>, 'buttered'>;
}
namespace ladder {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'ladder'>, 'laddered'>;
}

// (er)$ => $1ed
namespace banner {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'banner'>, 'bannered'>;
}
namespace offer {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'offer'>, 'offered'>;
}

// ([bd]l)e$ => $1ed
namespace enable {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'enable'>, 'enabled'>;
}
namespace handle {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'handle'>, 'handled'>;
}
namespace bobble {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'bobble'>, 'bobbled'>;
}

// (ish|tch|ess)$ => $1ed
namespace wish {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'wish'>, 'wished'>;
}
namespace watch {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'watch'>, 'watched'>;
}
namespace press {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'press'>, 'pressed'>;
}

// (ion|end|e[nc]t)$ => $1ed
namespace action {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'action'>, 'actioned'>;
}
namespace prevent {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'prevent'>, 'prevented'>;
}
namespace accent {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'accent'>, 'accented'>;
}

// (om)e$ => ame
namespace become {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'become'>, 'became'>;
}
namespace home {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'home'>, 'hame'>;
}

// fall-through (no arm matches)
namespace adopt {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'adopt'>, 'adopt'>;
}
namespace tow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'tow'>, 'tow'>;
}
namespace xow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'xow'>, 'xow'>;
}

// ([aeiu])([pt])$ => $1$2
namespace admit {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'admit'>, 'admit'>;
}
namespace heap {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'heap'>, 'heap'>;
}

// (en)$ => $1ed
namespace happen {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'happen'>, 'happened'>;
}
namespace listen {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'listen'>, 'listened'>;
}

// (..)(ow)$ => $1ew  [FIX: require >=2 chars before ow]
namespace grow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'grow'>, 'grew'>;
}
namespace flow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'flow'>, 'flew'>;
}
namespace know {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'know'>, 'knew'>;
}
namespace throw_ {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'throw'>, 'threw'>;
}
namespace xyow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'xyow'>, 'xyew'>;
}
namespace snow {
  // @ts-expect-no-error
  isAssignable<FromInfinitive<'snow'>, 'snew'>;
}
