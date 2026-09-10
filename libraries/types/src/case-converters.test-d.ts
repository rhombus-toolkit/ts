import { FromAdaCase, FromBestGuessCase, FromCamelCase, FromCamelSnakeCase, FromCobolCase, FromConstantCase,
  FromDashCase, FromDotCase, FromDromedaryCase, FromHttpHeaderCase, FromHyphenCase, FromKebabCase, FromLispCase,
  FromLowerCamelCase, FromMacroCase, FromParamCase, FromPascalCase, FromPascalKebabCase, FromPascalSnakeCase,
  FromPathCase, FromPotholeCase, FromScreamingKebabCase, FromScreamingSnakeCase, FromSnakeCase, FromSpinalCase,
  FromStudlyCase, FromTrainCase, FromUpperCamelCase, FromUpperKebabCase, FromUpperSnakeCase, ToAdaCase, ToCamelCase,
  ToCamelSnakeCase, ToCobolCase, ToConstantCase, ToDashCase, ToDotCase, ToDromedaryCase, ToFlatCase, ToHttpHeaderCase,
  ToHyphenCase, ToKebabCase, ToLispCase, ToLowerCamelCase, ToMacroCase, ToParamCase, ToPascalCase, ToPascalKebabCase,
  ToPascalSnakeCase, ToPathCase, ToPotholeCase, ToScreamingKebabCase, ToScreamingSnakeCase, ToSnakeCase, ToSpinalCase,
  ToStudlyCase, ToTrainCase, ToUpperCamelCase, ToUpperFlatCase, ToUpperKebabCase, ToUpperSnakeCase,
  Words } from './case-converters';

declare function isAssignable<TActual extends TExpected, TExpected>(actual?: TActual, expected?: TExpected): void;

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
/** Equal in the assignable-both-ways sense; a probe reads `isExactly<Actual, Expected>()`, and an unequal pair demands an argument nobody can supply. */
declare function isExactly<TActual, TExpected>(...proof: Same<TActual, TExpected> extends true ? [] : [never]): void;

// #region the word tuple

/** Every parser produces `Words`, and every renderer consumes it; nothing else crosses the boundary. */
namespace wordsTest {
  // @ts-expect-no-error
  isAssignable<FromPascalCase<'FooBar'>, Words>;
  // @ts-expect-no-error
  isAssignable<FromSnakeCase<'foo_bar'>, Words>;
  // @ts-expect-no-error
  isAssignable<['foo', 'bar'], Words>;
  // a renderer takes Words, not a string
  // @ts-expect-error
  isAssignable<ToSnakeCase<'fooBar'>, string>;
}

// #endregion

// #region capital-boundary parsers

/** A capital that begins a lowercase run begins a word; casing is preserved in the tuple. */
namespace fromPascalCaseTest {
  // @ts-expect-no-error
  isExactly<FromPascalCase<'FooBar'>, ['Foo', 'Bar']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Foo'>, ['Foo']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<''>, []>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ProperIdForm'>, ['Proper', 'Id', 'Form']>();
}

/** A run of capitals before a lowercase letter: the last capital begins the next word, the rest chunk greedily by `N`. */
namespace acronymRunTest {
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ProperIDForm'>, ['Proper', 'ID', 'Form']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'IOStream'>, ['IO', 'Stream']>();
  // N defaults to 2, so a three-letter run is read greedily as two words
  // @ts-expect-no-error
  isExactly<FromPascalCase<'MVCThing'>, ['MV', 'C', 'Thing']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'MVCThing', 3>, ['MVC', 'Thing']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ABCDThing'>, ['AB', 'CD', 'Thing']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'HTMLButton', 4>, ['HTML', 'Button']>();
  // `number` is unbounded: the whole run is one word
  // @ts-expect-no-error
  isExactly<FromPascalCase<'HTMLButton', number>, ['HTML', 'Button']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'XMLHTTPRequest', number>, ['XMLHTTP', 'Request']>();
  // a run at the very end has no word to give its last capital to
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ParseXML', 3>, ['Parse', 'XML']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ParseXML'>, ['Parse', 'XM', 'L']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'AThing'>, ['A', 'Thing']>();
}

/**
 * Digits: (1) followed by a lowercase letter, they stay in the current word; (2) followed by a
 * capital that begins a lowercase word, they stay in the current word; (3) followed by an acronym
 * run and preceded by lowercase, they begin the next word with that run; (4) preceded by a
 * capital, they stay inside that acronym. They never count toward `N`.
 */
namespace digitRulesTest {
  // (1)
  // @ts-expect-no-error
  isExactly<FromPascalCase<'A11yTree'>, ['A11y', 'Tree']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'I18nProvider'>, ['I18n', 'Provider']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Mp3player'>, ['Mp3player']>();
  // (2)
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Int32Array'>, ['Int32', 'Array']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Uint8ClampedArray'>, ['Uint8', 'Clamped', 'Array']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Mp3Player'>, ['Mp3', 'Player']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Sha256Sum'>, ['Sha256', 'Sum']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Base64Encode'>, ['Base64', 'Encode']>();
  // (3)
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Vector3D'>, ['Vector', '3D']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Vector3DArray'>, ['Vector', '3D', 'Array']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Enable2FA'>, ['Enable', '2FA']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Point2D'>, ['Point', '2D']>();
  // (4)
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ProperID4Form'>, ['Proper', 'ID4', 'Form']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'P2PNode'>, ['P2P', 'Node']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'H2OSensor'>, ['H2O', 'Sensor']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'X509Certificate'>, ['X509', 'Certificate']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'ES2015Target'>, ['ES2015', 'Target']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'SHA256Sum', 3>, ['SHA256', 'Sum']>();
  // digits at the very end belong to the last word
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Utf8'>, ['Utf8']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'X86'>, ['X86']>();
  // @ts-expect-no-error
  isExactly<FromPascalCase<'Web3'>, ['Web3']>();
}

/** The first word is lowercase; everything after it follows the PascalCase rules. */
namespace fromCamelCaseTest {
  // @ts-expect-no-error
  isExactly<FromCamelCase<'fooBar'>, ['foo', 'Bar']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'foo'>, ['foo']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<''>, []>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'ioStream'>, ['io', 'Stream']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'userIDForm'>, ['user', 'ID', 'Form']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'parseXML', 3>, ['parse', 'XML']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'vector3D'>, ['vector', '3D']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'int32Array'>, ['int32', 'Array']>();
  // @ts-expect-no-error
  isExactly<FromCamelCase<'a11yTree'>, ['a11y', 'Tree']>();
}

// #endregion

// #region separator parsers

/** A separator parser splits on its separator and nothing else; casing is preserved, empties dropped. */
namespace separatorParsersTest {
  // @ts-expect-no-error
  isExactly<FromSnakeCase<'foo_bar'>, ['foo', 'bar']>();
  // @ts-expect-no-error
  isExactly<FromSnakeCase<'vector_3d'>, ['vector', '3d']>();
  // @ts-expect-no-error
  isExactly<FromSnakeCase<'a__b'>, ['a', 'b']>();
  // @ts-expect-no-error
  isExactly<FromSnakeCase<''>, []>();
  // @ts-expect-no-error
  isExactly<FromScreamingSnakeCase<'USER_ID'>, ['USER', 'ID']>();
  // @ts-expect-no-error
  isExactly<FromKebabCase<'sha-256-sum'>, ['sha', '256', 'sum']>();
  // @ts-expect-no-error
  isExactly<FromTrainCase<'Content-Type'>, ['Content', 'Type']>();
  // @ts-expect-no-error
  isExactly<FromScreamingKebabCase<'USER-ID'>, ['USER', 'ID']>();
  // @ts-expect-no-error
  isExactly<FromCamelSnakeCase<'User_Id'>, ['User', 'Id']>();
  // @ts-expect-no-error
  isExactly<FromDotCase<'foo.bar.baz'>, ['foo', 'bar', 'baz']>();
  // @ts-expect-no-error
  isExactly<FromPathCase<'foo/bar'>, ['foo', 'bar']>();
  // a separator parser does not look at capitals: mismatched input is whatever falls out
  // @ts-expect-no-error
  isExactly<FromSnakeCase<'fooBar'>, ['fooBar']>();
}

// #endregion

// #region best guess

/** Every separator splits, then the unbounded capital rules apply to each piece. */
namespace fromBestGuessCaseTest {
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'fooBar'>, ['foo', 'Bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'FooBar'>, ['Foo', 'Bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'foo_bar'>, ['foo', 'bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'foo-bar'>, ['foo', 'bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'foo.bar'>, ['foo', 'bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'foo/bar'>, ['foo', 'bar']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'foo_bar-bazQux'>, ['foo', 'bar', 'baz', 'Qux']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'HTMLButton'>, ['HTML', 'Button']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'MVCThing'>, ['MVC', 'Thing']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'USER_ID'>, ['USER', 'ID']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'ProperID4Form'>, ['Proper', 'ID4', 'Form']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<'Vector3D'>, ['Vector', '3D']>();
  // @ts-expect-no-error
  isExactly<FromBestGuessCase<''>, []>();
}

// #endregion

// #region renderers

type Sample = ['Proper', 'ID4', 'Form'];

/** Each renderer is a separator and a per-word casing. */
namespace renderersTest {
  // @ts-expect-no-error
  isExactly<ToPascalCase<Sample>, 'ProperID4Form'>();
  // @ts-expect-no-error
  isExactly<ToCamelCase<Sample>, 'properID4Form'>();
  // @ts-expect-no-error
  isExactly<ToSnakeCase<Sample>, 'proper_id4_form'>();
  // @ts-expect-no-error
  isExactly<ToScreamingSnakeCase<Sample>, 'PROPER_ID4_FORM'>();
  // @ts-expect-no-error
  isExactly<ToKebabCase<Sample>, 'proper-id4-form'>();
  // @ts-expect-no-error
  isExactly<ToTrainCase<Sample>, 'Proper-ID4-Form'>();
  // @ts-expect-no-error
  isExactly<ToScreamingKebabCase<Sample>, 'PROPER-ID4-FORM'>();
  // @ts-expect-no-error
  isExactly<ToCamelSnakeCase<Sample>, 'Proper_ID4_Form'>();
  // @ts-expect-no-error
  isExactly<ToDotCase<Sample>, 'proper.id4.form'>();
  // @ts-expect-no-error
  isExactly<ToPathCase<Sample>, 'proper/id4/form'>();
  // @ts-expect-no-error
  isExactly<ToFlatCase<Sample>, 'properid4form'>();
  // @ts-expect-no-error
  isExactly<ToUpperFlatCase<Sample>, 'PROPERID4FORM'>();
}

/**
 * A word keeps its capitals only when its letters are all uppercase and no more than `N` of
 * them, digits ignored; every other word is `Capitalize<Lowercase>`.
 */
namespace acronymRenderingTest {
  // @ts-expect-no-error
  isExactly<ToPascalCase<['MVC', 'Thing']>, 'MvcThing'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['MVC', 'Thing'], 3>, 'MVCThing'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['HTML', 'Button'], number>, 'HTMLButton'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['user', 'id']>, 'UserId'>();
  // a lowercase two-letter word is a word, not an acronym
  // @ts-expect-no-error
  isExactly<ToPascalCase<['id']>, 'Id'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['Mp3', 'Player']>, 'Mp3Player'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['P2P', 'Node']>, 'P2PNode'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['Vector', '3D']>, 'Vector3D'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['a11y', 'Tree']>, 'A11yTree'>();
  // a mixed-case word is normalized
  // @ts-expect-no-error
  isExactly<ToPascalCase<['fOO', 'bAR']>, 'FooBar'>();
  // the first camel word is always lowercase, acronym or not
  // @ts-expect-no-error
  isExactly<ToCamelCase<['ID', 'Form']>, 'idForm'>();
  // @ts-expect-no-error
  isExactly<ToCamelCase<['XML', 'Parser'], 3>, 'xmlParser'>();
  // @ts-expect-no-error
  isExactly<ToTrainCase<['MVC', 'Thing'], 3>, 'MVC-Thing'>();
  // @ts-expect-no-error
  isExactly<ToCamelSnakeCase<['MVC', 'Thing']>, 'Mvc_Thing'>();
  // the case-insensitive renderers ignore N
  // @ts-expect-no-error
  isExactly<ToSnakeCase<['MVC', 'Thing']>, 'mvc_thing'>();
  // @ts-expect-no-error
  isExactly<ToScreamingSnakeCase<['Mp3', 'Player']>, 'MP3_PLAYER'>();
}

/** Empty and single-word tuples. */
namespace rendererEdgesTest {
  // @ts-expect-no-error
  isExactly<ToPascalCase<[]>, ''>();
  // @ts-expect-no-error
  isExactly<ToCamelCase<[]>, ''>();
  // @ts-expect-no-error
  isExactly<ToSnakeCase<[]>, ''>();
  // @ts-expect-no-error
  isExactly<ToKebabCase<['foo']>, 'foo'>();
  // @ts-expect-no-error
  isExactly<ToCamelCase<['Foo']>, 'foo'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<['foo']>, 'Foo'>();
}

// #endregion

// #region round trips through Words

namespace roundTripTest {
  // @ts-expect-no-error
  isExactly<ToKebabCase<FromPascalCase<'ProperID4Form'>>, 'proper-id4-form'>();
  // @ts-expect-no-error
  isExactly<ToSnakeCase<FromPascalCase<'HTMLButton', number>>, 'html_button'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<FromSnakeCase<'user_id'>>, 'UserId'>();
  // @ts-expect-no-error
  isExactly<ToScreamingSnakeCase<FromCamelCase<'fooBar'>>, 'FOO_BAR'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<FromBestGuessCase<'MVCThing'>>, 'MvcThing'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<FromBestGuessCase<'MVCThing'>, 3>, 'MVCThing'>();
  // @ts-expect-no-error
  isExactly<ToConstantCase<FromPascalCase<'ProperID4Form'>>, 'PROPER_ID4_FORM'>();
  // @ts-expect-no-error
  isExactly<ToPascalCase<FromKebabCase<'vector-3d'>>, 'Vector3D'>();
  // the separators are not interchangeable
  // @ts-expect-error
  isExactly<ToSnakeCase<FromCamelCase<'fooBar'>>, 'foo-bar'>();
  // @ts-expect-error
  isExactly<ToCamelCase<FromSnakeCase<'foo_bar'>>, 'FooBar'>();
}

// #endregion

// #region aliases

/** Every conventional name for a case is the same type as its primary name. */
namespace aliasesTest {
  // @ts-expect-no-error
  isExactly<FromUpperCamelCase<'FooBar'>, FromPascalCase<'FooBar'>>();
  // @ts-expect-no-error
  isExactly<FromStudlyCase<'FooBar'>, FromPascalCase<'FooBar'>>();
  // @ts-expect-no-error
  isExactly<FromLowerCamelCase<'fooBar'>, FromCamelCase<'fooBar'>>();
  // @ts-expect-no-error
  isExactly<FromDromedaryCase<'fooBar'>, FromCamelCase<'fooBar'>>();
  // @ts-expect-no-error
  isExactly<FromPotholeCase<'foo_bar'>, FromSnakeCase<'foo_bar'>>();
  // @ts-expect-no-error
  isExactly<FromConstantCase<'FOO_BAR'>, FromScreamingSnakeCase<'FOO_BAR'>>();
  // @ts-expect-no-error
  isExactly<FromMacroCase<'FOO_BAR'>, FromScreamingSnakeCase<'FOO_BAR'>>();
  // @ts-expect-no-error
  isExactly<FromUpperSnakeCase<'FOO_BAR'>, FromScreamingSnakeCase<'FOO_BAR'>>();
  // @ts-expect-no-error
  isExactly<FromDashCase<'foo-bar'>, FromKebabCase<'foo-bar'>>();
  // @ts-expect-no-error
  isExactly<FromSpinalCase<'foo-bar'>, FromKebabCase<'foo-bar'>>();
  // @ts-expect-no-error
  isExactly<FromLispCase<'foo-bar'>, FromKebabCase<'foo-bar'>>();
  // @ts-expect-no-error
  isExactly<FromParamCase<'foo-bar'>, FromKebabCase<'foo-bar'>>();
  // @ts-expect-no-error
  isExactly<FromHyphenCase<'foo-bar'>, FromKebabCase<'foo-bar'>>();
  // @ts-expect-no-error
  isExactly<FromHttpHeaderCase<'Foo-Bar'>, FromTrainCase<'Foo-Bar'>>();
  // @ts-expect-no-error
  isExactly<FromPascalKebabCase<'Foo-Bar'>, FromTrainCase<'Foo-Bar'>>();
  // @ts-expect-no-error
  isExactly<FromCobolCase<'FOO-BAR'>, FromScreamingKebabCase<'FOO-BAR'>>();
  // @ts-expect-no-error
  isExactly<FromUpperKebabCase<'FOO-BAR'>, FromScreamingKebabCase<'FOO-BAR'>>();
  // @ts-expect-no-error
  isExactly<FromPascalSnakeCase<'Foo_Bar'>, FromCamelSnakeCase<'Foo_Bar'>>();
  // @ts-expect-no-error
  isExactly<FromAdaCase<'Foo_Bar'>, FromCamelSnakeCase<'Foo_Bar'>>();

  // @ts-expect-no-error
  isExactly<ToUpperCamelCase<Sample>, ToPascalCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToStudlyCase<Sample>, ToPascalCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToLowerCamelCase<Sample>, ToCamelCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToDromedaryCase<Sample>, ToCamelCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToPotholeCase<Sample>, ToSnakeCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToConstantCase<Sample>, ToScreamingSnakeCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToMacroCase<Sample>, ToScreamingSnakeCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToUpperSnakeCase<Sample>, ToScreamingSnakeCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToDashCase<Sample>, ToKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToSpinalCase<Sample>, ToKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToLispCase<Sample>, ToKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToParamCase<Sample>, ToKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToHyphenCase<Sample>, ToKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToHttpHeaderCase<Sample>, ToTrainCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToPascalKebabCase<Sample>, ToTrainCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToCobolCase<Sample>, ToScreamingKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToUpperKebabCase<Sample>, ToScreamingKebabCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToPascalSnakeCase<Sample>, ToCamelSnakeCase<Sample>>();
  // @ts-expect-no-error
  isExactly<ToAdaCase<Sample>, ToCamelSnakeCase<Sample>>();
  // the aliases carry N too
  // @ts-expect-no-error
  isExactly<ToStudlyCase<['MVC', 'Thing'], 3>, 'MVCThing'>();
  // @ts-expect-no-error
  isExactly<FromUpperCamelCase<'MVCThing', 3>, ['MVC', 'Thing']>();
}

// #endregion

// #region the one-step converters are gone

namespace removedTest {
  // @ts-expect-error
  type _pascal = import('./case-converters').PascalCase<'foo'>;
  // @ts-expect-error
  type _snake = import('./case-converters').SnakeCase<'foo'>;
  // @ts-expect-error
  type _title = import('./case-converters').TitleCase<'foo'>;
}

// #endregion
