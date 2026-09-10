// Owned `Event` typing (like ./abort.ts): `type` is precise, and every piece
// of DOM plumbing this repo never reads is loose (`any`) so an instance passes
// into a lib.dom `EventTarget.dispatchEvent` and a real DOM `Event` assigns
// back. The value export IS `globalThis.Event` -- native in Node >=15 / bun /
// deno / browsers.

import { Ctor } from '@rhombus-toolkit/types';

export interface EventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

/** Structural counterpart of the platform `Event`. */
export interface Event {
  readonly type: string;
  readonly bubbles: any; // loose from here down: plumbing we never touch
  cancelBubble: any;
  readonly cancelable: any;
  readonly composed: any;
  readonly currentTarget: any;
  readonly defaultPrevented: any;
  readonly eventPhase: any;
  readonly isTrusted: any;
  returnValue: any;
  readonly srcElement: any;
  readonly target: any;
  readonly timeStamp: any;
  composedPath(): any;
  initEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  readonly NONE: any;
  readonly CAPTURING_PHASE: any;
  readonly AT_TARGET: any;
  readonly BUBBLING_PHASE: any;
}

/** Constructor shape for {@link Event}, matching the platform global's static side. */
export type EventConstructor = Ctor<[type: string, init?: EventInit], Event>;

/** The platform `Event` constructor, re-typed against the owned structural interface. */
export const Event: EventConstructor = (globalThis as unknown as { Event: EventConstructor; }).Event;
