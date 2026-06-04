import { ToNoun } from './to-noun';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Generated from the verified converter dataset (oracle == type on every case).
// Each assertion's expected literal is the empirically resolved ToNoun output.
// '' inputs and no-conversion words resolve to `never`; asserted as such.

namespace irregularMap {
    // full irregular-map membership: every key asserted
    // @ts-expect-no-error
    isAssignable<ToNoun<'clean'>, 'cleanliness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'naivety'>, 'naivety'>;
}

namespace emptyInput {
    // !w => empty string upstream => no conversion => never
    // @ts-expect-no-error
    isAssignable<ToNoun<''>, never>;
}

namespace transforms {
    // >=2 positives per transform arm + gates (space, w$, s$) + default
    // @ts-expect-no-error
    isAssignable<ToNoun<'happy'>, 'happiness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'silly'>, 'silliness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'lovely'>, 'loveliness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'gentle'>, 'gentility'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'able'>, 'ability'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'noble'>, 'nobility'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'partial'>, 'party'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'special'>, 'specy'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'facial'>, 'facy'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'normal'>, 'normality'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'brutal'>, 'brutality'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'final'>, 'finality'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'acting'>, 'acting'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'meeting'>, 'meeting'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'waiting'>, 'waiting'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'caring'>, 'caring'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'boring'>, 'boring'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'staring'>, 'staring'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'climbing'>, 'climbingness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'rubbing'>, 'rubbingness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'sobbing'>, 'sobbingness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'closing'>, 'close'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'rising'>, 'rise'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'choosing'>, 'choose'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'moving'>, 'movment'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'feeling'>, 'feelment'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'meaning'>, 'meanment'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'careless'>, 'carelessness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'helpless'>, 'helplessness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'useless'>, 'uselessness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'famous'>, 'famousness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'nervous'>, 'nervousness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'jealous'>, 'jealousness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'gas'>, 'gas'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'bus'>, 'bus'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'this'>, 'this'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'cars'>, 'cars'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'hot dog'>, 'hot dog'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'ice cream'>, 'ice cream'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'slow'>, 'slow'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'follow'>, 'follow'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'yellow'>, 'yellow'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'kind'>, 'kindness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'bold'>, 'boldness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'hot'>, 'hotness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'red'>, 'redness'>;
}

namespace caseFolding {
    // input folded through Lowercase<T>; output lowercase
    // @ts-expect-no-error
    isAssignable<ToNoun<'HAPPY'>, 'happiness'>;
    // @ts-expect-no-error
    isAssignable<ToNoun<'Clean'>, 'cleanliness'>;
}
