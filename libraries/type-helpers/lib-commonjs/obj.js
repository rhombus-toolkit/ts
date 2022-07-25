"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignDeep = exports.assign = exports.fromEntries = exports.values = exports.entries = exports.keys = void 0;
function keys(obj) {
    return Object.keys(obj);
}
exports.keys = keys;
function entries(obj) {
    return Object.entries(obj);
}
exports.entries = entries;
function values(obj) {
    return Object.values(obj);
}
exports.values = values;
function fromEntries(entries) {
    return Object.fromEntries(entries);
}
exports.fromEntries = fromEntries;
// eslint-disable-next-line @typescript-eslint/ban-types
function assign(target, ...sources) {
    return Object.assign(target, ...sources);
}
exports.assign = assign;
function assignDeep(target, stuff) {
    if (!(target instanceof Object)) {
        throw new RangeError('this function only useful on things with an Object prototype');
    }
    let current = target;
    while (Reflect.getPrototypeOf(current)?.constructor && Reflect.getPrototypeOf(current).constructor !== Object) {
        current = Reflect.getPrototypeOf(current);
    }
    Reflect.setPrototypeOf(current, Reflect.getPrototypeOf(stuff));
    return Object.assign(target, stuff);
}
exports.assignDeep = assignDeep;
//# sourceMappingURL=obj.js.map