"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keystore = void 0;
const errors_js_1 = require("./errors.js");
const makeKeyComponents = (keyNode) => {
    return keyNode.keys.map((key) => key.value);
};
const makeKey = (keyNode) => {
    return makeKeyComponents(keyNode).join('.');
};
const makeHeaderFromArrayTable = (arrayTable) => {
    return arrayTable
        .split('.')
        .filter((component) => !component.startsWith('['))
        .join('.');
};
class Keystore {
    keys = new Set();
    tables = [];
    implicitTables = new Set();
    arrayTables = [];
    addNode(node) {
        switch (node.type) {
            case 'KEY_VALUE_PAIR':
                return this.addKeyValuePairNode(node);
            case 'TABLE':
                return this.addTableNode(node);
            case 'ARRAY_TABLE':
                return this.addArrayTableNode(node);
        }
    }
    addKeyValuePairNode(keyValuePairNode) {
        const table = this.tables[this.tables.length - 1];
        let key = '';
        if (table) {
            key += `${table}.`;
        }
        const components = makeKeyComponents(keyValuePairNode.key);
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (i === 0) {
                key += component;
            }
            else {
                key += `.${component}`;
            }
            if (this.keys.has(key) || this.tables.includes(key)) {
                throw new errors_js_1.TOMLError();
            }
            if (components.length > 1 && i < components.length - 1) {
                this.implicitTables.add(key);
            }
            else if (this.implicitTables.has(key)) {
                throw new errors_js_1.TOMLError();
            }
        }
        this.keys.add(key);
    }
    addTableNode(tableNode) {
        let components = makeKeyComponents(tableNode.key);
        const header = components.join('.');
        const arrayTable = [...this.arrayTables]
            .reverse()
            .find((arrayTable) => header.startsWith(makeHeaderFromArrayTable(arrayTable)));
        let key = '';
        if (typeof arrayTable !== 'undefined') {
            components = header
                .slice(makeHeaderFromArrayTable(arrayTable).length)
                .split('.')
                .filter((component) => component !== '');
            if (!components.length) {
                throw new errors_js_1.TOMLError();
            }
            key = `${arrayTable}.`;
        }
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (i === 0) {
                key += component;
            }
            else {
                key += `.${component}`;
            }
            if (this.keys.has(key)) {
                throw new errors_js_1.TOMLError();
            }
        }
        if (this.arrayTables.includes(key) || this.tables.includes(key) || this.implicitTables.has(key)) {
            throw new errors_js_1.TOMLError();
        }
        this.tables.push(key);
    }
    addArrayTableNode(arrayTableNode) {
        const header = makeKey(arrayTableNode.key);
        if (this.keys.has(header)) {
            throw new errors_js_1.TOMLError();
        }
        if (this.tables.includes(header) || this.implicitTables.has(header)) {
            throw new errors_js_1.TOMLError();
        }
        let key = header;
        let index = 0;
        for (let i = this.arrayTables.length - 1; i >= 0; i--) {
            const arrayTable = this.arrayTables[i];
            const arrayTableHeader = makeHeaderFromArrayTable(arrayTable);
            if (arrayTableHeader === header) {
                index++;
                continue;
            }
            if (header.startsWith(arrayTableHeader)) {
                key = `${arrayTable}${header.slice(arrayTableHeader.length)}`;
                break;
            }
        }
        if (index === 0 && this.tables.some((table) => table.startsWith(header))) {
            throw new errors_js_1.TOMLError();
        }
        if (this.keys.has(key) || this.tables.includes(key)) {
            throw new errors_js_1.TOMLError();
        }
        key += `.[${index}]`;
        this.arrayTables.push(key);
        this.tables.push(key);
    }
}
exports.Keystore = Keystore;
