# Changelog

## [4.0.0](https://github.com/rhombus-toolkit/ts/compare/type-guards-v3.1.0...type-guards-v4.0.0) (2026-09-04)


### ⚠ BREAKING CHANGES

* **type-guards:** the contract guards narrow to Iterable<unknown> and friends rather than Iterable<any>, isFunction narrows to Func<unknown[], unknown> and no longer accepts type arguments, and isDefined no longer re-admits null.
* **repo:** delete func and case-converter compat shims
* **type-guards:** pin lib to ES2018 and park isUrl to drop the DOM dependency
* **type-guards:** correct the generator guards and stop isIterable throwing

### Features

* **type-guards:** adopt isAllThere from obj ([00d8aec](https://github.com/rhombus-toolkit/ts/commit/00d8aec169e588cb1cbec41f97b3d398475dca7e))
* **type-guards:** name the checked key, drop isFunction's signature params ([aa6270f](https://github.com/rhombus-toolkit/ts/commit/aa6270fa76c40ed6b55114ef5250bc0d7edd9d1f))


### Bug Fixes

* **type-guards:** correct the generator guards and stop isIterable throwing ([27c31ae](https://github.com/rhombus-toolkit/ts/commit/27c31ae79cee4e9db6148d8cfab27ff6ebe928b3))
* **type-guards:** isFunction narrows to Func's permissive default ([aa9388d](https://github.com/rhombus-toolkit/ts/commit/aa9388da137d5cd76c3333686b3a825bd1f72823))
* **type-guards:** make the spec compile under the pinned lib floor ([fad6047](https://github.com/rhombus-toolkit/ts/commit/fad604758f34c54865ca356ffd49bc4144c28bb4))


### Build

* **type-guards:** pin lib to ES2018 and park isUrl to drop the DOM dependency ([b19a7c2](https://github.com/rhombus-toolkit/ts/commit/b19a7c21fef6a428afa1715a42644b8f34191afc))


### Chores

* **repo:** delete func and case-converter compat shims ([a195004](https://github.com/rhombus-toolkit/ts/commit/a195004db8ebe6886d8aeca7cd8fb5274db6be35))

## [2.0.0](https://github.com/rhombus-toolkit/ts/compare/type-guards-v1.3.4...type-guards-v2.0.0) (2026-08-15)


### ⚠ BREAKING CHANGES

* **repo:** delete func and case-converter compat shims
* **type-guards:** pin lib to ES2018 and park isUrl to drop the DOM dependency
* **type-guards:** correct the generator guards and stop isIterable throwing

### Bug Fixes

* **type-guards:** correct the generator guards and stop isIterable throwing ([27c31ae](https://github.com/rhombus-toolkit/ts/commit/27c31ae79cee4e9db6148d8cfab27ff6ebe928b3))
* **type-guards:** make the spec compile under the pinned lib floor ([fad6047](https://github.com/rhombus-toolkit/ts/commit/fad604758f34c54865ca356ffd49bc4144c28bb4))


### Build

* **type-guards:** pin lib to ES2018 and park isUrl to drop the DOM dependency ([b19a7c2](https://github.com/rhombus-toolkit/ts/commit/b19a7c21fef6a428afa1715a42644b8f34191afc))


### Chores

* **repo:** delete func and case-converter compat shims ([a195004](https://github.com/rhombus-toolkit/ts/commit/a195004db8ebe6886d8aeca7cd8fb5274db6be35))
