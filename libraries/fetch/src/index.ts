export interface FetchEventMap {
  progress: ProgressEvent;
  complete: ProgressEvent;
}
export interface ProgressEventTarget extends EventTarget {
  addEventListener<K extends keyof FetchEventMap>(type: K,
    listener: (this: ProgressEventTarget, ev: FetchEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof FetchEventMap>(type: K,
    listener: (this: ProgressEventTarget, ev: FetchEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions): void;
}
export function wrapResponse(response: Response) {
  if (!response.body) {
    throw Error('ReadableStream not yet supported in this browser.');
  }

  if (!response.ok) {
    throw Error(response.status + ' ' + response.statusText);
  }

  // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
  // server must send custom x-file-size header if gzip or other content-encoding is used
  const contentEncoding = response.headers.get('content-encoding');
  const contentLength = response.headers.get(contentEncoding ? 'x-file-size' : 'content-length');
  if (contentLength === null) {
    // don't evaluate download progress if we can't compare against a total size
    throw Error('Response size header unavailable');
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const lengthComputable = !!total;

  const emitter: ProgressEventTarget = new EventTarget();
  function progress(amount: number) {
    loaded += amount;
    emitter.dispatchEvent(new ProgressEvent('progress', { lengthComputable, loaded, total }));
  }
  function complete() {
    progress(total - loaded);
    emitter.dispatchEvent(new ProgressEvent('complete', { lengthComputable, loaded, total }));
  }
  const reader = response.body!.getReader();
  let cancelled = false;

  const stream = new ReadableStream({ async start(controller) {
    if (cancelled) {
      controller.close();
      return;
    }
    // void async function pushit() {
    try {
      while (true) { // eslint-disable-line no-constant-condition
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }
        progress(value!.byteLength);
        controller.enqueue(value);
      }
      complete();
    } catch (error) {
      controller.error(error);
    }
    // }();
  } });
  // Object.assign onto a fresh Response rather than mutating the stock type in
  // place -- the mutation only type-checked because of the `declare global`
  // Response augmentation below, which is parked. This builds the same
  // progress/cancel surface as a local intersection instead.
  return Object.assign(new Response(stream, response), { progress: emitter, cancel: () => {
    cancelled = true;
    emitter.dispatchEvent(new ProgressEvent('cancelled', { lengthComputable, loaded, total }));
    return reader?.cancel() ?? Promise.resolve();
  } });
  // return obj.assignDeep(new Response(stream, response), emitter);
}

// PARKED, not deleted (owner-approved): both the ambient `Response`
// augmentation and the `globalThis.fetch` monkey-patch below reach outside
// this module's own exports to rewrite a global. wrapResponse/nativeFetch
// are the intended public surface -- restoring this pair would silently
// change every consumer's `fetch` again, so don't restore it by
// pattern-matching on the surrounding code.
// declare global {
//   interface Response /*extends ProgressEventTarget*/ {
//     progress: ProgressEventTarget;
//     cancel(): Promise<void>;
//   }
// }
export const nativeFetch = globalThis.fetch;
// `as typeof fetch`: newer lib.dom.d.ts adds static members to the `fetch`
// function type (e.g. `preconnect`) that this wrapper doesn't implement --
// this cast preserves the prior (pre-toolchain-swap) compile behavior without
// reshaping the monkey-patch.
// globalThis.fetch = function(this: typeof globalThis, ...args: Parameters<typeof fetch>) {
//   return nativeFetch.apply(this, args).then(wrapResponse);
// } as typeof fetch;
