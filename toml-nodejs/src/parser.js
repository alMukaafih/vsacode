"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const tokenizer_js_1 = require("./tokenizer.js");
const errors_js_1 = require("./errors.js");
const types_js_1 = require("./types.js");
const utils_js_1 = require("./utils.js");
const keystore_js_1 = require("./keystore.js");
const DIGIT_CHECKS = {
    [10]: utils_js_1.isDecimal,
    [16]: utils_js_1.isHexadecimal,
    [8]: utils_js_1.isOctal,
    [2]: utils_js_1.isBinary,
};
const RADIX_PREFIXES = {
    [10]: '',
    [16]: '0x',
    [8]: '0o',
    [2]: '0b',
};
const parseInteger = (value, isSignAllowed, areLeadingZerosAllowed, isUnparsedAllowed, radix) => {
    let i = 0;
    if (value[i] === '+' || value[i] === '-') {
        if (!isSignAllowed) {
            throw new errors_js_1.TOMLError();
        }
        i++;
    }
    if (!areLeadingZerosAllowed && value[i] === '0' && i + 1 !== value.length) {
        throw new errors_js_1.TOMLError();
    }
    let isUnderscoreAllowed = false;
    for (; i < value.length; i++) {
        const char = value[i];
        if (char === '_') {
            if (!isUnderscoreAllowed) {
                throw new errors_js_1.TOMLError();
            }
            isUnderscoreAllowed = false;
            continue;
        }
        if (!DIGIT_CHECKS[radix](char)) {
            break;
        }
        isUnderscoreAllowed = true;
    }
    if (!isUnderscoreAllowed) {
        throw new errors_js_1.TOMLError();
    }
    const int = value.slice(0, i).replaceAll('_', '');
    const unparsed = value.slice(i);
    if (!isUnparsedAllowed && unparsed !== '') {
        throw new errors_js_1.TOMLError();
    }
    return { int, unparsed };
};
const MAX_INTEGER = 2n ** (64n - 1n) - 1n;
const parseBigInt = (value, radix) => {
    let int;
    try {
        int = BigInt(`${RADIX_PREFIXES[radix]}${value}`);
    }
    catch {
        throw new errors_js_1.TOMLError();
    }
    if (int > MAX_INTEGER) {
        throw new errors_js_1.TOMLError();
    }
    return int;
};
const parseDate = (value) => {
    try {
        return new Date(value);
    }
    catch {
        throw new errors_js_1.TOMLError();
    }
};
class Parser {
    tokenizer;
    keystore;
    rootTableNode;
    tableNode;
    constructor(input) {
        this.tokenizer = new tokenizer_js_1.Tokenizer(input);
        this.keystore = new keystore_js_1.Keystore();
        this.rootTableNode = { type: 'ROOT_TABLE', elements: [] };
        this.tableNode = this.rootTableNode;
    }
    parse() {
        for (;;) {
            const node = this.expression();
            if (!node) {
                break;
            }
            this.tokenizer.take('WHITESPACE');
            this.tokenizer.take('COMMENT');
            this.tokenizer.assert('NEWLINE', 'EOF');
            this.keystore.addNode(node);
            if (node.type === 'ARRAY_TABLE' || node.type === 'TABLE') {
                this.tableNode = node;
                this.rootTableNode.elements.push(node);
            }
            else {
                this.tableNode.elements.push(node);
            }
        }
        return this.rootTableNode;
    }
    expression() {
        this.takeCommentsAndNewlines();
        const token = this.tokenizer.peek();
        switch (token.type) {
            case 'LEFT_SQUARE_BRACKET':
                return this.table();
            case 'EOF':
                return null;
            default:
                return this.keyValuePair();
        }
    }
    table() {
        this.tokenizer.next();
        const isArrayTable = this.tokenizer.take('LEFT_SQUARE_BRACKET');
        const key = this.key();
        this.tokenizer.assert('RIGHT_SQUARE_BRACKET');
        if (isArrayTable) {
            this.tokenizer.assert('RIGHT_SQUARE_BRACKET');
        }
        return { type: isArrayTable ? 'ARRAY_TABLE' : 'TABLE', key, elements: [] };
    }
    key() {
        const keyNode = { type: 'KEY', keys: [] };
        do {
            this.tokenizer.take('WHITESPACE');
            const token = this.tokenizer.next();
            switch (token.type) {
                case 'BARE':
                    keyNode.keys.push({ type: 'BARE', value: token.value });
                    break;
                case 'STRING':
                    if (token.isMultiline) {
                        throw new errors_js_1.TOMLError();
                    }
                    keyNode.keys.push({ type: 'STRING', value: token.value });
                    break;
                default:
                    throw new errors_js_1.TOMLError();
            }
            this.tokenizer.take('WHITESPACE');
        } while (this.tokenizer.take('PERIOD'));
        return keyNode;
    }
    keyValuePair() {
        const key = this.key();
        this.tokenizer.assert('EQUALS');
        this.tokenizer.take('WHITESPACE');
        const value = this.value();
        return { type: 'KEY_VALUE_PAIR', key, value };
    }
    value() {
        const token = this.tokenizer.next();
        switch (token.type) {
            case 'STRING':
                return { type: 'STRING', value: token.value };
            case 'BARE':
                return this.booleanOrNumberOrDateOrDateTimeOrTime(token.value);
            case 'PLUS':
                return this.plus();
            case 'LEFT_SQUARE_BRACKET':
                return this.array();
            case 'LEFT_CURLY_BRACKET':
                return this.inlineTable();
            default:
                throw new errors_js_1.TOMLError();
        }
    }
    booleanOrNumberOrDateOrDateTimeOrTime(value) {
        if (value === 'true' || value === 'false') {
            return { type: 'BOOLEAN', value: value === 'true' };
        }
        if (value.includes('-', 1) && !value.includes('e-') && !value.includes('E-')) {
            return this.dateOrDateTime(value);
        }
        if (this.tokenizer.peek().type === 'COLON') {
            return this.time(value);
        }
        return this.number(value);
    }
    dateOrDateTime(value) {
        const token = this.tokenizer.peek();
        if (token.type === 'WHITESPACE' && token.value === ' ') {
            this.tokenizer.next();
            const token = this.tokenizer.peek();
            if (token.type !== 'BARE') {
                return { type: 'LOCAL_DATE', value: types_js_1.LocalDate.fromString(value) };
            }
            this.tokenizer.next();
            value += 'T';
            value += token.value;
        }
        if (!value.includes('T') && !value.includes('t')) {
            return { type: 'LOCAL_DATE', value: types_js_1.LocalDate.fromString(value) };
        }
        const tokens = this.tokenizer.sequence('COLON', 'BARE', 'COLON', 'BARE');
        value += tokens.reduce((prevValue, token) => prevValue + token.value, '');
        if (tokens[tokens.length - 1].value.endsWith('Z')) {
            return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
        }
        if (tokens[tokens.length - 1].value.includes('-')) {
            this.tokenizer.assert('COLON');
            const token = this.tokenizer.expect('BARE');
            value += ':';
            value += token.value;
            return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
        }
        switch (this.tokenizer.peek().type) {
            case 'PLUS': {
                this.tokenizer.next();
                const tokens = this.tokenizer.sequence('BARE', 'COLON', 'BARE');
                value += '+';
                value += tokens.reduce((prevValue, token) => prevValue + token.value, '');
                return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
            }
            case 'PERIOD': {
                this.tokenizer.next();
                const token = this.tokenizer.expect('BARE');
                value += '.';
                value += token.value;
                if (token.value.endsWith('Z')) {
                    return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
                }
                if (token.value.includes('-')) {
                    this.tokenizer.assert('COLON');
                    const token = this.tokenizer.expect('BARE');
                    value += ':';
                    value += token.value;
                    return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
                }
                if (this.tokenizer.take('PLUS')) {
                    const tokens = this.tokenizer.sequence('BARE', 'COLON', 'BARE');
                    value += '+';
                    value += tokens.reduce((prevValue, token) => prevValue + token.value, '');
                    return { type: 'OFFSET_DATE_TIME', value: parseDate(value) };
                }
                break;
            }
        }
        return { type: 'LOCAL_DATE_TIME', value: types_js_1.LocalDateTime.fromString(value) };
    }
    time(value) {
        const tokens = this.tokenizer.sequence('COLON', 'BARE', 'COLON', 'BARE');
        value += tokens.reduce((prevValue, token) => prevValue + token.value, '');
        if (this.tokenizer.take('PERIOD')) {
            const token = this.tokenizer.expect('BARE');
            value += '.';
            value += token.value;
        }
        return { type: 'LOCAL_TIME', value: types_js_1.LocalTime.fromString(value) };
    }
    plus() {
        const token = this.tokenizer.expect('BARE');
        return this.number(`+${token.value}`);
    }
    number(value) {
        switch (value) {
            case 'inf':
            case '+inf':
                return { type: 'FLOAT', value: Infinity };
            case '-inf':
                return { type: 'FLOAT', value: -Infinity };
            case 'nan':
            case '+nan':
            case '-nan':
                return { type: 'FLOAT', value: NaN };
        }
        if (value.startsWith('0x')) {
            return this.integer(value.slice(2), 16);
        }
        if (value.startsWith('0o')) {
            return this.integer(value.slice(2), 8);
        }
        if (value.startsWith('0b')) {
            return this.integer(value.slice(2), 2);
        }
        if (value.includes('e') || value.includes('E') || this.tokenizer.peek().type === 'PERIOD') {
            return this.float(value);
        }
        return this.integer(value, 10);
    }
    integer(value, radix) {
        const isSignAllowed = radix === 10;
        const areLeadingZerosAllowed = radix !== 10;
        const { int } = parseInteger(value, isSignAllowed, areLeadingZerosAllowed, false, radix);
        return { type: 'INTEGER', value: parseBigInt(int, radix) };
    }
    float(value) {
        let { int: float, unparsed } = parseInteger(value, true, false, true, 10);
        if (this.tokenizer.take('PERIOD')) {
            if (unparsed !== '') {
                throw new errors_js_1.TOMLError();
            }
            const token = this.tokenizer.expect('BARE');
            const result = parseInteger(token.value, false, true, true, 10);
            float += `.${result.int}`;
            unparsed = result.unparsed;
        }
        if (unparsed.startsWith('e') || unparsed.startsWith('E')) {
            float += 'e';
            if (unparsed.length === 1) {
                this.tokenizer.assert('PLUS');
                const token = this.tokenizer.expect('BARE');
                float += '+';
                float += parseInteger(token.value, false, true, false, 10).int;
            }
            else {
                float += parseInteger(unparsed.slice(1), true, true, false, 10).int;
            }
        }
        else if (unparsed !== '') {
            throw new errors_js_1.TOMLError();
        }
        return { type: 'FLOAT', value: parseFloat(float) };
    }
    array() {
        const arrayNode = { type: 'ARRAY', elements: [] };
        for (;;) {
            this.takeCommentsAndNewlines();
            if (this.tokenizer.peek().type === 'RIGHT_SQUARE_BRACKET') {
                break;
            }
            const value = this.value();
            arrayNode.elements.push(value);
            this.takeCommentsAndNewlines();
            if (!this.tokenizer.take('COMMA')) {
                this.takeCommentsAndNewlines();
                break;
            }
        }
        this.tokenizer.assert('RIGHT_SQUARE_BRACKET');
        return arrayNode;
    }
    inlineTable() {
        this.tokenizer.take('WHITESPACE');
        const inlineTableNode = { type: 'INLINE_TABLE', elements: [] };
        if (this.tokenizer.take('RIGHT_CURLY_BRACKET')) {
            return inlineTableNode;
        }
        const keystore = new keystore_js_1.Keystore();
        for (;;) {
            const keyValue = this.keyValuePair();
            keystore.addNode(keyValue);
            inlineTableNode.elements.push(keyValue);
            this.tokenizer.take('WHITESPACE');
            if (this.tokenizer.take('RIGHT_CURLY_BRACKET')) {
                break;
            }
            this.tokenizer.assert('COMMA');
        }
        return inlineTableNode;
    }
    takeCommentsAndNewlines() {
        for (;;) {
            this.tokenizer.take('WHITESPACE');
            if (this.tokenizer.take('COMMENT')) {
                this.tokenizer.assert('NEWLINE');
                continue;
            }
            if (!this.tokenizer.take('NEWLINE')) {
                break;
            }
        }
    }
}
exports.Parser = Parser;
