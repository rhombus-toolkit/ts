import { describe, expect, it } from 'bun:test';
import { KindaWeakMap } from './index';

function endJob(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('KindaWeakMap', () => {
  it('stores and retrieves values', () => {
    const m = new KindaWeakMap<string, { n: number; }>();
    const v = { n: 1 };
    m.set('k', v);

    expect(m.get('k')).toBe(v);
    expect(m.has('k')).toBe(true);
    expect(m.delete('k')).toBe(true);
    expect(m.get('k')).toBeUndefined();
  });

  it('overwriting a live value keeps the replacement when the old one is collected', async () => {
    const m = new KindaWeakMap<string, object>();
    m.set('k', { first: new Array(10000).fill(0) });
    const kept = { second: true };
    m.set('k', kept);

    await endJob();
    Bun.gc(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Without unregistering the old value in set(), its finalizer would have
    // evicted this live entry.
    expect(m.get('k')).toBe(kept);
  });

  it('a stale finalizer does not evict a key rebound during the collection window', async () => {
    const m = new KindaWeakMap<string, object>();
    m.set('k', { v: 1 });

    await endJob(); // end the job that created the WeakRef, clearing [[KeptAlive]]
    Bun.gc(true); // collect v1; its finalizer is queued but cannot run mid-job

    // Rebind inside the window. set() cannot unregister the dead value -- the
    // unregister token *was* the value -- so only the finalizer's liveness
    // check protects this entry.
    const v2 = { v: 2 };
    m.set('k', v2);

    await new Promise((resolve) => setTimeout(resolve, 50)); // let the stale finalizer fire

    expect(m.get('k')).toBe(v2);
  });

  it('values() admits undefined for entries collected but not yet finalized', async () => {
    const m = new KindaWeakMap<string, object>();
    m.set('k', { v: 1 });

    await endJob();
    Bun.gc(true);

    // Synchronous observation: the cleanup callback has not run, so the map
    // still holds the dead ref -- the window the V | undefined type admits.
    expect(m.has('k')).toBe(true);
    expect([...m.values()]).toEqual([undefined]);
  });

  it('clear() empties the map even across dead entries', async () => {
    const m = new KindaWeakMap<string, object>();
    m.set('gone', { v: 1 });
    const kept = { v: 2 };
    m.set('kept', kept);

    await endJob();
    Bun.gc(true);

    m.clear();
    expect(m.size).toBe(0);
    expect(m.get('kept')).toBeUndefined();
    expect(kept).toEqual({ v: 2 });
  });
});
