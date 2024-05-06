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
exports.extractValue = void 0;
const primitive_js_1 = require("./primitive.js");
const struct_js_1 = require("./struct.js");
const util_js_1 = require("./util.js");
const error_js_1 = require("./error.js");
function sliceAndTrimEndOf(str, startPtr, endPtr, allowNewLines) {
    let value = str.slice(startPtr, endPtr);
    let commentIdx = value.indexOf('#');
    if (commentIdx > -1) {
        (0, util_js_1.skipComment)(str, commentIdx);
        value = value.slice(0, commentIdx);
    }
    let trimmed = value.trimEnd();
    if (!allowNewLines) {
        let newlineIdx = value.indexOf('\n', trimmed.length);
        if (newlineIdx > -1) {
            throw new error_js_1.default('newlines are not allowed in inline tables', {
                toml: str,
                ptr: startPtr + newlineIdx
            });
        }
    }
    return [trimmed, commentIdx];
}
function extractValue(str, ptr, end) {
    let c = str[ptr];
    if (c === '[' || c === '{') {
        let [value, endPtr] = c === '['
            ? (0, struct_js_1.parseArray)(str, ptr)
            : (0, struct_js_1.parseInlineTable)(str, ptr);
        let newPtr = (0, util_js_1.skipUntil)(str, endPtr, ',', end);
        if (end === '}') {
            let nextNewLine = (0, util_js_1.indexOfNewline)(str, endPtr, newPtr);
            if (nextNewLine > -1) {
                throw new error_js_1.default('newlines are not allowed in inline tables', {
                    toml: str,
                    ptr: nextNewLine
                });
            }
        }
        return [value, newPtr];
    }
    let endPtr;
    if (c === '"' || c === "'") {
        endPtr = (0, util_js_1.getStringEnd)(str, ptr);
        let parsed = (0, primitive_js_1.parseString)(str, ptr, endPtr);
        if (end) {
            endPtr = (0, util_js_1.skipVoid)(str, endPtr, end !== ']');
            if (str[endPtr] && str[endPtr] !== ',' && str[endPtr] !== end && str[endPtr] !== '\n' && str[endPtr] !== '\r') {
                throw new error_js_1.default('unexpected character encountered', {
                    toml: str,
                    ptr: endPtr,
                });
            }
            endPtr += (+(str[endPtr] === ','));
        }
        return [parsed, endPtr];
    }
    endPtr = (0, util_js_1.skipUntil)(str, ptr, ',', end);
    let slice = sliceAndTrimEndOf(str, ptr, endPtr - (+(str[endPtr - 1] === ',')), end === ']');
    if (!slice[0]) {
        throw new error_js_1.default('incomplete key-value declaration: no value specified', {
            toml: str,
            ptr: ptr
        });
    }
    if (end && slice[1] > -1) {
        endPtr = (0, util_js_1.skipVoid)(str, ptr + slice[1]);
        endPtr += +(str[endPtr] === ',');
    }
    return [
        (0, primitive_js_1.parseValue)(slice[0], str, ptr),
        endPtr,
    ];
}
exports.extractValue = extractValue;
