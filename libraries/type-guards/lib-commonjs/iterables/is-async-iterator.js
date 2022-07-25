"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterator = void 0;
const _isIterator_1 = require("./_isIterator");
const is_async_iterable_1 = require("./is-async-iterable");
function isAsyncIterator(value) {
    return (0, is_async_iterable_1.isAsyncIterable)(value) && (0, _isIterator_1._isIterator)(value);
}
exports.isAsyncIterator = isAsyncIterator;
//# sourceMappingURL=is-async-iterator.js.map