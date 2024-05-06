"use strict";
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArray = exports.parseInlineTable = exports.parseKey = void 0;
const primitive_js_1 = require("./primitive.js");
const extract_js_1 = require("./extract.js");
const util_js_1 = require("./util.js");
const error_js_1 = require("./error.js");
let KEY_PART_RE = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(str, ptr, end = '=') {
    let dot = ptr - 1;
    let parsed = [];
    let endPtr = str.indexOf(end, ptr);
    if (endPtr < 0) {
        throw new error_js_1.default('incomplete key-value: cannot find end of key', {
            toml: str,
            ptr: ptr
        });
    }
    do {
        let c = str[ptr = ++dot];
        if (c !== ' ' && c !== '\t') {
            if (c === '"' || c === "'") {
                if (c === str[ptr + 1] && c === str[ptr + 2]) {
                    throw new error_js_1.default('multiline strings are not allowed in keys', {
                        toml: str,
                        ptr: ptr,
                    });
                }
                let eos = (0, util_js_1.getStringEnd)(str, ptr);
                if (eos < 0) {
                    throw new error_js_1.default('unfinished string encountered', {
                        toml: str,
                        ptr: ptr,
                    });
                }
                dot = str.indexOf('.', eos);
                let strEnd = str.slice(eos, dot < 0 || dot > endPtr ? endPtr : dot);
                let newLine = (0, util_js_1.indexOfNewline)(strEnd);
                if (newLine > -1) {
                    throw new error_js_1.default('newlines are not allowed in keys', {
                        toml: str,
                        ptr: ptr + dot + newLine,
                    });
                }
                if (strEnd.trimStart()) {
                    throw new error_js_1.default('found extra tokens after the string part', {
                        toml: str,
                        ptr: eos,
                    });
                }
                if (endPtr < eos) {
                    endPtr = str.indexOf(end, eos);
                    if (endPtr < 0) {
                        throw new error_js_1.default('incomplete key-value: cannot find end of key', {
                            toml: str,
                            ptr: ptr,
                        });
                    }
                }
                parsed.push((0, primitive_js_1.parseString)(str, ptr, eos));
            }
            else {
                dot = str.indexOf('.', ptr);
                let part = str.slice(ptr, dot < 0 || dot > endPtr ? endPtr : dot);
                if (!KEY_PART_RE.test(part)) {
                    throw new error_js_1.default('only letter, numbers, dashes and underscores are allowed in keys', {
                        toml: str,
                        ptr: ptr,
                    });
                }
                parsed.push(part.trimEnd());
            }
        }
    } while (dot + 1 && dot < endPtr);
    return [parsed, (0, util_js_1.skipVoid)(str, endPtr + 1, true, true)];
}
exports.parseKey = parseKey;
function parseInlineTable(str, ptr) {
    let res = {};
    let seen = new Set();
    let c;
    let comma = 0;
    ptr++;
    while ((c = str[ptr++]) !== '}' && c) {
        if (c === '\n') {
            throw new error_js_1.default('newlines are not allowed in inline tables', {
                toml: str,
                ptr: ptr - 1
            });
        }
        else if (c === '#') {
            throw new error_js_1.default('inline tables cannot contain comments', {
                toml: str,
                ptr: ptr - 1
            });
        }
        else if (c === ',') {
            throw new error_js_1.default('expected key-value, found comma', {
                toml: str,
                ptr: ptr - 1
            });
        }
        else if (c !== ' ' && c !== '\t') {
            let k;
            let t = res;
            let hasOwn = false;
            let [key, keyEndPtr] = parseKey(str, ptr - 1);
            for (let i = 0; i < key.length; i++) {
                if (i)
                    t = hasOwn ? t[k] : (t[k] = {});
                k = key[i];
                if ((hasOwn = Object.hasOwn(t, k)) && (typeof t[k] !== 'object' || seen.has(t[k]))) {
                    throw new error_js_1.default('trying to redefine an already defined value', {
                        toml: str,
                        ptr: ptr
                    });
                }
                if (!hasOwn && k === '__proto__') {
                    Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
                }
            }
            if (hasOwn) {
                throw new error_js_1.default('trying to redefine an already defined value', {
                    toml: str,
                    ptr: ptr
                });
            }
            let [value, valueEndPtr] = (0, extract_js_1.extractValue)(str, keyEndPtr, '}');
            seen.add(value);
            t[k] = value;
            ptr = valueEndPtr;
            comma = str[ptr - 1] === ',' ? ptr - 1 : 0;
        }
    }
    if (comma) {
        throw new error_js_1.default('trailing commas are not allowed in inline tables', {
            toml: str,
            ptr: comma
        });
    }
    if (!c) {
        throw new error_js_1.default('unfinished table encountered', {
            toml: str,
            ptr: ptr
        });
    }
    return [res, ptr];
}
exports.parseInlineTable = parseInlineTable;
function parseArray(str, ptr) {
    let res = [];
    let c;
    ptr++;
    while ((c = str[ptr++]) !== ']' && c) {
        if (c === ',') {
            throw new error_js_1.default('expected value, found comma', {
                toml: str,
                ptr: ptr - 1
            });
        }
        else if (c === '#')
            ptr = (0, util_js_1.skipComment)(str, ptr);
        else if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') {
            let e = (0, extract_js_1.extractValue)(str, ptr - 1, ']');
            res.push(e[0]);
            ptr = e[1];
        }
    }
    if (!c) {
        throw new error_js_1.default('unfinished array encountered', {
            toml: str,
            ptr: ptr
        });
    }
    return [res, ptr];
}
exports.parseArray = parseArray;
