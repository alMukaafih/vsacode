"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOMLError = void 0;
class TOMLError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.TOMLError = TOMLError;
