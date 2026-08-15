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
});
