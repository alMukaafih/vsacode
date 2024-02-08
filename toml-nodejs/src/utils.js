"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBinary = exports.isOctal = exports.isHexadecimal = exports.isDecimal = void 0;
const isDecimal = (char) => {
    return '0' <= char && char <= '9';
};
exports.isDecimal = isDecimal;
const isHexadecimal = (char) => {
    return ('A' <= char && char <= 'Z') || ('a' <= char && char <= 'z') || ('0' <= char && char <= '9');
};
exports.isHexadecimal = isHexadecimal;
const isOctal = (char) => {
    return '0' <= char && char <= '7';
};
exports.isOctal = isOctal;
const isBinary = (char) => {
    return char === '0' || char === '1';
};
exports.isBinary = isBinary;
