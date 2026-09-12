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

  it('counts an object-valued field by identity', () => {
    const kept = intern({ inner: {} });
    const otherFreshInner = intern({ inner: {} });

    expect(otherFreshInner).not.toBe(kept);

    const sharedInner = {};
    const withShared = intern({ inner: sharedInner });
    const alsoWithShared = intern({ inner: sharedInner });

    expect(alsoWithShared).toBe(withShared);

    const first = intern({ x: 1 });
    const second = intern({ x: 1 });
    const withInterned = intern({ inner: first });
    const alsoWithInterned = intern({ inner: second });

    expect(alsoWithInterned).toBe(withInterned);
  });

  it('treats a function as its own instance', () => {
    const a = () => 1;
    const b = () => 2;

    expect(intern(a)).toBe(a);
    expect(intern(b)).toBe(b);
    expect(intern(a)).not.toBe(intern(b));
  });

  it('forgets an instance holding an object once that object is unreachable', async () => {
    const lost = Promise.withResolvers<void>();
    const registry = new FinalizationRegistry(() => lost.resolve());

    (() => {
      const dying = {};
      registry.register(dying, undefined);
      intern({ ref: dying });
    })();

    await new Promise((resolve) => setTimeout(resolve));
    Bun.gc(true);

    await Promise.race([lost.promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('the field value was not collected')), 500))]);
  });
});
