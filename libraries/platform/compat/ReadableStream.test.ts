// Assignability probe proving the owned ReadableStream<R> doesn't conflict
// with the real lib.dom ReadableStream<R>. Compiled by ../tsconfig.compat.json
// (lib: ["ES2022", "DOM"]), never by the package's own tsconfig.ci.json.

import type { ReadableStream as OwnedReadableStream } from '../src/ReadableStream';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace readableStreamAssignsToOwned {
  // a real DOM ReadableStream<R> assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<ReadableStream<Uint8Array>, OwnedReadableStream<Uint8Array>>;
}
