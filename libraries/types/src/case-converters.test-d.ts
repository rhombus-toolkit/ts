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

/** The lowercase forms are not the constant form, and the separators are not interchangeable. */
namespace rejectionsTest {
  // @ts-expect-error
  isAssignable<CamelCase<'foo_bar'>, 'FooBar'>;
  // @ts-expect-error
  isAssignable<DashCase<'fooBar'>, 'foo_bar'>;
  // @ts-expect-error
  isAssignable<SnakeCase<'fooBar'>, 'foo-bar'>;
  // @ts-expect-error
  isAssignable<TitleCase<'fooBar'>, 'FooBar'>;
}

/** The empty string and a name with nothing to convert. */
namespace edgesTest {
  // @ts-expect-no-error
  isAssignable<ConstantCase<''>, ''>;
  // @ts-expect-no-error
  isAssignable<SnakeCase<''>, ''>;
  // @ts-expect-no-error
  isAssignable<PascalCase<''>, ''>;
  // @ts-expect-no-error
  isAssignable<CamelCase<''>, ''>;
  // @ts-expect-no-error
  isAssignable<TitleCase<''>, ''>;

  // @ts-expect-no-error
  isAssignable<CamelCase<'foo'>, 'foo'>;
  // @ts-expect-no-error
  isAssignable<PascalCase<'foo'>, 'Foo'>;
  // @ts-expect-no-error
  isAssignable<SnakeCase<'foo'>, 'foo'>;

  // a digit is neither a boundary nor a separator
  // @ts-expect-no-error
  isAssignable<PascalCase<'foo2bar'>, 'Foo2bar'>;
  // @ts-expect-no-error
  isAssignable<SnakeCase<'foo2Bar'>, 'foo2_bar'>;
}

/**
 * A run of three or more capitals does not stay one word: the boundary skip after each insert
 * reads the run in pairs, so `'ABCDef'` becomes `'A_BC_DEF'`.
 */
namespace capitalRunTest {
  // @ts-expect-error
  isAssignable<ConstantCase<'ABCDef'>, 'ABC_DEF' | 'ABCDEF'>; // TODO known-wrong: produces 'A_BC_DEF'
  // @ts-expect-no-error
  isAssignable<ConstantCase<'ABCDef'>, 'A_BC_DEF'>;
  // @ts-expect-error
  isAssignable<SnakeCase<'HTMLParser'>, 'html_parser' | 'htmlparser'>; // TODO known-wrong: produces 'h_tm_lparser'
  // a run of exactly two is the case the skip was written for
  // @ts-expect-no-error
  isAssignable<ConstantCase<'ProperID4Form'>, 'PROPER_ID4_FORM'>;
}
