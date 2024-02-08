"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize = void 0;
const types_js_1 = require("./types.js");
const errors_js_1 = require("./errors.js");
const isKeyValuePair = (value) => {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
        return false;
    }
    if (value instanceof types_js_1.LocalDateTime || value instanceof types_js_1.LocalDate || value instanceof types_js_1.LocalTime) {
        return false;
    }
    return true;
};
const merge = (...values) => {
    return values.reduce((acc, value) => {
        for (const [key, nextValue] of Object.entries(value)) {
            const prevValue = acc[key];
            if (Array.isArray(prevValue) && Array.isArray(nextValue)) {
                acc[key] = prevValue.concat(nextValue);
            }
            else if (isKeyValuePair(prevValue) && isKeyValuePair(nextValue)) {
                acc[key] = merge(prevValue, nextValue);
            }
            else if (Array.isArray(prevValue) &&
                isKeyValuePair(prevValue[prevValue.length - 1]) &&
                isKeyValuePair(nextValue)) {
                const prevValueLastElement = prevValue[prevValue.length - 1];
                acc[key] = [...prevValue.slice(0, -1), merge(prevValueLastElement, nextValue)];
            }
            else if (typeof prevValue !== 'undefined') {
                throw new errors_js_1.TOMLError();
            }
            else {
                acc[key] = nextValue;
            }
        }
        return acc;
    }, {});
};
const objectify = (key, value) => {
    const initialValue = {};
    const object = key.slice(0, -1).reduce((acc, prop) => {
        acc[prop] = {};
        return acc[prop];
    }, initialValue);
    object[key[key.length - 1]] = value;
    return initialValue;
};
const normalize = (node) => {
    switch (node.type) {
        case 'ROOT_TABLE': {
            const elements = node.elements.map((element) => (0, exports.normalize)(element));
            return merge(...elements);
        }
        case 'KEY':
            return node.keys.map((key) => (0, exports.normalize)(key));
        case 'KEY_VALUE_PAIR': {
            const key = (0, exports.normalize)(node.key);
            const value = (0, exports.normalize)(node.value);
            return objectify(key, value);
        }
        case 'TABLE': {
            const key = (0, exports.normalize)(node.key);
            const elements = node.elements.map((element) => (0, exports.normalize)(element));
            return objectify(key, merge(...elements));
        }
        case 'ARRAY_TABLE': {
            const key = (0, exports.normalize)(node.key);
            const elements = node.elements.map((element) => (0, exports.normalize)(element));
            return objectify(key, [merge(...elements)]);
        }
        case 'INLINE_TABLE': {
            const elements = node.elements.map((element) => (0, exports.normalize)(element));
            return merge(...elements);
        }
        case 'ARRAY':
            return node.elements.map((element) => (0, exports.normalize)(element));
        case 'BARE':
        case 'STRING':
        case 'INTEGER':
        case 'FLOAT':
        case 'BOOLEAN':
        case 'OFFSET_DATE_TIME':
        case 'LOCAL_DATE_TIME':
        case 'LOCAL_DATE':
        case 'LOCAL_TIME':
            return node.value;
    }
};
exports.normalize = normalize;
