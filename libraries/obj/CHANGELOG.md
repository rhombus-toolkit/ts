# Changelog

## [3.0.1](https://github.com/rhombus-toolkit/ts/compare/obj-v3.0.0...obj-v3.0.1) (2026-09-04)


### Bug Fixes

* **obj:** correlate mapValues' callback pair, add mapEntries ([52af040](https://github.com/rhombus-toolkit/ts/commit/52af04034c5fa21348a3f9dc6c308fc40df6933c))
* **obj:** keep obj.&lt;name&gt;'s type half in the rolled .d.ts ([d34716a](https://github.com/rhombus-toolkit/ts/commit/d34716ac2033e8f44dc31441df28b358e396fee8))

## [3.0.0](https://github.com/rhombus-toolkit/ts/compare/obj-v2.0.0...obj-v3.0.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* **obj:** concat, first, firstDefined, iterable, replace, sequenceEquals, tryFirst, tryFirstDefined and zip are no longer exported from @rhombus-toolkit/obj. They moved to @rhombus-toolkit/iterable unchanged -- import them from there.
* **obj:** isAllThere moved to @rhombus-toolkit/type-guards, where the other guards live.
* **obj:** isAllThere no longer accepts a general Iterable. Deciding it reads to the end, so a one-shot source was spent by the call and the value it narrowed yielded nothing.

### Features

* dissolve type-helpers into obj + restify + the types core ([496949d](https://github.com/rhombus-toolkit/ts/commit/496949d93a3cdfe69af5c62fb3ebbcaed8f23c89))
* import std's primitives toolkit into obj, platform and types ([7bde0e1](https://github.com/rhombus-toolkit/ts/commit/7bde0e156e1a7deab2a5ab1655f153e0d5710d72))
* **iterable:** split the iterable helpers out of obj ([923a675](https://github.com/rhombus-toolkit/ts/commit/923a675867ce908fdd678abad8bcfd97d90d471b))
* **obj:** add @rhombus-toolkit/obj, the Object.* wrappers plus flattenMap ([4fda467](https://github.com/rhombus-toolkit/ts/commit/4fda467ba538b6624256b2e2a3f8501e38b43112))
* **obj:** add the iterable helpers from std's primitives toolkit ([845824d](https://github.com/rhombus-toolkit/ts/commit/845824d78d6b532ab0a25e0f92f0f2c179baf5ff))
* **obj:** document and spec the first family, drop isAllThere ([e8335c7](https://github.com/rhombus-toolkit/ts/commit/e8335c75c03bd2e6aedba571618bca39dcfc6356))
* **obj:** drop the iterable helpers to their own package ([e59a83a](https://github.com/rhombus-toolkit/ts/commit/e59a83a5cfb260562ee3cd274ca2c4e6d27b9fb7))
* **obj:** isAllThere takes an array, not any iterable ([0014642](https://github.com/rhombus-toolkit/ts/commit/001464215743f872b841452939de4573b912e0eb))
* **obj:** narrow a mutable array to a mutable array in isAllThere ([d4b0033](https://github.com/rhombus-toolkit/ts/commit/d4b0033764b5738a464f80f47b8876dd954fb5ac))

## [1.0.0](https://github.com/rhombus-toolkit/ts/compare/obj-v1.0.0...obj-v1.0.0) (2026-08-27)


### Features

* import std's primitives toolkit into obj, platform and types ([7bde0e1](https://github.com/rhombus-toolkit/ts/commit/7bde0e156e1a7deab2a5ab1655f153e0d5710d72))
* **obj:** add the iterable helpers from std's primitives toolkit ([845824d](https://github.com/rhombus-toolkit/ts/commit/845824d78d6b532ab0a25e0f92f0f2c179baf5ff))

## [1.0.0](https://github.com/rhombus-toolkit/ts/compare/obj-v1.0.0...obj-v1.0.0) (2026-08-15)


### Features

* dissolve type-helpers into obj + restify + the types core ([496949d](https://github.com/rhombus-toolkit/ts/commit/496949d93a3cdfe69af5c62fb3ebbcaed8f23c89))
* **obj:** add @rhombus-toolkit/obj, the Object.* wrappers plus flattenMap ([4fda467](https://github.com/rhombus-toolkit/ts/commit/4fda467ba538b6624256b2e2a3f8501e38b43112))
