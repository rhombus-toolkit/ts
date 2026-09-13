import type { Func } from '@rhombus-toolkit/types';
import { describe, expect, it } from 'bun:test';
import { memo } from './memo';

describe('memo', () => {
  it('computes once per distinct key', () => {
    let calls = 0;
    const sizeOf = memo((key: { items: number[]; }) => {
      calls++;
      return key.items.length;
    });

    const a = { items: [1, 2, 3] };
    const b = { items: [1] };

    expect(sizeOf(a)).toBe(3);
    expect(sizeOf(a)).toBe(3);
    expect(sizeOf(b)).toBe(1);

    expect(calls).toBe(2);
  });

  it('passes the key to compute', () => {
    const seen: object[] = [];
    const record = memo((key: object) => {
      seen.push(key);
      return key;
    });

    const key = {};
    record(key);

    expect(seen).toEqual([key]);
  });

  it('treats a stored undefined as a hit rather than a miss', () => {
    let calls = 0;
    const nothing = memo((_key: object) => {
      calls++;
      return undefined;
    });

    const key = {};

    expect(nothing(key)).toBeUndefined();
    expect(nothing(key)).toBeUndefined();
    expect(calls).toBe(1);
  });

  it('stores nothing when compute throws, so the next ask recomputes', () => {
    let calls = 0;
    const failing = memo((_key: object) => {
      calls++;
      throw new Error('nope');
    });

    const key = {};

    expect(() => failing(key)).toThrow('nope');
    expect(() => failing(key)).toThrow('nope');
    expect(calls).toBe(2);
  });

  it('gives each memo its own cache', () => {
    const key = {};
    const first = memo((_key: object) => 1);
    const second = memo((_key: object) => 2);

    expect(first(key)).toBe(1);
    expect(second(key)).toBe(2);
  });

  it('computes once per distinct key tuple', () => {
    let calls = 0;
    const join = memo((left: { name: string; }, right: { name: string; }) => {
      calls++;
      return `${left.name}+${right.name}`;
    });

    const a = { name: 'a' };
    const b = { name: 'b' };

    expect(join(a, b)).toBe('a+b');
    expect(join(a, b)).toBe('a+b');
    expect(join(b, a)).toBe('b+a');
    expect(join(a, a)).toBe('a+a');

    expect(calls).toBe(3);
  });

  it('passes every key to compute in order', () => {
    const seen: object[][] = [];
    const record = memo((first: object, second: object, third: object) => {
      seen.push([first, second, third]);
    });

    const x = {};
    const y = {};
    const z = {};
    record(x, y, z);

    expect(seen).toEqual([[x, y, z]]);
  });

  it('stores nothing under a key tuple whose compute throws', () => {
    let calls = 0;
    const failing = memo((_first: object, _second: object) => {
      calls++;
      throw new Error('nope');
    });

    const first = {};
    const second = {};

    expect(() => failing(first, second)).toThrow('nope');
    expect(() => failing(first, second)).toThrow('nope');
    expect(calls).toBe(2);
  });

  it('hands back the very object compute built', () => {
    const built = { built: true };
    const same = memo((_key: object) => built);

    expect(same({})).toBe(built);
  });

  it('runs compute unbound', () => {
    let seen: unknown = 'unset';
    const record = memo(function(this: unknown, _key: object) {
      seen = this;
    });

    record({});

    expect(seen).toBeUndefined();
  });

  it('ignores the this a caller binds the memoized function to', () => {
    let seen: unknown = 'unset';
    const record = memo(function(this: unknown, _key: object) {
      seen = this;
    });

    record.call({ bound: true }, {});

    expect(seen).toBeUndefined();
  });

  it('accepts a function as a key', () => {
    let calls = 0;
    const nameOf = memo((key: Func<[], void>) => {
      calls++;
      return key.name;
    });
    const key = function named() {};

    expect(nameOf(key)).toBe('named');
    expect(nameOf(key)).toBe('named');
    expect(calls).toBe(1);
  });

  it('accepts an unregistered symbol as a key', () => {
    let calls = 0;
    const describe = memo((key: symbol) => {
      calls++;
      return key.description;
    });
    const key = Symbol('unique');

    expect(describe(key)).toBe('unique');
    expect(describe(key)).toBe('unique');
    expect(calls).toBe(1);
  });

  it('accepts a registered symbol as a key', () => {
    let calls = 0;
    const describe = memo((key: symbol) => {
      calls++;
      return key.description;
    });

    expect(describe(Symbol.for('registered'))).toBe('registered');
    expect(describe(Symbol.for('registered'))).toBe('registered');
    expect(calls).toBe(1);
  });

  it('caches a function compute answers with, calling it for nobody', () => {
    let innerCalls = 0;
    const handlerFor = memo((_key: object) => () => ++innerCalls);
    const key = {};

    expect(handlerFor(key)).toBe(handlerFor(key));
    expect(innerCalls).toBe(0);
  });

  it('remembers a stored undefined under a key tuple', () => {
    let calls = 0;
    const nothing = memo((_first: object, _second: object) => {
      calls++;
      return undefined;
    });
    const first = {};
    const second = {};

    expect(nothing(first, second)).toBeUndefined();
    expect(nothing(first, second)).toBeUndefined();
    expect(calls).toBe(1);
  });

  it('remembers each tuple sharing a prefix on its own', () => {
    let calls = 0;
    const join = memo((left: { name: string; }, right: { name: string; }) => {
      calls++;
      return `${left.name}+${right.name}`;
    });
    const a = { name: 'a' };
    const b = { name: 'b' };
    const c = { name: 'c' };

    expect(join(a, b)).toBe('a+b');
    expect(join(a, c)).toBe('a+c');
    expect(join(a, b)).toBe('a+b');
    expect(join(a, c)).toBe('a+c');
    expect(calls).toBe(2);
  });

  it('recomputes a tuple that threw without forgetting its siblings', () => {
    let calls = 0;
    const join = memo((left: { fails?: boolean; }, right: { fails?: boolean; }) => {
      calls++;
      if (right.fails) {
        throw new Error('nope');
      }
      return calls;
    });
    const a = {};
    const ok = {};
    const bad = { fails: true };

    expect(join(a, ok)).toBe(1);
    expect(() => join(a, bad)).toThrow('nope');
    expect(join(a, ok)).toBe(1);
    expect(() => join(a, bad)).toThrow('nope');
    expect(calls).toBe(3);
  });

  it('lets compute ask the memo for another key on the way to its own answer', () => {
    let calls = 0;
    const depth: Func<[Node], number> = memo((node: Node) => {
      calls++;
      return node.parent ? depth(node.parent) + 1 : 0;
    });
    const root: Node = {};
    const child: Node = { parent: root };
    const grandchild: Node = { parent: child };

    expect(depth(grandchild)).toBe(2);
    expect(depth(child)).toBe(1);
    expect(calls).toBe(3);
  });

  it('remembers a promise, settled or not, as the answer', async () => {
    let calls = 0;
    const load = memo(async (_key: object) => {
      calls++;
      throw new Error('rejected');
    });
    const key = {};

    const first = load(key);
    await expect(first).rejects.toThrow('rejected');
    expect(load(key)).toBe(first);
    expect(calls).toBe(1);
  });

  it('forgets an answer along with its key once nothing else holds the key', async () => {
    let collected = false;
    const registry = new FinalizationRegistry(() => {
      collected = true;
    });
    const held = memo((_key: object) => new Array(10000).fill(0));

    (() => {
      const key = {};
      registry.register(key, undefined);
      held(key);
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

  it('computes once per distinct tuple selectKeys picks', () => {
    let calls = 0;
    const idOf = memo((person: { id: number; }) => {
      calls++;
      return person.id;
    }, (person) => [person.id]);

    expect(idOf({ id: 1 })).toBe(1);
    expect(idOf({ id: 1 })).toBe(1);
    expect(calls).toBe(1);
  });

  it('passes the arguments to compute, not the picked keys', () => {
    const seen: Array<{ id: number; }> = [];
    const record = memo((person: { id: number; }) => {
      seen.push(person);
      return person.id;
    }, (person) => [person.id]);

    const person = { id: 1 };
    record(person);

    expect(seen).toEqual([person]);
  });

  it('holds an answer under a picked primitive key', () => {
    let calls = 0;
    const square = memo((n: number) => {
      calls++;
      return n * n;
    }, (n) => [n]);

    expect(square(3)).toBe(9);
    expect(square(3)).toBe(9);
    expect(calls).toBe(1);
  });
});

interface Node {
  readonly parent?: Node;
}
