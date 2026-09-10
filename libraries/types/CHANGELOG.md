# Changelog

## [4.0.1](https://github.com/rhombus-toolkit/ts/compare/types-v4.0.0...types-v4.0.1) (2026-09-10)


### Bug Fixes

* **types:** link a $ nested inside a function or constructor type to the outer type parameter ([c0caeb5](https://github.com/rhombus-toolkit/ts/commit/c0caeb57d2eca4cd91e3dc8f9e3c0cfe2a845f24))

## [4.0.0](https://github.com/rhombus-toolkit/ts/compare/types-v3.0.1...types-v4.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* **types:** the one-step case converters (PascalCase, CamelCase, SnakeCase, ConstantCase, DashCase, KebabCase, TitleCase) are gone; compose a To* renderer over a From* parser instead.

### Features

* **types:** parse and render identifier cases through a Words tuple ([8a7c77e](https://github.com/rhombus-toolkit/ts/commit/8a7c77e548aff5600f9785744fe92148e33619a7))

## [3.0.1](https://github.com/rhombus-toolkit/ts/compare/types-v3.0.0...types-v3.0.1) (2026-09-10)


### Bug Fixes

* **types:** strip the optional modifier in WritableKeys like ReadonlyKeys does ([455fcc4](https://github.com/rhombus-toolkit/ts/commit/455fcc4ed14ca69b52da0479d12a624b249687e3))

## [3.0.0](https://github.com/rhombus-toolkit/ts/compare/types-v2.0.0...types-v3.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* **types:** AssertNeverError is no longer exported; use never for an unreachable conditional-type arm.

### Features

* **types:** drop the type-level error objects ([4e0064f](https://github.com/rhombus-toolkit/ts/commit/4e0064ffdd4fac2b89828878bb4b61594d4bd48d))

## [2.0.0](https://github.com/rhombus-toolkit/ts/compare/types-v1.0.1...types-v2.0.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* **repo:** rename type-helpers to on-ice, the parked-material dumping ground

### Features

* import std's primitives toolkit into obj, platform and types ([7bde0e1](https://github.com/rhombus-toolkit/ts/commit/7bde0e156e1a7deab2a5ab1655f153e0d5710d72))
* **types:** add @rhombus-toolkit/types, the types-only core ([c90b555](https://github.com/rhombus-toolkit/ts/commit/c90b5551cacec5699e90882c78d52ca9fed99511))
* **types:** add DistributiveOmit and ButNot ([d16c02c](https://github.com/rhombus-toolkit/ts/commit/d16c02ca7ff9e89884eb77a1b36c3a974a41c30b))
* **types:** the types-only core package ([03e03db](https://github.com/rhombus-toolkit/ts/commit/03e03dbd8766868d1c485cd510189b3f19f448d8))


### Bug Fixes

* **repo:** sync manifests to npm, refuse to publish an unpublished pin ([693a9b8](https://github.com/rhombus-toolkit/ts/commit/693a9b84c1113e7ec9d1098b6c10036cd168787a))


### Refactoring

* **repo:** rename type-helpers to on-ice, the parked-material dumping ground ([a18f581](https://github.com/rhombus-toolkit/ts/commit/a18f5817e1b5f577423e7e41fceda0fb76ac45d9))

## [1.0.0](https://github.com/rhombus-toolkit/ts/compare/types-v1.0.0...types-v1.0.0) (2026-08-27)


### Features

* import std's primitives toolkit into obj, platform and types ([7bde0e1](https://github.com/rhombus-toolkit/ts/commit/7bde0e156e1a7deab2a5ab1655f153e0d5710d72))
* **types:** add DistributiveOmit and ButNot ([d16c02c](https://github.com/rhombus-toolkit/ts/commit/d16c02ca7ff9e89884eb77a1b36c3a974a41c30b))

## [1.0.0](https://github.com/rhombus-toolkit/ts/compare/types-v1.0.0...types-v1.0.0) (2026-08-15)


### ⚠ BREAKING CHANGES

* **repo:** rename type-helpers to on-ice, the parked-material dumping ground

### Features

* **types:** add @rhombus-toolkit/types, the types-only core ([c90b555](https://github.com/rhombus-toolkit/ts/commit/c90b5551cacec5699e90882c78d52ca9fed99511))
* **types:** the types-only core package ([03e03db](https://github.com/rhombus-toolkit/ts/commit/03e03dbd8766868d1c485cd510189b3f19f448d8))


### Refactoring

* **repo:** rename type-helpers to on-ice, the parked-material dumping ground ([a18f581](https://github.com/rhombus-toolkit/ts/commit/a18f5817e1b5f577423e7e41fceda0fb76ac45d9))
