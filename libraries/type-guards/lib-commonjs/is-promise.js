"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromiseLike = void 0;
const is_function_1 = require("./is-function");
function isPromiseLike(value) {
    return value instanceof Promise
        || /\bPromise\b/.test(Object.prototype.toString.call(value))
        || 'then' in value && (0, is_function_1.isFunction)(value?.then);
}
exports.isPromiseLike = isPromiseLike;
//# sourceMappingURL=is-promise.js.map