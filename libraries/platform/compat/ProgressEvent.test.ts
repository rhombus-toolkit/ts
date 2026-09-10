// Assignability probes proving the owned Event.ts / ProgressEvent.ts types
// don't conflict with the real lib.dom globals when both are present in a
// consumer's program. Compiled by ../tsconfig.compat.json (lib: ["ES2022",
// "DOM"]), never by the package's own tsconfig.ci.json.

import { Event as OwnedEvent } from '../src/Event';
import { ProgressEvent as OwnedProgressEvent } from '../src/ProgressEvent';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

namespace eventCrossesBothWays {
  // a real DOM Event assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<Event, OwnedEvent>;
  // the owned Event assigns back to DOM's -- what lets it into EventTarget.dispatchEvent
  // @ts-expect-no-error
  isAssignable<OwnedEvent, Event>;
}

namespace progressEventCrossesBothWays {
  // a real DOM ProgressEvent assigns to the owned structural type
  // @ts-expect-no-error
  isAssignable<ProgressEvent, OwnedProgressEvent>;
  // the owned ProgressEvent assigns back to DOM's
  // @ts-expect-no-error
  isAssignable<OwnedProgressEvent, ProgressEvent>;
}
