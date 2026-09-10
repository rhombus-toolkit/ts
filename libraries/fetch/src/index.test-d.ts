import { ProgressEvent } from '@rhombus-toolkit/platform';
import { FetchEventMap, ProgressEventTarget, wrapResponse } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// Each of the three progress phases delivers a ProgressEvent, and only those three are named.
namespace fetchEventMapNamesTheThreePhasesTest {
  // @ts-expect-no-error
  isAssignable<keyof FetchEventMap, 'progress' | 'complete' | 'cancelled'>;
  // @ts-expect-no-error
  isAssignable<FetchEventMap[keyof FetchEventMap], ProgressEvent>;
}

// A listener for a named phase receives a ProgressEvent, so its fields are readable without a cast.
namespace progressEventTargetTypesNamedListenersTest {
  declare const target: ProgressEventTarget;

  target.addEventListener('progress', (event) => {
    // @ts-expect-no-error
    isAssignable<typeof event, ProgressEvent>;
  });
  target.removeEventListener('complete', (event) => {
    // @ts-expect-no-error
    isAssignable<typeof event, ProgressEvent>;
  });
  // an unmapped name still falls through to the plain EventTarget overload
  // @ts-expect-no-error
  target.addEventListener('other', (event) => {
    // @ts-expect-error - a plain Event carries no progress fields
    event.loaded;
  });
}

// The wrapped response is still a Response, plus the progress emitter and cancel().
namespace wrapResponseReturnsAResponseWithProgressTest {
  declare const wrapped: ReturnType<typeof wrapResponse>;

  // @ts-expect-no-error
  isAssignable<typeof wrapped, Response>;
  // @ts-expect-no-error
  isAssignable<typeof wrapped.progress, ProgressEventTarget>;
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof wrapped.cancel>, Promise<void>>;
}
