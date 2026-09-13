import { Brand, Flavor } from './Brand';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

namespace brandTest {
  type UserId = Brand<string, 'UserId'>;
  type OrderId = Brand<string, 'OrderId'>;

  // still usable anywhere the underlying type is wanted
  // @ts-expect-no-error
  isAssignable<UserId, string>;

  // a plain string is not a UserId
  // @ts-expect-error
  isAssignable<string, UserId>;
  // and neither is a brand of another scope
  // @ts-expect-error
  isAssignable<OrderId, UserId>;
}

/**
 * The `'⛔'` key is a marker, not a lock: the doc used to claim nothing outside
 * the declaring file could name it, which is false -- a string-literal computed
 * key is nameable anywhere.
 */
namespace brandIsForgeableTest {
  type UserId = Brand<string, 'UserId'>;

  // @ts-expect-no-error
  isAssignable<string & { readonly ['⛔']: 'UserId'; }, UserId>;
}

namespace flavorTest {
  type UserId = Flavor<string, 'UserId'>;
  type OrderId = Flavor<string, 'OrderId'>;

  // @ts-expect-no-error
  isAssignable<UserId, string>;
  // the marker is optional, so a plain string still lands
  // @ts-expect-no-error
  isAssignable<string, UserId>;

  // but two flavours of the same primitive stay apart
  // @ts-expect-error
  isAssignable<OrderId, UserId>;
}

/** A symbol scope works the same as a string one. */
namespace symbolScopeTest {
  declare const scope: unique symbol;
  type Id = Brand<number, typeof scope>;

  // @ts-expect-no-error
  isAssignable<Id, number>;
  // @ts-expect-error
  isAssignable<number, Id>;
  // @ts-expect-error
  isAssignable<Brand<number, 'other'>, Id>;
}

/** The brand is the stricter of the pair: it satisfies the flavor of its scope, not the reverse. */
namespace brandMeetsFlavorTest {
  // @ts-expect-no-error
  isAssignable<Brand<string, 'UserId'>, Flavor<string, 'UserId'>>;
  // @ts-expect-error
  isAssignable<Flavor<string, 'UserId'>, Brand<string, 'UserId'>>;
  // @ts-expect-error
  isAssignable<Brand<string, 'OrderId'>, Flavor<string, 'UserId'>>;
}

/** The scope must be a `string` or `symbol`, per `Brand`'s type parameter constraint. */
namespace scopeConstraintTest {
  // @ts-expect-error
  type Numeric = Brand<string, 1>;
  // @ts-expect-error
  type Wide = Flavor<string, object>;
}
