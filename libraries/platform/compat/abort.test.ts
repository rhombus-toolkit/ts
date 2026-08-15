// Assignability probes proving the owned abort.ts types don't conflict with
// the real lib.dom globals when both are present in a consumer's program.
// Compiled by ../tsconfig.compat.json (lib: ["ES2022", "DOM"]), never by the
// package's own tsconfig.ci.json.

import { AbortController as OwnedAbortController, AbortSignal as OwnedAbortSignal, neverSignal } from '../src/abort';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace abortSignalCrossesBothWays {
  // a real DOM AbortSignal assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<AbortSignal, OwnedAbortSignal>;
  // the owned AbortSignal assigns back to DOM's
  // @ts-expect-no-error
  isAssignable<OwnedAbortSignal, AbortSignal>;
}

namespace abortControllerAssignsToOwned {
  // a real DOM AbortController assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<AbortController, OwnedAbortController>;
}

namespace neverSignalCrossesToReal {
  // the concrete neverSignal singleton is usable wherever a real AbortSignal is expected
  // @ts-expect-no-error
  isAssignable<typeof neverSignal, AbortSignal>;
}
