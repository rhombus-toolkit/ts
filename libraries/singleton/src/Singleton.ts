import { Ctor } from '@rhombus-toolkit/types';

/**
 * Wraps `ctor` so that every `new` hands back the same instance.
 *
 * The cache is keyed on `new.target`, so a subclass of the returned class gets an
 * instance of its own rather than sharing the base's slot. Each call to `Singleton`
 * mints a fresh wrapper with a fresh cache.
 *
 * Constructor arguments are honoured only on the call that actually builds the
 * instance; every later call returns the cached one and ignores what it was passed.
 *
 * @param weak Hold the instance weakly, so it can be collected once nothing else
 * refers to it. The next `new` then rebuilds it, re-running the constructor's side
 * effects at a moment nothing controls — which is why this is opt-in, suited to a
 * cache rather than to a genuine singleton.
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
