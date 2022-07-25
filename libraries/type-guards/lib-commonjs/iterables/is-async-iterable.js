"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = void 0;
function isAsyncIterable(value) {
    return Symbol.asyncIterator in value;
}
exports.isAsyncIterable = isAsyncIterable;
//# sourceMappingURL=is-async-iterable.js.map