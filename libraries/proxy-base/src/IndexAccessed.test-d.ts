import Default, { IndexAccessed, type Indexed } from './IndexAccessed';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

/** The doc's example: a string-valued indexer over two literal keys. */
class Env extends IndexAccessed<string, 'HOME' | 'PATH'> {
  protected override _getIndex(key: 'HOME' | 'PATH'): string {
    return key;
  }

  protected override _setIndex(_key: 'HOME' | 'PATH', value: string): string {
    return value;
  }

  realMethod(): number {
    return 1;
  }
}

// The base is abstract and both indexer hooks must be implemented.
namespace indexAccessedIsAbstractTest {
  // @ts-expect-error - abstract class
  new IndexAccessed<string>();

  // @ts-expect-error - _getIndex and _setIndex are abstract
  class Missing extends IndexAccessed<string> {}

  // @ts-expect-error - _setIndex is still abstract
  class ReadOnly extends IndexAccessed<string> {
    protected override _getIndex(): string {
      return '';
    }
  }
}

// The default export is the same class, not a structural copy.
namespace defaultExportIsTheClassTest {
  // @ts-expect-no-error
  isAssignable<typeof Default, typeof IndexAccessed>;
  // @ts-expect-no-error
  isAssignable<typeof IndexAccessed, typeof Default>;
}

// The hooks are typed by the class's Value and Key arguments.
namespace hookSignaturesFollowTheTypeArgumentsTest {
  class WrongValue extends IndexAccessed<string> {
    // @ts-expect-error - the indexer reads strings
    protected override _getIndex(): number {
      return 1;
    }

    // @ts-expect-error - the indexer writes strings
    protected override _setIndex(_key: PropertyKey, value: number): number {
      return value;
    }
  }

  class WrongKey extends IndexAccessed<string, 'HOME'> {
    // @ts-expect-error - 'PATH' is neither wider nor narrower than 'HOME'
    protected override _getIndex(key: 'PATH'): string {
      return key;
    }

    protected override _setIndex(_key: 'HOME', value: string): string {
      return value;
    }
  }

  // @ts-expect-no-error - a wider key parameter is accepted
  class WiderKey extends IndexAccessed<string, 'HOME'> {
    protected override _getIndex(key: PropertyKey): string {
      return String(key);
    }

    protected override _setIndex(_key: PropertyKey, value: string): string {
      return value;
    }
  }

  // @ts-expect-error - Key must be a PropertyKey
  class WrongKeyConstraint extends IndexAccessed<string, { not: 'a key'; }> {
    protected override _getIndex(): string {
      return '';
    }

    protected override _setIndex(_key: { not: 'a key'; }, value: string): string {
      return value;
    }
  }
}

// The hooks are protected: reachable from a subclass body, never from outside.
namespace hooksAreProtectedTest {
  const env = new Env();

  // @ts-expect-error - protected member
  env._getIndex('HOME');
  // @ts-expect-error - protected member
  env._setIndex('HOME', '/home');
}

// `Indexed` adds the Key -> Value surface while keeping the real members.
namespace indexedViewTest {
  const env = new Env() as Indexed<Env, string, 'HOME' | 'PATH'>;

  // @ts-expect-no-error
  isAssignable<typeof env.HOME, string>;
  // @ts-expect-no-error
  isAssignable<typeof env['PATH'], string>;
  // @ts-expect-no-error
  env.PATH = '/bin';
  // @ts-expect-no-error
  isAssignable<ReturnType<typeof env.realMethod>, number>;
  // @ts-expect-no-error
  isAssignable<typeof env, Env>;

  // @ts-expect-error - a key outside Key is not on the view
  env.SHELL;
  // @ts-expect-error - the indexer writes strings
  env.HOME = 1;

  if (env instanceof Env) {
    // @ts-expect-no-error
    isAssignable<typeof env, Indexed<Env, string, 'HOME' | 'PATH'>>;
  }
}

// Key defaults to PropertyKey, so the view admits any key.
namespace indexedDefaultsToEveryKeyTest {
  class Bag extends IndexAccessed<number> {
    protected override _getIndex(): number {
      return 0;
    }

    protected override _setIndex(_key: PropertyKey, value: number): number {
      return value;
    }
  }
  const bag = new Bag() as Indexed<Bag, number>;

  // @ts-expect-no-error
  isAssignable<typeof bag.anything, number>;
  // @ts-expect-no-error
  isAssignable<typeof bag[0], number>;
  // @ts-expect-no-error
  isAssignable<typeof bag[typeof Symbol.iterator], number>;
}

// The view's Value and Key must match the class's own, not merely any type.
namespace indexedMustMatchTheClassTest {
  // @ts-expect-error - Env indexes strings, not numbers
  type WrongValue = Indexed<Env, number, 'HOME' | 'PATH'>;
  // @ts-expect-error - Env indexes 'HOME' | 'PATH', not 'SHELL'
  type WrongKey = Indexed<Env, string, 'SHELL'>;
  // @ts-expect-no-error - a WIDER Key passes: method parameters are bivariant, so the
  // constraint cannot tell the class's 'HOME' | 'PATH' apart from the PropertyKey default
  type WiderKey = Indexed<Env, string>;
  // @ts-expect-error - only an IndexAccessed subclass can be viewed
  type NotIndexAccessed = Indexed<{ a: 1; }, string>;
}

// Excluding the class's own member names from Key must go through a separate
// members interface: naming the class itself in its own extends clause is TS2310.
namespace excludingOwnMembersFromKeyTest {
  type Keys = 'HOME' | 'PATH' | 'realMethod';

  interface EnvApi {
    realMethod(): number;
  }

  // @ts-expect-no-error
  class Fine extends IndexAccessed<string, Exclude<Keys, keyof EnvApi>> implements EnvApi {
    protected override _getIndex(key: 'HOME' | 'PATH'): string {
      return key;
    }

    protected override _setIndex(_key: 'HOME' | 'PATH', value: string): string {
      return value;
    }

    realMethod(): number {
      return 1;
    }
  }

  // @ts-expect-error - TS2310: the class references itself in its own base type
  class Recursive extends IndexAccessed<string, Exclude<Keys, keyof Recursive>> {
    protected override _getIndex(key: 'HOME' | 'PATH'): string {
      return key;
    }

    protected override _setIndex(_key: 'HOME' | 'PATH', value: string): string {
      return value;
    }

    realMethod(): number {
      return 1;
    }
  }
}
