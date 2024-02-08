import type { RootTableNode } from './ast.js';
export declare class Parser {
    private readonly tokenizer;
    private readonly keystore;
    private readonly rootTableNode;
    private tableNode;
    constructor(input: string);
    parse(): RootTableNode;
    private expression;
    private table;
    private key;
    private keyValuePair;
    private value;
    private booleanOrNumberOrDateOrDateTimeOrTime;
    private dateOrDateTime;
    private time;
    private plus;
    private number;
    private integer;
    private float;
    private array;
    private inlineTable;
    private takeCommentsAndNewlines;
}
