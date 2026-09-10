// Assignability probes proving the owned Url doesn't conflict with the real
// lib.dom URL. Compiled by ../tsconfig.compat.json (lib: ["ES2022", "DOM"]),
// never by the package's own tsconfig.ci.json.

import type { Url as OwnedUrl, UrlConstructor } from '../src/Url';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace urlConstructorAssignsToOwned {
  // the real DOM constructor assigns to the owned constructor shape, which is how the value export is typed
  // @ts-expect-no-error
  isAssignable<typeof URL, UrlConstructor>;
}

namespace urlCrossesBothWays {
  // a real DOM URL assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<URL, OwnedUrl>;
  // the owned Url assigns back to DOM's
  // @ts-expect-no-error
  isAssignable<OwnedUrl, URL>;
}
