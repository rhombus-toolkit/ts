// Assignability probes proving the owned opaque TimeoutHandle round-trips a
// real platform handle regardless of shape -- a DOM browser handle (number)
// and a Node-shaped handle (an object with ref/unref, structurally, since
// @types/node itself is out of scope for this program). Compiled by
// ../tsconfig.compat.json (lib: ["ES2022", "DOM"]), never by the package's
// own tsconfig.ci.json.

import type { TimeoutHandle } from '../src/TimeoutHandle';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace browserHandleRoundTrips {
  // the DOM setTimeout/clearTimeout handle shape (a number) crosses into the opaque owned type
  // @ts-expect-no-error
  isAssignable<number, TimeoutHandle>;
}

namespace nodeShapedHandleRoundTrips {
  interface NodeTimeoutLike {
    ref(): this;
    unref(): this;
  }
  // Node's non-number Timeout handle also crosses into the opaque owned type
  // @ts-expect-no-error
  isAssignable<NodeTimeoutLike, TimeoutHandle>;
}
