import { FromInfinitive, ToInfinitive } from './irregular-verbs';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// Happy-path coverage for the irregular verb table (this module is complete).

namespace fromInfinitive {
    // @ts-expect-no-error
    isAssignable<FromInfinitive<'leave'>, 'left'>;
    // @ts-expect-no-error
    isAssignable<FromInfinitive<'make'>, 'made'>;
    // @ts-expect-no-error
    isAssignable<FromInfinitive<'go'>, 'went'>;
    // Words outside the table resolve to `never`.
    // @ts-expect-no-error
    isAssignable<FromInfinitive<'walk'>, never>;
}

namespace toInfinitive {
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'left'>, 'leave'>;
    // @ts-expect-no-error
    isAssignable<ToInfinitive<'made'>, 'make'>;
}
