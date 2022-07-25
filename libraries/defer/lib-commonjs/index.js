"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defer = void 0;
function defer() {
    const result = {
        [Symbol.toStringTag]: 'defer'
    };
    result.promise = new Promise((resolve, reject) => {
        result.resolve = (value) => {
            resolve(value);
            return result.promise;
        };
        result.reject = (reason) => {
            reject(reason);
            return result.promise;
        };
    });
    return Object.freeze(result);
}
exports.defer = defer;
(function (defer) {
    function resolve(value) {
        return defer().resolve(value);
    }
    defer.resolve = resolve;
    function reject(reason) {
        return defer().reject(reason);
    }
    defer.reject = reject;
})(defer = exports.defer || (exports.defer = {}));
//# sourceMappingURL=index.js.map