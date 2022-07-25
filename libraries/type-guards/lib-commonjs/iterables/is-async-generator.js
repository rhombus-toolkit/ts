"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncGenerator = void 0;
const is_async_iterator_1 = require("./is-async-iterator");
const AsyncGeneratorFunction = (async function* () { }()).constructor;
function isAsyncGenerator(value) {
    if (value?.constructor === AsyncGeneratorFunction)
        return true;
    if (/\bAsyncGenerator\b/.test(Object.prototype.toString.call(value)))
        return true;
    return (0, is_async_iterator_1.isAsyncIterator)(value) && value?.next?.length === 1;
}
exports.isAsyncGenerator = isAsyncGenerator;
//# sourceMappingURL=is-async-generator.js.map