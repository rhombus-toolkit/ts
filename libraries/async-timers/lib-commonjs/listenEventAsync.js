"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenEventAsync = void 0;
function listenEventAsync(target, name, options = {}) {
    return new Promise(resolve => {
        const opts = typeof options === 'boolean' ? { capture: options } : options;
        target.addEventListener(name, p => resolve(p), { ...opts, once: true });
    });
}
exports.listenEventAsync = listenEventAsync;
//# sourceMappingURL=listenEventAsync.js.map