"use strict";
/// <reference lib="es2015.iterable" />
/// <reference lib="es2021.weakref" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = void 0;
function Singleton(ctor) {
    return class Singleton extends ctor {
        static #instance;
        constructor(...args) {
            const value = Singleton.#instance?.deref();
            if (value) {
                return value;
            }
            super(...args);
            Singleton.#instance = new WeakRef(this);
        }
    };
}
exports.Singleton = Singleton;
//# sourceMappingURL=Singleton.js.map