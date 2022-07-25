"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheapRingBuffer = void 0;
class CheapRingBuffer extends Array {
    #position = 0;
    push(value) {
        super.shift();
        return super.push(value);
    }
}
exports.CheapRingBuffer = CheapRingBuffer;
//# sourceMappingURL=CheapRingBuffer.js.map