"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIterator = void 0;
const is_iterable_1 = require("./is-iterable");
const _isIterator_1 = require("./_isIterator");
function isIterator(value) {
    return (0, is_iterable_1.isIterable)(value) && (0, _isIterator_1._isIterator)(value);
}
exports.isIterator = isIterator;
//# sourceMappingURL=is-iterator.js.map