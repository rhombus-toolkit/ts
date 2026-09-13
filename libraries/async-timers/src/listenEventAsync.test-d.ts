import { InferEventType, listenEventAsync } from './index';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

// The event type comes off the target's matching `on<name>` handler, so a
// caller awaiting a WebSocket message gets a MessageEvent, not a bare Event.
namespace inferEventTypeReadsTheHandlerProperty {
  // @ts-expect-no-error
  isAssignable<InferEventType<WebSocket, 'message'>, MessageEvent>;
  // @ts-expect-no-error
  isAssignable<MessageEvent, InferEventType<WebSocket, 'message'>>;
  // @ts-expect-no-error
  isAssignable<InferEventType<AbortSignal, 'abort'>, Event>;
}

// A name with no `on<name>` handler on the target still resolves, to the plain Event floor.
namespace inferEventTypeFallsBackToEvent {
  // @ts-expect-no-error
  isAssignable<InferEventType<EventTarget, 'anything'>, Event>;
  // @ts-expect-no-error
  isAssignable<Event, InferEventType<EventTarget, 'anything'>>;
}

namespace listenEventAsyncResolvesTheInferredEvent {
  declare const socket: WebSocket;
  const message = listenEventAsync(socket, 'message');

  // @ts-expect-no-error
  isAssignable<typeof message, Promise<MessageEvent>>;
}

// `once` is the helper's own concern: the options type has no `once` member, so a caller cannot turn it off.
namespace optionsCannotOverrideOnce {
  declare const target: EventTarget;

  // @ts-expect-no-error
  listenEventAsync(target, 'ping', { capture: true });
  // @ts-expect-no-error
  listenEventAsync(target, 'ping', true);
  // @ts-expect-error
  listenEventAsync(target, 'ping', { once: false });
}
