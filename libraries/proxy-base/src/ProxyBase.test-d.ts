import Default, { ProxyBase } from './ProxyBase';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

// The base is abstract: only a subclass can be constructed.
namespace proxyBaseCannotBeConstructedDirectlyTest {
  // @ts-expect-error - abstract class
  new ProxyBase();

  class Concrete extends ProxyBase {}
  // @ts-expect-no-error
  new Concrete();
}

// The default export is the same class, not a structural copy.
namespace defaultExportIsTheClassTest {
  // @ts-expect-no-error
  isAssignable<typeof Default, typeof ProxyBase>;
  // @ts-expect-no-error
  isAssignable<typeof ProxyBase, typeof Default>;
}

// Every hook is protected: reachable from a subclass body, never from outside.
namespace hooksAreProtectedTest {
  class Concrete extends ProxyBase {
    probe(): unknown {
      // @ts-expect-no-error
      return this._get('x', this);
    }
  }
  const instance = new Concrete();

  // @ts-expect-error - protected member
  instance._get('x', instance);
  // @ts-expect-error - protected member
  instance._set('x', 1, instance);
  // @ts-expect-error - protected member
  instance._has('x');
  // @ts-expect-error - protected member
  instance._deleteProperty('x');
  // @ts-expect-error - protected member
  instance._ownKeys();
  // @ts-expect-error - protected member
  instance._getOwnPropertyDescriptor('x');
  // @ts-expect-error - protected member
  instance._defineProperty('x', {});
  // @ts-expect-error - protected member
  instance._getPrototypeOf();
  // @ts-expect-error - protected member
  instance._setPrototypeOf(null);
  // @ts-expect-error - protected member
  instance._isExtensible();
  // @ts-expect-error - protected member
  instance._preventExtensions();
}

// An override may drop trailing parameters it does not use, but must keep the return type.
namespace overrideSignaturesTest {
  // @ts-expect-no-error
  class Narrower extends ProxyBase {
    protected override _get(property: PropertyKey): unknown {
      return property;
    }

    protected override _set(): boolean {
      return true;
    }

    protected override _ownKeys(): string[] {
      return [];
    }
  }

  class WrongReturn extends ProxyBase {
    // @ts-expect-error - the has hook answers a boolean
    protected override _has(): string {
      return 'yes';
    }
  }

  class NarrowerParameter extends ProxyBase {
    // @ts-expect-no-error - a NARROWER key passes: method parameters are bivariant
    protected override _deleteProperty(property: number): boolean {
      return !!property;
    }
  }

  class WrongParameter extends ProxyBase {
    // @ts-expect-error - an object is not a PropertyKey in either direction
    protected override _deleteProperty(property: { key: string; }): boolean {
      return !!property;
    }
  }
}
