import { describe, expect, it } from 'bun:test';
import { clearTimeout, setTimeout } from './TimeoutHandle';

describe('setTimeout', () => {
  it('is the platform setTimeout', () => {
    expect(setTimeout).toBe(globalThis.setTimeout);
  });

  it('runs the callback after the current turn, no sooner than the delay', async () => {
    const seen: string[] = [];
    const started = Date.now();
    const ran = new Promise<void>((resolve) => {
      setTimeout(() => {
        seen.push('later');
        resolve();
      }, 5);
    });
    seen.push('sync');

    await ran;

    expect(seen).toEqual(['sync', 'later']);
    expect(Date.now() - started).toBeGreaterThanOrEqual(4);
  });
});

describe('clearTimeout', () => {
  it('is the platform clearTimeout', () => {
    expect(clearTimeout).toBe(globalThis.clearTimeout);
  });

  it('stops a scheduled callback from running', async () => {
    let ran = false;
    const handle = setTimeout(() => {
      ran = true;
    }, 0);

    clearTimeout(handle);
    await new Promise<void>((resolve) => setTimeout(resolve, 5));

    expect(ran).toBe(false);
  });
});
