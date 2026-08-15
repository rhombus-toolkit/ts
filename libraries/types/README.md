# @rhombus-toolkit/types

Type-level utilities. No runtime — every file is a `.ts` holding only type
declarations, so the package emits no JavaScript at all while still being
type-checked like ordinary source (a `.d.ts` would be skipped outright under
`skipLibCheck`, which is how several of these types shipped broken).

## Entry points

| Entry       | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.`         | `Func`, `AsyncFunc`, `Action`, `AsyncAction`, `Sub`, `AsyncSub`, `Ctor`, `AbstractCtor` · `Curry` · `Cast` · `Brand`, `Flavor` · `Identity` · `DeepRecord`, `DeepRecordItem`, `Dictionary`, `DeepDictionary`, `DeepDictionaryItem` · `Store`, `Inc`, `Dec`, `Add`, `Subtract`, `Multiply` · `UnionToIntersection` · `UnionToTuple`, `TupleToUnion` · `AssertNeverError` · `Falsy`, `Truthy`, `IsFalsy`, `IsTruthy`, `IfFalsy`, `IfTruthy`, `TypeName` · `Simplify`, `Flatten`, `Except`, `Mutable`, `IfEquals`, `WritableKeys`, `ReadonlyKeys`, `WritablePart`, `MakeRequired` |
| `./generic` | The `$`-placeholder `Func`/`Ctor`/`AbstractCtor` variants                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `./array`   | `Head`, `Tail`, `Body`, `Last`, `Length`, `SplitArray`, `Slice`, `Take`, `Skip`, `PartialList`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `./string`  | `ToStringable`, `AsString`, `ToStringLiteral`, `Join`, `Split`, `ClearEmpties`; the char alphabet (`AnyChar`, `LetterChar`, `UpperCaseChar`, `LowerCaseChar`, `DigitChar`, `NonDigitChar`, `SpaceChar`, `NonSpaceChar`, `SymbolChar`, `WordChar`, `NonWordChar`); the case converters (`CamelCase`, `PascalCase`, `SnakeCase`, `KebabCase`, `DashCase`, `ConstantCase`, `TitleCase`)                                                                                                                                                                                           |

## Naming convention

**Every exported type here is UpperCamel.**

A lowercase type name means — and only ever means — that a runtime function of
the same name is declaration-merged with it (`defer`, `flattenMap`, `obj.keys`).
That can only happen in a package that has a runtime, so nothing in this one
qualifies, and a lowercase name would be a lie about what you are importing.

The rule is applied at the definition, not at the barrel: `join as Join`
re-exports are what it exists to prevent.

## Renames

Absorbed from `@rhombus-toolkit/func` (whole package), `@rhombus-toolkit/case-converter`
(whole package), and the type half of `@rhombus-toolkit/type-helpers`.

| Was                                                     | Is                                                      | Why                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `join`, `split`, `clearEmpties`, `asString`, `identity` | `Join`, `Split`, `ClearEmpties`, `AsString`, `Identity` | the naming convention above                                                                                             |
| `toString`                                              | `ToStringLiteral`                                       | says what it produces, and stops shadowing `Object.prototype.toString`                                                  |
| `isFalsy<T, TruePart, FalsePart>`                       | `IfFalsy<T, Then, Else>`                                | it selects a branch, so it is an `If`; `IsFalsy<T>` is the new boolean-valued form (and `IfTruthy`/`IsTruthy` likewise) |
| `Opaque`                                                | `Brand`                                                 | the community term; `Flavor` (optional marker) ships beside it                                                          |
| `SnakeCase`                                             | `ConstantCase`                                          | it always produced `FOO_BAR`; `SnakeCase` now produces `foo_bar`                                                        |

`func`'s `./generic` subpath keeps its name, so an existing
`@rhombus-toolkit/func/generic` import moves with a one-token change.
