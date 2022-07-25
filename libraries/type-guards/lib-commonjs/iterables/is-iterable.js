"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIterable = void 0;
function isIterable(value) {
    return Symbol.iterator in value;
}
exports.isIterable = isIterable;
//# sourceMappingURL=is-iterable.js.map