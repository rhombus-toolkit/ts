import { CamelCase, ConstantCase, DashCase, KebabCase, PascalCase, SnakeCase, TitleCase } from './case-converters';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;
declare function isAssignable<TExpected>(actual?: TExpected): void;

/**
 * The rename. This shipped as `SnakeCase` and always produced CONSTANT_CASE;
 * the probes are the ones that were inline in `case-converter/src/index.ts`.
 */
namespace constantCaseTest {
  // @ts-expect-no-error
  isAssignable<ConstantCase<'ProperID4Form'>, 'PROPER_ID4_FORM'>;
  // @ts-expect-no-error
  isAssignable<'PROPER_ID4_FORM', ConstantCase<'ProperID4Form'>>;
  // @ts-expect-no-error
  isAssignable<ConstantCase<'fooBar'>, 'FOO_BAR'>;
  // no boundary at all is a plain uppercase, not a no-op
  // @ts-expect-no-error
  isAssignable<ConstantCase<'alllower'>, 'ALLLOWER'>;
}

namespace snakeCaseTest {
  // @ts-expect-no-error
  isAssignable<SnakeCase<'fooBar'>, 'foo_bar'>;
  // @ts-expect-no-error
  isAssignable<SnakeCase<'ProperID4Form'>, 'proper_id4_form'>;

  // what the name used to mean
  // @ts-expect-error
  isAssignable<SnakeCase<'fooBar'>, 'FOO_BAR'>;
}

namespace dashCaseTest {
  // @ts-expect-no-error
  isAssignable<DashCase<'Pro5per1ID4Form'>, 'pro5per1-id4-form'>;
  // @ts-expect-no-error
  isAssignable<'pro5per1-id4-form', DashCase<'Pro5per1ID4Form'>>;
  // @ts-expect-no-error
  isAssignable<KebabCase<'fooBar'>, 'foo-bar'>;
}

namespace pascalAndCamelTest {
  // @ts-expect-no-error
  isAssignable<PascalCase<'foo_bar'>, 'FooBar'>;
  // @ts-expect-no-error
  isAssignable<PascalCase<'foo-bar'>, 'FooBar'>;
  // @ts-expect-no-error
  isAssignable<PascalCase<'fooBar'>, 'FooBar'>;
  // @ts-expect-no-error
  isAssignable<CamelCase<'foo_bar'>, 'fooBar'>;
  // @ts-expect-no-error
  isAssignable<CamelCase<'FooBar'>, 'fooBar'>;
}

namespace titleCaseTest {
  // @ts-expect-no-error
  isAssignable<TitleCase<'fooBar'>, 'Foo Bar'>;
  // @ts-expect-no-error
  isAssignable<TitleCase<'foo_bar-baz'>, 'Foo Bar Baz'>;
}
