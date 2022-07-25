"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGenerator = void 0;
const is_iterator_1 = require("./is-iterator");
const GeneratorFunction = (function* () { }()).constructor;
function isGenerator(value) {
    if (value?.constructor === GeneratorFunction)
        return true;
    if (/\bGenerator\b/.test(Object.prototype.toString.call(value)))
        return true;
    return (0, is_iterator_1.isIterator)(value) && value?.next?.length === 1;
}
exports.isGenerator = isGenerator;
//# sourceMappingURL=is-generator.js.map