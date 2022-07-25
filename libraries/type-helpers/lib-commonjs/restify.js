"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unrestify = exports.restify = void 0;
const Ξ = Symbol("⚡");
function mark(target) {
    Reflect.defineProperty(target, Ξ, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: true,
    });
    return target;
}
function restify(arg) {
    if (arg === undefined) {
        return mark([]);
    }
    if (Array.isArray(arg)) {
        return arg;
    }
    return mark([arg]);
}
exports.restify = restify;
function unrestify(arg) {
    if (!arg[Ξ]) {
        return arg;
    }
    if (!Array.isArray(arg)) {
        throw new TypeError("Value must be an array");
    }
    switch (arg.length) {
        case 0:
            return;
        case 1:
            return arg[0];
        default:
            return [...arg]; //clear the marker symbol
    }
}
exports.unrestify = unrestify;
//# sourceMappingURL=restify.js.map