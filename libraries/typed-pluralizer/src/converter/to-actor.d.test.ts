import { ToActor } from './to-actor';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Generated from the verified converter dataset (oracle == type on every case).
// Each assertion's expected literal is the empirically resolved ToActor output.
// '' inputs and no-conversion words resolve to `never`; asserted as such.

namespace irregularMap {
    // full irregular-map membership: every key asserted
    // @ts-expect-no-error
    isAssignable<ToActor<'tie'>, 'tier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'dream'>, 'dreamer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'sail'>, 'sailer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'run'>, 'runner'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'rub'>, 'rubber'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'begin'>, 'beginner'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'win'>, 'winner'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'claim'>, 'claimant'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'deal'>, 'dealer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'spin'>, 'spinner'>;
}

namespace dontList {
    // full dont-list membership: every word => null upstream => never
    // @ts-expect-no-error
    isAssignable<ToActor<'aid'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'fail'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'appear'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'happen'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'seem'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'try'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'say'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'marry'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'be'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'forbid'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'understand'>, never>;
    // @ts-expect-no-error
    isAssignable<ToActor<'bet'>, never>;
}

namespace transforms {
    // >=2 positives per transform arm + boundary negatives + default
    // @ts-expect-no-error
    isAssignable<ToActor<'bake'>, 'baker'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'write'>, 'writer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'dance'>, 'dancer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'code'>, 'coder'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'swim'>, 'swimmer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'trim'>, 'trimmer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'travel'>, 'traveller'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'cancel'>, 'canceller'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'dig'>, 'digger'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'jog'>, 'jogger'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'wrap'>, 'wrapper'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'shop'>, 'shopper'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'carry'>, 'carrier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'hurry'>, 'hurrier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'fly'>, 'flier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'apply'>, 'applier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'defy'>, 'defier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'classify'>, 'classifier'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'get'>, 'getter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'set'>, 'setter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'chat'>, 'chatter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'spit'>, 'spitter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'submit'>, 'submiter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'visit'>, 'visiter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'hit'>, 'hitter'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'walk'>, 'walker'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'jump'>, 'jumper'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'read'>, 'reader'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'paint'>, 'painter'>;
    // final fallthrough is unconditional (`return str + 'er'`): empty input and
    // inputs ending in a non-letter (digit/punctuation) still get `er` appended.
    // @ts-expect-no-error
    isAssignable<ToActor<''>, 'er'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'go2'>, 'go2er'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'2'>, '2er'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'do-'>, 'do-er'>;
}

namespace caseFolding {
    // input folded through Lowercase<T>; output lowercase
    // @ts-expect-no-error
    isAssignable<ToActor<'SWIM'>, 'swimmer'>;
    // @ts-expect-no-error
    isAssignable<ToActor<'BET'>, never>;
}
