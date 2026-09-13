import { describe, expect, it } from 'bun:test';
import { intern } from './intern';

describe('intern', () => {
  it('interns the same object to itself', () => {
    const value = { a: 1 };

    expect(intern(value)).toBe(value);
  });

  it('interns two structurally equal plain objects to the first one passed', () => {
    const first = { a: 1, b: 2 };
    const second = { a: 1, b: 2 };

    expect(intern(first)).toBe(first);
    expect(intern(second)).toBe(first);
  });

  it('keeps objects with different field values apart', () => {
    const a = intern({ a: 1 });
    const b = intern({ a: 2 });

    expect(a).not.toBe(b);
  });

  it('interns the same fields together regardless of order', () => {
    const first = intern({ a: 1, b: 2 });
    const second = intern({ b: 2, a: 1 });

    expect(second).toBe(first);
  });

  it('keeps the same values under different field names apart', () => {
    const a = intern({ a: 1 });
    const b = intern({ b: 1 });

    expect(a).not.toBe(b);
  });

  it('keeps a plain object and a class instance with the same fields apart', () => {
    class Point {
      x = 1;
      y = 2;
    }
    const plain = intern({ x: 1, y: 2 });
    const instance = intern(new Point());

    expect(plain).not.toBe(instance);
  });

  it('interns two instances of one class with the same fields together', () => {
    class Point {
      constructor(public x: number, public y: number) {}
    }
    const first = intern(new Point(1, 2));
    const second = intern(new Point(1, 2));

    expect(second).toBe(first);
  });

  it('interns a null-prototype object', () => {
    const value = Object.assign(Object.create(null), { a: 1 }) as { a: number; };

    expect(intern(value)).toBe(value);
    expect(intern(Object.assign(Object.create(null), { a: 1 }))).toBe(value);
  });

  it('interns an array', () => {
    const first = intern([1, 2]);
    const second = intern([1, 2]);

    expect(second).toBe(first);
  });

  it('interns the empty object to one instance', () => {
    const first = intern({});
    const second = intern({});

    expect(second).toBe(first);
  });

  it('does not re-key the kept instance when it is changed after interning', () => {
    class Custom {}

    const kept = intern({ a: 1 });
    Object.setPrototypeOf(kept, Custom.prototype);
    (kept as { a: number; b?: number; }).b = 2;

    const fresh = intern({ a: 1 });

    expect(fresh).toBe(kept);
  });

  it('counts an object-valued field by identity', () => {
    // A plain inner value would be descended into by structure rather than counted by
    // identity, so this uses a class instance -- a non-plain value stays identity-keyed.
    class Thing {}

    const kept = intern({ inner: new Thing() });
    const otherFreshInner = intern({ inner: new Thing() });

    expect(otherFreshInner).not.toBe(kept);

    const sharedInner = new Thing();
    const withShared = intern({ inner: sharedInner });
    const alsoWithShared = intern({ inner: sharedInner });

    expect(alsoWithShared).toBe(withShared);

    const first = intern(new Thing());
    const second = intern(new Thing());
    const withInterned = intern({ inner: first });
    const alsoWithInterned = intern({ inner: second });

    expect(alsoWithInterned).toBe(withInterned);
  });

  it('interns nested plain objects by structure', () => {
    const first = intern({ p: { x: 1 } });
    const second = intern({ p: { x: 1 } });

    expect(second).toBe(first);
  });

  it('interns nested arrays by structure', () => {
    const first = intern({ items: [1, 2] });
    const second = intern({ items: [1, 2] });

    expect(second).toBe(first);
  });

  it('keeps two objects with the same fields at different nesting depths apart', () => {
    const shallow = intern({ a: { b: 1 }, c: 2 });
    const nested = intern({ a: { b: 1, c: 2 } });

    expect(shallow).not.toBe(nested);
  });

  it('counts a nested class instance by identity', () => {
    class Thing {
      x = 1;
    }

    const a = intern({ inner: new Thing() });
    const b = intern({ inner: new Thing() });

    expect(a).not.toBe(b);

    const shared = new Thing();
    const withShared = intern({ inner: shared });
    const alsoWithShared = intern({ inner: shared });

    expect(alsoWithShared).toBe(withShared);
  });

  it('matches a nested array of class instances element by element by identity', () => {
    class Thing {}

    const shared = new Thing();
    const first = intern({ items: [shared, new Thing()] });
    const second = intern({ items: [shared, new Thing()] });

    expect(second).not.toBe(first);

    const third = intern({ items: [shared] });
    const fourth = intern({ items: [shared] });

    expect(fourth).toBe(third);
  });

  it('counts a nested Date by identity', () => {
    const a = intern({ when: new Date(2020, 0, 1) });
    const b = intern({ when: new Date(2020, 0, 1) });

    expect(a).not.toBe(b);
  });

  it('throws when a value reaches itself through plain containers', () => {
    const cyclic: { self?: unknown; } = {};
    cyclic.self = cyclic;

    expect(() => intern(cyclic)).toThrow(TypeError);
  });

  it('does not treat the same inner object reached from two fields as a cycle', () => {
    const shared = { x: 1 };

    expect(() => intern({ a: shared, b: shared })).not.toThrow();
  });

  it('treats a function as its own instance', () => {
    const a = () => 1;
    const b = () => 2;

    expect(intern(a)).toBe(a);
    expect(intern(b)).toBe(b);
    expect(intern(a)).not.toBe(intern(b));
  });

  it('discards an instance holding an object once that object is unreachable', async () => {
    // A plain dying value would be descended into and described entirely by primitives, leaving
    // nothing weakly held anywhere on its path -- so this uses a class instance, held by identity.
    class Thing {}

    let collected = false;
    const registry = new FinalizationRegistry(() => {
      collected = true;
    });

    (() => {
      const dying = new Thing();
      registry.register(dying, undefined);
      intern({ ref: dying });
    })();

    // A single Bun.gc(true) can miss an object a stale native-stack reference still holds
    // (the collector scans the stack conservatively), so keep collecting until it lets go.
    const deadline = Date.now() + 2000;
    while (!collected && Date.now() < deadline) {
      Bun.gc(true);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    expect(collected).toBe(true);
  });
});
