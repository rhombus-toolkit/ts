import { describe, expect, it, spyOn } from 'bun:test';
import { setImmediateAsync } from './setImmediateAsync';

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

describe('setImmediateAsync', () => {
  describe('the resolved value', () => {
    it('resolves undefined when given no value', async () => {
      expect(await setImmediateAsync()).toBeUndefined();
    });

    it('resolves the single value as itself, not a one-tuple', async () => {
      expect(await setImmediateAsync('a')).toBe('a');
    });

    it('resolves several values as a tuple, in order', async () => {
      expect(await setImmediateAsync('a', 2, null)).toEqual(['a', 2, null]);
    });

    it('resolves undefined when given only a signal', async () => {
      expect(await setImmediateAsync(new AbortController().signal)).toBeUndefined();
    });

    it('drops a leading signal from the resolved value', async () => {
      expect(await setImmediateAsync(new AbortController().signal, 'a')).toBe('a');
      expect(await setImmediateAsync(new AbortController().signal, 'a', 2)).toEqual(['a', 2]);
    });

    it('treats a signal anywhere but the leading position as a value', async () => {
      const { signal } = new AbortController();

      expect(await setImmediateAsync('a', signal)).toEqual(['a', signal]);
    });

    it('treats a hand-rolled object shaped like a signal as a value', async () => {
      const lookalike = { aborted: false, reason: undefined, throwIfAborted() {}, addEventListener() {} };

      expect(await setImmediateAsync(lookalike as any)).toBe(lookalike);
    });

    it('resolves a single array value as that array, by identity', async () => {
      const value = [1, 2];

      expect(await setImmediateAsync(value)).toBe(value);
    });
  });

  describe('timing', () => {
    it('is still pending once the microtasks queued ahead of it have run', async () => {
      expect(await hasSettled(setImmediateAsync())).toBe(false);
    });

    it('resolves ahead of a timer with a delay', async () => {
      const order: string[] = [];
      const timer = new Promise<void>(resolve => {
        setTimeout(() => {
          order.push('timer');
          resolve();
        }, 20);
      });
      const immediate = setImmediateAsync().then(() => order.push('immediate'));

      await Promise.all([timer, immediate]);

      expect(order).toEqual(['immediate', 'timer']);
    });

    it('resolves two waiters in the order they were scheduled', async () => {
      const order: number[] = [];
      const first = setImmediateAsync().then(() => order.push(1));
      const second = setImmediateAsync().then(() => order.push(2));

      await Promise.all([first, second]);

      expect(order).toEqual([1, 2]);
    });
  });

  describe('abort', () => {
    it("rejects with the signal's reason when aborted before it fires", async () => {
      const controller = new AbortController();
      const promise = setImmediateAsync(controller.signal, 'a');
      const reason = new Error('stop');

      controller.abort(reason);

      await expect(promise).rejects.toBe(reason);
    });

    it('rejects with an AbortError DOMException when aborted without a reason', async () => {
      const controller = new AbortController();
      const promise = setImmediateAsync(controller.signal);

      controller.abort();

      const rejection = await promise.then(() => undefined, (error: unknown) => error);
      expect(rejection).toBeInstanceOf(DOMException);
      expect((rejection as DOMException).name).toBe('AbortError');
      expect(rejection).toBe(controller.signal.reason);
    });

    it('rejects an already-aborted signal without registering a listener', async () => {
      const controller = new AbortController();
      controller.abort();
      const added = spyOn(controller.signal, 'addEventListener');
      const promise = setImmediateAsync(controller.signal);

      expect(await hasSettled(promise)).toBe(true);
      await expect(promise).rejects.toBe(controller.signal.reason);
      expect(added).not.toHaveBeenCalled();
    });

    it('removes its abort listener once the immediate fires', async () => {
      const controller = new AbortController();
      const added = spyOn(controller.signal, 'addEventListener');
      const removed = spyOn(controller.signal, 'removeEventListener');

      await setImmediateAsync(controller.signal);

      expect(added).toHaveBeenCalledTimes(1);
      expect(removed).toHaveBeenCalledTimes(1);
      expect(removed.mock.calls[0]![1]).toBe(added.mock.calls[0]![1]);
    });

    it('registers the abort listener as once-only', async () => {
      const controller = new AbortController();
      const added = spyOn(controller.signal, 'addEventListener');

      await setImmediateAsync(controller.signal);

      expect(added.mock.calls[0]![2]).toEqual({ once: true });
    });

    it('stays resolved when the signal aborts after the immediate fired', async () => {
      const controller = new AbortController();
      const promise = setImmediateAsync(controller.signal, 'a');

      expect(await promise).toBe('a');
      controller.abort();
      await setImmediateAsync();

      expect(await promise).toBe('a');
    });

    it('serves several waiters on one signal independently', async () => {
      const controller = new AbortController();
      const first = setImmediateAsync(controller.signal, 1);
      const second = setImmediateAsync(controller.signal, 2);

      controller.abort();

      await expect(first).rejects.toBe(controller.signal.reason);
      await expect(second).rejects.toBe(controller.signal.reason);
    });
  });
});
