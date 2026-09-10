import { describe, expect, it } from 'bun:test';
import { clearImmediate, setImmediate } from './ImmediateHandle';

describe('setImmediate', () => {
  it('is the platform setImmediate', () => {
    expect(setImmediate).toBe(globalThis.setImmediate);
  });

  it('runs the callback with the trailing arguments after the current turn', async () => {
    const seen: string[] = [];
    const ran = new Promise<void>((resolve) => {
      setImmediate((a: string, b: string) => {
        seen.push(a, b);
        resolve();
      }, 'a', 'b');
    });
    seen.push('sync');

    await ran;

    expect(seen).toEqual(['sync', 'a', 'b']);
  });
});

describe('clearImmediate', () => {
  it('is the platform clearImmediate', () => {
    expect(clearImmediate).toBe(globalThis.clearImmediate);
  });

  it('stops a scheduled callback from running', async () => {
    let ran = false;
    const handle = setImmediate(() => {
      ran = true;
    });

    clearImmediate(handle);
    await new Promise<void>((resolve) => setImmediate(resolve));

    expect(ran).toBe(false);
  });
});
