import { Ctor } from '@rhombus-toolkit/types';

export function Singleton<T extends Ctor>(ctor: T): T {
  return class Singleton extends ctor {
    static #instance?: WeakRef<Singleton>;
    constructor(...args: any[]) {
      const value = Singleton.#instance?.deref();
      if (value) {
        return value;
      }
      super(...args);
      Singleton.#instance = new WeakRef(this);
    }
  };
}
