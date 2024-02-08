import type { ArrayNode, ArrayTableNode, BareNode, BooleanNode, FloatNode, InlineTableNode, IntegerNode, KeyNode, KeyValuePairNode, LocalDateNode, LocalDateTimeNode, LocalTimeNode, Node, OffsetDateTimeNode, RootTableNode, StringNode, TableNode } from './ast.js';
import { LocalDate, LocalDateTime, LocalTime } from './types.js';
export type Value = string | bigint | number | boolean | Date | LocalDateTime | LocalDate | LocalTime | Value[] | {
    [K: string]: Value;
};
type NormalizedNode<T extends Node> = T extends KeyNode ? string[] : T extends RootTableNode | KeyValuePairNode | TableNode | ArrayTableNode | InlineTableNode ? Record<string, Value> : T extends ArrayNode ? Value[] : T extends BareNode | StringNode | IntegerNode | FloatNode | BooleanNode | OffsetDateTimeNode | LocalDateTimeNode | LocalDateNode | LocalTimeNode ? T['value'] : never;
export declare const normalize: <T extends Node>(node: T) => NormalizedNode<T>;
export {};
