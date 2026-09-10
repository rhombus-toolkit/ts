import { describe, expect, it } from 'bun:test';
import { AbortController, neverSignal } from './abort';

describe('AbortController', () => {
  it('is the platform AbortController', () => {
    expect(AbortController).toBe(globalThis.AbortController);
  });

  it('constructs a controller whose signal aborts with the given reason', () => {
    const controller = new AbortController();
    const reason = new Error('stop');

    controller.abort(reason);

    expect(controller.signal.aborted).toBe(true);
    expect(controller.signal.reason).toBe(reason);
    expect(() => controller.signal.throwIfAborted()).toThrow(reason);
  });

  it('notifies an abort listener once', () => {
    const controller = new AbortController();
    let calls = 0;
    controller.signal.addEventListener('abort', () => calls++);

    controller.abort();
    controller.abort();

    expect(calls).toBe(1);
  });
});

describe('neverSignal', () => {
  it('is not aborted and has no reason', () => {
    expect(neverSignal.aborted).toBe(false);
    expect(neverSignal.reason).toBeUndefined();
  });

  it('never throws from throwIfAborted', () => {
    expect(() => neverSignal.throwIfAborted()).not.toThrow();
  });

  it('never invokes an abort listener, even when an abort event is dispatched at it', () => {
    let calls = 0;
    const listener = () => calls++;
    neverSignal.addEventListener('abort', listener);

    const dispatched = neverSignal.dispatchEvent(new Event('abort'));
    neverSignal.removeEventListener('abort', listener);

    expect(dispatched).toBe(false);
    expect(calls).toBe(0);
  });
});
