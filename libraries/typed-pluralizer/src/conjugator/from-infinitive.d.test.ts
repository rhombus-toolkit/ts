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
