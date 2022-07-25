"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._isIterator = void 0;
const is_function_1 = require("../is-function");
function _isIterator(value) {
    if (value?.[Symbol.toStringTag]?.split(/\s+/)?.includes('Iterator'))
        return true;
    if (/\bIterator\b/.test(Object.prototype.toString.call(value)))
        return true;
    return (0, is_function_1.isFunction)(value?.next);
}
exports._isIterator = _isIterator;
//# sourceMappingURL=_isIterator.js.map