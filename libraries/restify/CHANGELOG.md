# Changelog

## [2.0.1](https://github.com/rhombus-toolkit/ts/compare/restify-v2.0.0...restify-v2.0.1) (2026-09-10)


### Bug Fixes

* **restify:** mark the rest-args tuple in place and unmark it on the way to the handler ([ff6158e](https://github.com/rhombus-toolkit/ts/commit/ff6158e76bf57d2410877ea3f41b4143d7581a72))

## [2.0.0](https://github.com/rhombus-toolkit/ts/compare/restify-v1.1.1...restify-v2.0.0) (2026-09-10)


### ⚠ BREAKING CHANGES

* **restify:** restify wraps an unmarked array as one argument instead of passing it through, and unrestify unwraps any one-element array rather than only a marked one.

### Bug Fixes

* **restify:** keep a null argument as a payload ([188b4bb](https://github.com/rhombus-toolkit/ts/commit/188b4bb1c365e0a835ce1a17d94ed3630fd7ef3b))
* **restify:** keep holes when copying a multi-argument tuple ([e6ac081](https://github.com/rhombus-toolkit/ts/commit/e6ac08137d19c13f0196563aabcff074c88af6cc))
* **restify:** mark the multi-argument tuple so one array argument survives ([43e651e](https://github.com/rhombus-toolkit/ts/commit/43e651e4b75a196ea8114f274a257b99acae5a58))

## [1.1.1](https://github.com/rhombus-toolkit/ts/compare/restify-v1.1.0...restify-v1.1.1) (2026-09-10)


### Bug Fixes

* **restify:** map null to the empty tuple like the type says ([303ca2b](https://github.com/rhombus-toolkit/ts/commit/303ca2b1ae47a1965f7d8054015c2b87440340ca))

## [1.1.0](https://github.com/rhombus-toolkit/ts/compare/restify-v1.0.1...restify-v1.1.0) (2026-09-03)


### Features

* dissolve type-helpers into obj + restify + the types core ([496949d](https://github.com/rhombus-toolkit/ts/commit/496949d93a3cdfe69af5c62fb3ebbcaed8f23c89))
* **restify:** add @rhombus-toolkit/restify, fixing unrestify's dead arm ([f6c8c1a](https://github.com/rhombus-toolkit/ts/commit/f6c8c1adea9f025008acb15bbca9ad06d950b337))


### Bug Fixes

* **repo:** sync manifests to npm, refuse to publish an unpublished pin ([693a9b8](https://github.com/rhombus-toolkit/ts/commit/693a9b84c1113e7ec9d1098b6c10036cd168787a))

## [1.0.0](https://github.com/rhombus-toolkit/ts/compare/restify-v1.0.0...restify-v1.0.0) (2026-08-15)


### Features

* dissolve type-helpers into obj + restify + the types core ([496949d](https://github.com/rhombus-toolkit/ts/commit/496949d93a3cdfe69af5c62fb3ebbcaed8f23c89))
* **restify:** add @rhombus-toolkit/restify, fixing unrestify's dead arm ([f6c8c1a](https://github.com/rhombus-toolkit/ts/commit/f6c8c1adea9f025008acb15bbca9ad06d950b337))
