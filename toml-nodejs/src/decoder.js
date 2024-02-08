"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const parser_js_1 = require("./parser.js");
const normalizer_js_1 = require("./normalizer.js");
const decode = (input) => {
    const parser = new parser_js_1.Parser(input);
    const node = parser.parse();
    return (0, normalizer_js_1.normalize)(node);
};
exports.decode = decode;
