// Owned `ProgressEvent` typing (like ./Event.ts), plus the one runtime fallback
// this package carries: node and bun define `Event` but not `ProgressEvent`,
// and the missing piece is three data fields on an `Event` -- nothing to
// schedule or emulate, unlike the `setImmediate` ./ImmediateHandle.ts declines
// to fill in.

import { Ctor } from '@rhombus-toolkit/types';
import { Event, EventInit } from './Event';

export interface ProgressEventInit extends EventInit {
  lengthComputable?: boolean;
  loaded?: number;
  total?: number;
}

/** Structural counterpart of the platform `ProgressEvent`. */
export interface ProgressEvent extends Event {
  readonly lengthComputable: boolean;
  readonly loaded: number;
  readonly total: number;
}

/** Constructor shape for {@link ProgressEvent}, matching the platform global's static side. */
export type ProgressEventConstructor = Ctor<[type: string, init?: ProgressEventInit], ProgressEvent>;

/** The platform `ProgressEvent`, or an `Event` subclass carrying its three fields where the host (node/bun) has none. */
export const ProgressEvent: ProgressEventConstructor =
  (globalThis as unknown as { ProgressEvent?: ProgressEventConstructor; }).ProgressEvent
    ?? class ProgressEvent extends Event {
      readonly lengthComputable: boolean;
      readonly loaded: number;
      readonly total: number;
      constructor(type: string, init: ProgressEventInit = {}) {
        super(type, init);
        this.lengthComputable = init.lengthComputable ?? false;
        this.loaded = init.loaded ?? 0;
        this.total = init.total ?? 0;
      }
    };
