"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeCallbackToAsync = void 0;
function nodeCallbackToAsync(fn) {
    return (...args) => new Promise((resolve, reject) => {
        fn(...args, (err, result) => {
            if (err !== undefined) {
                reject(err);
            }
            else {
                resolve(result);
            }
        });
    });
}
exports.nodeCallbackToAsync = nodeCallbackToAsync;
//# sourceMappingURL=node-callback-to-async.js.map