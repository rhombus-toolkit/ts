"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rangeArray = exports.range = void 0;
function* range(length, start = 0) {
    let i = 0;
    while (i < length) {
        yield start + i++;
    }
}
exports.range = range;
function rangeArray(length) {
    return Array.from(new Array(length).keys());
}
exports.rangeArray = rangeArray;
//# sourceMappingURL=range.js.map