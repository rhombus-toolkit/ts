"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setImmediateAsync = void 0;
const set_immediate_1 = require("@rhombus-toolkit/set-immediate");
function setImmediateAsync(...args) {
    const [first, ...rest] = args;
    const signal = first instanceof AbortSignal ? first : undefined;
    const params = signal ? rest : args;
    return new Promise((resolve, reject) => {
        let token;
        signal?.addEventListener('abort', (ev) => {
            if (token) {
                (0, set_immediate_1.clearImmediate)(token);
                token = undefined;
            }
            reject('cancelled');
        });
        token = (0, set_immediate_1.setImmediate)(() => resolve(params.length === 1 ? params[0] : args));
    });
}
exports.setImmediateAsync = setImmediateAsync;
//# sourceMappingURL=setImmediateAsync.js.map