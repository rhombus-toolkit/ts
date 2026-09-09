import { Ctor } from '@rhombus-toolkit/types';

/**
 * Wraps `ctor` so every `new` returns the same cached instance, keyed per `new.target`
 * so a subclass gets an instance of its own.
 *
 * @remarks
 * Constructor arguments take effect only on the call that builds the instance; later
 * calls return the cached one and ignore what they were passed.
 *
 * @param weak Hold the instance weakly; a rebuild after collection re-runs the
 * constructor's side effects at an uncontrolled moment.
 */
export function Singleton<T extends Ctor>(ctor: T, weak = false): T {
  // `new.target` carries no type relationship to its own instances, so the cache
  // cannot be written in terms of `T`. The public signature below is what keeps
  // callers exact; this map is deliberately the one loose spot.
  const instances = new WeakMap<Ctor, object | WeakRef<object>>();

  const singleton = class extends ctor {
    constructor(...args: any[]) {
      const target = new.target as Ctor;
      const held = instances.get(target);
      const existing = held instanceof WeakRef ? held.deref() : held;

      if (existing) {
        return existing as InstanceType<T>;
      }

      super(...args);
      instances.set(target, weak ? new WeakRef(this) : this);
    }
  };

  // Without this every wrapped class reports `.name` as the wrapper's, so stack
  // traces and logs lose the identity the caller actually passed in.
  Object.defineProperty(singleton, 'name', { value: ctor.name, configurable: true });

  return singleton;
}
