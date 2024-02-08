"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const errors_js_1 = require("./errors.js");
const utils_js_1 = require("./utils.js");
const EOF = -1;
const isBare = (char) => {
    return (('A' <= char && char <= 'Z') ||
        ('a' <= char && char <= 'z') ||
        ('0' <= char && char <= '9') ||
        char === '-' ||
        char === '_');
};
const isWhitespace = (char) => {
    return char === ' ' || char === '\t';
};
const isUnicodeCharacter = (char) => {
    return char <= '\u{10ffff}';
};
const isControlCharacter = (char) => {
    return ('\u{0}' <= char && char < '\u{20}') || char === '\u{7f}';
};
const isControlCharacterOtherThanTab = (char) => {
    return isControlCharacter(char) && char !== '\t';
};
const PUNCTUATOR_OR_NEWLINE_TOKENS = {
    '\n': 'NEWLINE',
    '=': 'EQUALS',
    '.': 'PERIOD',
    ',': 'COMMA',
    ':': 'COLON',
    '+': 'PLUS',
    '{': 'LEFT_CURLY_BRACKET',
    '}': 'RIGHT_CURLY_BRACKET',
    '[': 'LEFT_SQUARE_BRACKET',
    ']': 'RIGHT_SQUARE_BRACKET',
};
const isPunctuatorOrNewline = (char) => {
    return char in PUNCTUATOR_OR_NEWLINE_TOKENS;
};
const ESCAPES = {
    'b': '\b',
    't': '\t',
    'n': '\n',
    'f': '\f',
    'r': '\r',
    '"': '"',
    '\\': '\\',
};
const isEscaped = (char) => {
    return char in ESCAPES;
};
class InputIterator {
    input;
    pos = -1;
    constructor(input) {
        this.input = input;
    }
    peek() {
        const pos = this.pos;
        const char = this.next();
        this.pos = pos;
        return char;
    }
    take(...chars) {
        const char = this.peek();
        if (char !== EOF && chars.includes(char)) {
            this.next();
            return true;
        }
        return false;
    }
    next() {
        if (this.pos + 1 === this.input.length) {
            return EOF;
        }
        this.pos++;
        const char = this.input[this.pos];
        if (char === '\r' && this.input[this.pos + 1] === '\n') {
            this.pos++;
            return '\n';
        }
        return char;
    }
}
class Tokenizer {
    input;
    iterator;
    constructor(input) {
        this.input = input;
        this.iterator = new InputIterator(input);
    }
    peek() {
        const pos = this.iterator.pos;
        try {
            const token = this.next();
            this.iterator.pos = pos;
            return token;
        }
        catch (err) {
            this.iterator.pos = pos;
            throw err;
        }
    }
    take(...types) {
        const token = this.peek();
        if (types.includes(token.type)) {
            this.next();
            return true;
        }
        return false;
    }
    assert(...types) {
        if (!this.take(...types)) {
            throw new errors_js_1.TOMLError();
        }
    }
    expect(type) {
        const token = this.next();
        if (token.type !== type) {
            throw new errors_js_1.TOMLError();
        }
        return token;
    }
    sequence(...types) {
        return types.map((type) => this.expect(type));
    }
    next() {
        const char = this.iterator.next();
        const start = this.iterator.pos;
        if (isPunctuatorOrNewline(char)) {
            return { type: PUNCTUATOR_OR_NEWLINE_TOKENS[char], value: char };
        }
        if (isBare(char)) {
            return this.scanBare(start);
        }
        switch (char) {
            case ' ':
            case '\t':
                return this.scanWhitespace(start);
            case '#':
                return this.scanComment(start);
            case "'":
                return this.scanLiteralString();
            case '"':
                return this.scanBasicString();
            case EOF:
                return { type: 'EOF' };
        }
        throw new errors_js_1.TOMLError();
    }
    scanBare(start) {
        while (isBare(this.iterator.peek())) {
            this.iterator.next();
        }
        return { type: 'BARE', value: this.input.slice(start, this.iterator.pos + 1) };
    }
    scanWhitespace(start) {
        while (isWhitespace(this.iterator.peek())) {
            this.iterator.next();
        }
        return { type: 'WHITESPACE', value: this.input.slice(start, this.iterator.pos + 1) };
    }
    scanComment(start) {
        for (;;) {
            const char = this.iterator.peek();
            if (!isControlCharacterOtherThanTab(char)) {
                this.iterator.next();
                continue;
            }
            return { type: 'COMMENT', value: this.input.slice(start, this.iterator.pos + 1) };
        }
    }
    scanString(delimiter) {
        let isMultiline = false;
        if (this.iterator.take(delimiter)) {
            if (!this.iterator.take(delimiter)) {
                return { type: 'STRING', value: '', isMultiline: false };
            }
            isMultiline = true;
        }
        if (isMultiline) {
            this.iterator.take('\n');
        }
        let value = '';
        for (;;) {
            const char = this.iterator.next();
            switch (char) {
                case '\n':
                    if (!isMultiline) {
                        throw new errors_js_1.TOMLError();
                    }
                    value += char;
                    continue;
                case delimiter:
                    if (isMultiline) {
                        if (!this.iterator.take(delimiter)) {
                            value += delimiter;
                            continue;
                        }
                        if (!this.iterator.take(delimiter)) {
                            value += delimiter;
                            value += delimiter;
                            continue;
                        }
                        if (this.iterator.take(delimiter)) {
                            value += delimiter;
                        }
                        if (this.iterator.take(delimiter)) {
                            value += delimiter;
                        }
                    }
                    break;
                case undefined:
                    throw new errors_js_1.TOMLError();
                default:
                    if (isControlCharacterOtherThanTab(char)) {
                        throw new errors_js_1.TOMLError();
                    }
                    switch (delimiter) {
                        case "'":
                            value += char;
                            continue;
                        case '"':
                            if (char === '\\') {
                                const char = this.iterator.next();
                                if (isEscaped(char)) {
                                    value += ESCAPES[char];
                                    continue;
                                }
                                if (char === 'u' || char === 'U') {
                                    const size = char === 'u' ? 4 : 8;
                                    let codePoint = '';
                                    for (let i = 0; i < size; i++) {
                                        const char = this.iterator.next();
                                        if (char === EOF || !(0, utils_js_1.isHexadecimal)(char)) {
                                            throw new errors_js_1.TOMLError();
                                        }
                                        codePoint += char;
                                    }
                                    const result = String.fromCodePoint(parseInt(codePoint, 16));
                                    if (!isUnicodeCharacter(result)) {
                                        throw new errors_js_1.TOMLError();
                                    }
                                    value += result;
                                    continue;
                                }
                                if (isMultiline && (isWhitespace(char) || char === '\n')) {
                                    while (this.iterator.take(' ', '\t', '\n')) {
                                    }
                                    continue;
                                }
                                throw new errors_js_1.TOMLError();
                            }
                            value += char;
                            continue;
                    }
            }
            break;
        }
        return { type: 'STRING', value, isMultiline };
    }
    scanLiteralString() {
        return this.scanString("'");
    }
    scanBasicString() {
        return this.scanString('"');
    }
}
exports.Tokenizer = Tokenizer;
