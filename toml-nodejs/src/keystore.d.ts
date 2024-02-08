import type { ArrayTableNode, KeyValuePairNode, TableNode } from './ast.js';
export declare class Keystore {
    private readonly keys;
    private readonly tables;
    private readonly implicitTables;
    private readonly arrayTables;
    addNode(node: KeyValuePairNode | TableNode | ArrayTableNode): void;
    private addKeyValuePairNode;
    private addTableNode;
    private addArrayTableNode;
}
