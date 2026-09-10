import { beforeAll, describe, expect, it } from 'bun:test';

const globals = globalThis as any;

/** The platform's own pair, captured before the shim runs so it can be put back for every other spec file. */
const platform = { setImmediate: globals.setImmediate, clearImmediate: globals.clearImmediate };

/** What the globals held right after the shim ran and before this file restored them. */
let afterImport: { setImmediate: unknown; clearImmediate: unknown; };

let shim: typeof import('./index');

// The shim is imported lazily so the capture above runs first, and the globals it deletes
// are put back the moment it has loaded: the specs below only need the exports.
beforeAll(async () => {
  shim = await import('./index');
  afterImport = { setImmediate: globals.setImmediate, clearImmediate: globals.clearImmediate };
  globals.setImmediate = platform.setImmediate;
  globals.clearImmediate = platform.clearImmediate;
});

describe('setImmediate', () => {
  it('runs the callback with the trailing arguments', async () => {
    const seen = await new Promise<unknown[]>(resolve => {
      shim.setImmediate((...args) => resolve(args), 'a', 2);
    });

    expect(seen).toEqual(['a', 2]);
  });

  it('runs the callback with no arguments when given none', async () => {
    const seen = await new Promise<unknown[]>(resolve => {
      shim.setImmediate((...args) => resolve(args));
    });

    expect(seen).toEqual([]);
  });

  it('runs after the microtasks already queued', async () => {
    const order: string[] = [];
    const ran = new Promise<void>(resolve => {
      shim.setImmediate(() => {
        order.push('immediate');
        resolve();
      });
    });
    Promise.resolve().then(() => order.push('microtask'));

    await ran;

    expect(order).toEqual(['microtask', 'immediate']);
  });

  it('runs callbacks in scheduling order', async () => {
    const order: number[] = [];
    const both = new Promise<void>(resolve => {
      shim.setImmediate(() => order.push(1));
      shim.setImmediate(() => {
        order.push(2);
        resolve();
      });
    });

    await both;

    expect(order).toEqual([1, 2]);
  });

  it('is exported as the default too', () => {
    expect(shim.default).toBe(shim.setImmediate);
  });

  it('is the platform setImmediate when the platform has one', () => {
    expect(shim.setImmediate).toBe(platform.setImmediate);
    expect(shim.clearImmediate).toBe(platform.clearImmediate);
  });

  it('deletes the pair from the global scope once captured', () => {
    expect(afterImport.setImmediate).toBeUndefined();
    expect(afterImport.clearImmediate).toBeUndefined();
  });
});

describe('clearImmediate', () => {
  it('stops a scheduled callback from running', async () => {
    const order: string[] = [];
    const handle = shim.setImmediate(() => order.push('cancelled'));
    const later = new Promise<void>(resolve => {
      shim.setImmediate(() => {
        order.push('kept');
        resolve();
      });
    });

    shim.clearImmediate(handle);
    await later;

    expect(order).toEqual(['kept']);
  });

  it('accepts a handle whose callback has already run', async () => {
    const handle = await new Promise<number>(resolve => {
      const scheduled = shim.setImmediate(() => resolve(scheduled));
    });

    expect(() => shim.clearImmediate(handle)).not.toThrow();
  });
});
