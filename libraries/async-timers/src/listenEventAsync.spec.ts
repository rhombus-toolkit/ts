import { describe, expect, it, spyOn } from 'bun:test';
import { listenEventAsync } from './listenEventAsync';

/** Whether `promise` has settled by the time the microtasks already queued ahead of it have run. */
async function hasSettled(promise: Promise<unknown>): Promise<boolean> {
  let settled = false;
  promise.then(() => {
    settled = true;
  }, () => {
    settled = true;
  });
  await Promise.resolve();
  return settled;
}

describe('listenEventAsync', () => {
  it('resolves with the very event object that was dispatched', async () => {
    const target = new EventTarget();
    const promise = listenEventAsync(target, 'ping');
    const event = new Event('ping');

    target.dispatchEvent(event);

    expect(await promise).toBe(event);
  });

  it('stays pending until the named event is dispatched', async () => {
    const target = new EventTarget();
    const promise = listenEventAsync(target, 'ping');

    target.dispatchEvent(new Event('other'));

    expect(await hasSettled(promise)).toBe(false);
  });

  it('resolves with the first matching event and ignores later ones', async () => {
    const target = new EventTarget();
    const promise = listenEventAsync(target, 'ping');
    const first = new Event('ping');

    target.dispatchEvent(first);
    target.dispatchEvent(new Event('ping'));

    expect(await promise).toBe(first);
  });

  it('listens once, so the target holds no listener after the event', async () => {
    const target = new EventTarget();
    const added = spyOn(target, 'addEventListener');

    const promise = listenEventAsync(target, 'ping');
    target.dispatchEvent(new Event('ping'));
    await promise;

    expect(added).toHaveBeenCalledTimes(1);
    expect(added.mock.calls[0]![2]).toEqual({ once: true });
  });

  it('maps a boolean option onto capture', () => {
    const target = new EventTarget();
    const added = spyOn(target, 'addEventListener');

    listenEventAsync(target, 'ping', true);

    expect(added.mock.calls[0]![2]).toEqual({ capture: true, once: true });
  });

  it('forwards an options object with once forced on', () => {
    const target = new EventTarget();
    const added = spyOn(target, 'addEventListener');

    listenEventAsync(target, 'ping', { passive: true, once: false } as any);

    expect(added.mock.calls[0]![2]).toEqual({ passive: true, once: true });
  });

  it('resolves the abort event of an AbortSignal', async () => {
    const controller = new AbortController();
    const promise = listenEventAsync(controller.signal, 'abort');

    controller.abort();

    const event = await promise;
    expect(event.type).toBe('abort');
    expect(event.target).toBe(controller.signal);
  });

  it('works against a hand-rolled target that only implements addEventListener', async () => {
    const listeners: [string, EventListener, AddEventListenerOptions][] = [];
    const target = { addEventListener(name: string, listener: EventListener, options: AddEventListenerOptions) {
      listeners.push([name, listener, options]);
    } };
    const promise = listenEventAsync(target as unknown as EventTarget, 'ping');
    const event = new Event('ping');

    expect(listeners).toHaveLength(1);
    listeners[0]![1](event);

    expect(await promise).toBe(event);
  });

  it('serves two waiters on the same event independently', async () => {
    const target = new EventTarget();
    const first = listenEventAsync(target, 'ping');
    const second = listenEventAsync(target, 'ping');
    const event = new Event('ping');

    target.dispatchEvent(event);

    expect(await first).toBe(event);
    expect(await second).toBe(event);
  });
});
