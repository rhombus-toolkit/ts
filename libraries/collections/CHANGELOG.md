# Changelog

## [3.1.0](https://github.com/rhombus-toolkit/ts/compare/collections-v3.0.0...collections-v3.1.0) (2026-09-13)


### Features

* **collections:** add WeakValuedMap, a Map whose values are held weakly ([0b76b96](https://github.com/rhombus-toolkit/ts/commit/0b76b962b38876def075d3d9f7444db92c9422eb))

## [3.0.0](https://github.com/rhombus-toolkit/ts/compare/collections-v2.1.0...collections-v3.0.0) (2026-09-12)


### ⚠ BREAKING CHANGES

* **collections:** KindaWeakMap no longer holds values weakly under strong keys; it holds keys weakly where a WeakMap can, and strongly otherwise.

### Features

* **collections:** add MultiKeyWeakMap, a KindaWeakMap keyed by a tuple ([9e11b20](https://github.com/rhombus-toolkit/ts/commit/9e11b20a0aca8ebfb2842762e52ec0d7c0858d4c))
* **collections:** prune emptied prefixes on delete, and KindaWeakMap reports its size ([fb68b2e](https://github.com/rhombus-toolkit/ts/commit/fb68b2eafaf40c2ab72e7995e8de443a6e49d734))
* **collections:** replace KindaWeakMap with a map weak only where it can be ([5a7bfed](https://github.com/rhombus-toolkit/ts/commit/5a7bfedb53277080d5e75b81a5103ca40f87218f))
* **once:** add intern, and memo keyed by what selectKeys picks from the arguments ([16f75b8](https://github.com/rhombus-toolkit/ts/commit/16f75b80b7d715f7b643e13ef183dd6fa9b6c37f))

## [2.1.0](https://github.com/rhombus-toolkit/ts/compare/collections-v2.0.2...collections-v2.1.0) (2026-09-11)


### Features

* **collections:** add AutoStack, whose entries leave with their scope ([99631c2](https://github.com/rhombus-toolkit/ts/commit/99631c2a1f7d3c628e8897eb97b99611fa59b01c))
* **collections:** report how many entries an AutoStack holds ([dc47203](https://github.com/rhombus-toolkit/ts/commit/dc47203553e205ef74be5f5e0dfd11b485c58051))

## [2.0.2](https://github.com/rhombus-toolkit/ts/compare/collections-v2.0.1...collections-v2.0.2) (2026-09-10)


### Bug Fixes

* **collections:** keep a re-set key in place and register each KindaWeakMap entry on its own ([8afb15a](https://github.com/rhombus-toolkit/ts/commit/8afb15ab137c2a819b2c323ee56212a0b2c10e47))

## [2.0.1](https://github.com/rhombus-toolkit/ts/compare/collections-v2.0.0...collections-v2.0.1) (2026-09-10)


### Bug Fixes

* **collections:** hide collected entries from every KindaWeakMap read ([dcf59aa](https://github.com/rhombus-toolkit/ts/commit/dcf59aa0717952ae24fa6a5eba9c29a6e54b7b18))

## [2.0.0](https://github.com/rhombus-toolkit/ts/compare/collections-v1.0.0...collections-v2.0.0) (2026-09-03)


### ⚠ BREAKING CHANGES

* **collections:** @rhombus-toolkit/kinda-weak-map is deleted. KindaWeakMap is now a named export of @rhombus-toolkit/collections.

### Features

* **collections:** adopt ImmutableLinkedList from std ([d1cd96a](https://github.com/rhombus-toolkit/ts/commit/d1cd96a770125ec2cb0761694ad66eb332301832))
* **collections:** move KindaWeakMap into a collections shelf ([6e85d8f](https://github.com/rhombus-toolkit/ts/commit/6e85d8f7110183296cb02b4525d9150c884afacf))
