import { describe, expect, it, spyOn } from 'bun:test';
import { setTimeoutAsync } from './setTimeoutAsync';

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

describe('setTimeoutAsync', () => {
  describe('the resolved value', () => {
    it('resolves undefined when given no value', async () => {
      expect(await setTimeoutAsync(0)).toBeUndefined();
    });

    it('resolves the single value as itself, not a one-tuple', async () => {
      expect(await setTimeoutAsync(0, 'a')).toBe('a');
    });

    it('resolves several values as a tuple, in order', async () => {
      expect(await setTimeoutAsync(0, 'a', 2, null)).toEqual(['a', 2, null]);
    });

    it('resolves undefined when given only a signal', async () => {
      expect(await setTimeoutAsync(0, new AbortController().signal)).toBeUndefined();
    });

    it('drops a leading signal from the resolved value', async () => {
      expect(await setTimeoutAsync(0, new AbortController().signal, 'a')).toBe('a');
      expect(await setTimeoutAsync(0, new AbortController().signal, 'a', 2)).toEqual(['a', 2]);
    });

    it('treats a signal anywhere but the leading position as a value', async () => {
      const { signal } = new AbortController();

      expect(await setTimeoutAsync(0, 'a', signal)).toEqual(['a', signal]);
    });

    it('treats a hand-rolled object shaped like a signal as a value', async () => {
      const lookalike = { aborted: false, reason: undefined, throwIfAborted() {}, addEventListener() {} };

      expect(await setTimeoutAsync(0, lookalike as any)).toBe(lookalike);
    });

    it('resolves a single array value as that array, by identity', async () => {
      const value = [1, 2];

      expect(await setTimeoutAsync(0, value)).toBe(value);
    });
  });

  describe('timing', () => {
    it('resolves after the timeout, behind a shorter timer queued later', async () => {
      const order: string[] = [];
      const slow = setTimeoutAsync(30).then(() => order.push('slow'));
      const fast = setTimeoutAsync(0).then(() => order.push('fast'));

      await Promise.all([slow, fast]);

      expect(order).toEqual(['fast', 'slow']);
    });

    it('is still pending once the microtasks queued ahead of it have run', async () => {
      expect(await hasSettled(setTimeoutAsync(0))).toBe(false);
    });

    /**
     * Bun's `setTimeout` carries no `__promisify__`, so the fast path that hands off to the
     * platform's own promisified timer is unreachable here and stays uncovered; this pins the
     * precondition so a runtime that grows one fails loudly instead of silently changing route.
     */
    it('has no platform __promisify__ fast path to take under Bun', () => {
      expect('__promisify__' in setTimeout).toBe(false);
    });
  });

  describe('abort', () => {
    it("rejects with the signal's reason when aborted before it fires", async () => {
      const controller = new AbortController();
      const promise = setTimeoutAsync(50, controller.signal, 'a');
      const reason = new Error('stop');

      controller.abort(reason);

      await expect(promise).rejects.toBe(reason);
    });

    it('rejects with an AbortError DOMException when aborted without a reason', async () => {
      const controller = new AbortController();
      const promise = setTimeoutAsync(50, controller.signal);

      controller.abort();

      const rejection = await promise.then(() => undefined, (error: unknown) => error);
      expect(rejection).toBeInstanceOf(DOMException);
      expect((rejection as DOMException).name).toBe('AbortError');
      expect(rejection).toBe(controller.signal.reason);
    });

    it('rejects an already-aborted signal before any timer could fire', async () => {
      const controller = new AbortController();
      controller.abort();
      const scheduled = spyOn(globalThis, 'setTimeout');

      try {
        const promise = setTimeoutAsync(0, controller.signal);

        expect(await hasSettled(promise)).toBe(true);
        await expect(promise).rejects.toBe(controller.signal.reason);
        expect(scheduled).not.toHaveBeenCalled();
      } finally {
        scheduled.mockRestore();
      }
    });

    it('clears the pending timer when aborted', async () => {
      const controller = new AbortController();
      const scheduled = spyOn(globalThis, 'setTimeout');
      const cleared = spyOn(globalThis, 'clearTimeout');

      try {
        const promise = setTimeoutAsync(50, controller.signal);
        controller.abort();

        await promise.catch(() => {});
        expect(cleared).toHaveBeenCalledWith(scheduled.mock.results[0]!.value);
      } finally {
        scheduled.mockRestore();
        cleared.mockRestore();
      }
    });

    it('removes its abort listener once the timer fires', async () => {
      const controller = new AbortController();
      const added = spyOn(controller.signal, 'addEventListener');
      const removed = spyOn(controller.signal, 'removeEventListener');

      await setTimeoutAsync(0, controller.signal);

      expect(added).toHaveBeenCalledTimes(1);
      expect(removed).toHaveBeenCalledTimes(1);
      expect(removed.mock.calls[0]![1]).toBe(added.mock.calls[0]![1]);
    });

    it('registers the abort listener as once-only', async () => {
      const controller = new AbortController();
      const added = spyOn(controller.signal, 'addEventListener');

      await setTimeoutAsync(0, controller.signal);

      expect(added.mock.calls[0]![2]).toEqual({ once: true });
    });

    it('stays resolved when the signal aborts after the timer fired', async () => {
      const controller = new AbortController();
      const promise = setTimeoutAsync(0, controller.signal, 'a');

      expect(await promise).toBe('a');
      controller.abort();
      await setTimeoutAsync(0);

      expect(await promise).toBe('a');
    });

    it('serves several waiters on one signal independently', async () => {
      const controller = new AbortController();
      const first = setTimeoutAsync(50, controller.signal, 1);
      const second = setTimeoutAsync(50, controller.signal, 2);

      controller.abort();

      await expect(first).rejects.toBe(controller.signal.reason);
      await expect(second).rejects.toBe(controller.signal.reason);
    });
  });
});
