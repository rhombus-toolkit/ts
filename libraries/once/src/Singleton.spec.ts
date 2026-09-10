import { describe, expect, it } from 'bun:test';
import { Singleton } from './Singleton';

class Animal {
  constructor(public name = 'animal') {}
}

describe('Singleton', () => {
  it('returns the same instance for every construction', () => {
    const S = Singleton(Animal);

    expect(new S()).toBe(new S());
  });

  it('runs the wrapped constructor exactly once', () => {
    let calls = 0;
    const S = Singleton(class {
      constructor() {
        calls++;
      }
    });

    new S();
    new S();

    expect(calls).toBe(1);
  });

  it('keeps the instance an instanceof both the wrapper and the wrapped class', () => {
    const S = Singleton(Animal);
    const instance = new S();

    expect(instance).toBeInstanceOf(S);
    expect(instance).toBeInstanceOf(Animal);
  });

  it('gives each wrapping its own instance', () => {
    expect(new (Singleton(Animal))()).not.toBe(new (Singleton(Animal))());
  });

  it('gives a subclass its own instance instead of overwriting the base cache', () => {
    const S = Singleton(Animal);
    class Dog extends S {
      bark() {
        return 'woof';
      }
    }

    const dog = new Dog('rex');
    const base = new S('base');

    expect(base).not.toBe(dog);
    expect(base).not.toBeInstanceOf(Dog);
    expect(new Dog()).toBe(dog);
  });

  it('preserves the wrapped class name', () => {
    expect(Singleton(Animal).name).toBe('Animal');
    expect(new (Singleton(Animal))().constructor.name).toBe('Animal');
  });

  it('honours constructor arguments on the building call and discards them after', () => {
    const S = Singleton(Animal);

    expect(new S('alpha').name).toBe('alpha');
    expect(new S('beta').name).toBe('alpha');
  });

  it('returns the same instance while reachable when held weakly', () => {
    const S = Singleton(Animal, true);
    const first = new S();

    expect(new S()).toBe(first);
  });

  it('caches nothing when the wrapped constructor throws, so the next new runs it again', () => {
    let calls = 0;
    const S = Singleton(class {
      constructor() {
        calls++;
        if (calls === 1) {
          throw new Error('first time fails');
        }
      }
    });

    expect(() => new S()).toThrow('first time fails');
    const built = new S();

    expect(new S()).toBe(built);
    expect(calls).toBe(2);
  });

  it('keeps the wrapped class as the wrapper prototype, statics included', () => {
    class Counted {
      static created = 0;
      static describe() {
        return 'counted';
      }
    }
    const S = Singleton(Counted);

    expect(Object.getPrototypeOf(S)).toBe(Counted);
    expect(S.created).toBe(0);
    expect(S.describe()).toBe('counted');
  });

  it('leaves the wrapped class usable on its own', () => {
    const S = Singleton(Animal);
    const single = new S('single');

    expect(new Animal('plain')).not.toBe(single);
    expect(new Animal('plain').name).toBe('plain');
    expect(new S('ignored')).toBe(single);
  });

  it('builds the instance with this bound to it, methods reachable from the wrapper', () => {
    class Greeter {
      greeting: string;
      constructor(who: string) {
        this.greeting = `hello ${who}`;
      }
      greet() {
        return this.greeting;
      }
    }
    const S = Singleton(Greeter);

    expect(new S('world').greet()).toBe('hello world');
    expect(new S('nobody').greet()).toBe('hello world');
  });

  it('gives each subclass of the wrapper its own instance', () => {
    const S = Singleton(Animal);
    class Dog extends S {}
    class Cat extends S {}

    const dog = new Dog('rex');
    const cat = new Cat('tom');

    expect(dog).not.toBe(cat);
    expect(new Dog()).toBe(dog);
    expect(new Cat()).toBe(cat);
    expect(new S()).not.toBe(dog);
    expect(new S()).not.toBe(cat);
  });

  it('runs a subclass constructor on every new even though the wrapped one runs once', () => {
    let wrapped = 0;
    let sub = 0;
    const S = Singleton(class {
      constructor() {
        wrapped++;
      }
    });
    class Sub extends S {
      constructor() {
        super();
        sub++;
      }
    }

    new Sub();
    new Sub();

    expect(wrapped).toBe(1);
    expect(sub).toBe(2);
  });

  it('keeps a strongly held instance across a collection', async () => {
    const S = Singleton(Animal);
    const first = new S('first');

    await endJob();
    Bun.gc(true);

    expect(new S('second')).toBe(first);
    expect(new S().name).toBe('first');
  });

  it('rebuilds a weakly held instance once nothing else holds it', async () => {
    let calls = 0;
    const S = Singleton(class {
      constructor() {
        calls++;
      }
    }, true);

    new S();
    await endJob();
    Bun.gc(true);
    new S();

    expect(calls).toBe(2);
  });

  it('keeps a weakly held instance while something holds it', async () => {
    let calls = 0;
    const S = Singleton(class {
      constructor() {
        calls++;
      }
    }, true);
    const held = new S();

    await endJob();
    Bun.gc(true);

    expect(new S()).toBe(held);
    expect(calls).toBe(1);
  });
});

function endJob(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}
