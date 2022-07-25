"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Singleton = void 0;
const map = new WeakMap();
class Singleton {
    #type;
    #factory;
    instance() {
        if (!map.has(this.#type)) {
            map.set(this.#type, this.#factory());
        }
        return map.get(this.#type);
    }
    constructor(type, arg) {
        this.#type = type;
        this.#factory = typeof arg === 'function' ? arg : () => arg;
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    static for(instance) {
        return new Singleton(instance.constructor, instance);
    }
}
exports.Singleton = Singleton;
//# sourceMappingURL=Singleton.alt.js.map