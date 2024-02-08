interface BaseToken<T extends string> {
    type: T;
    value: string;
}
type WhitespaceToken = BaseToken<'WHITESPACE'>;
type NewlineToken = BaseToken<'NEWLINE'>;
type CommentToken = BaseToken<'COMMENT'>;
type EqualsToken = BaseToken<'EQUALS'>;
type PeriodToken = BaseToken<'PERIOD'>;
type CommaToken = BaseToken<'COMMA'>;
type ColonToken = BaseToken<'COLON'>;
type PLusToken = BaseToken<'PLUS'>;
type LeftSquareBracketToken = BaseToken<'LEFT_SQUARE_BRACKET'>;
type RightSquareBracketToken = BaseToken<'RIGHT_SQUARE_BRACKET'>;
type LeftCurlyBracketToken = BaseToken<'LEFT_CURLY_BRACKET'>;
type RightCurlyBracketToken = BaseToken<'RIGHT_CURLY_BRACKET'>;
type BareToken = BaseToken<'BARE'>;
interface EOFToken {
    type: 'EOF';
}
interface StringToken extends BaseToken<'STRING'> {
    isMultiline: boolean;
}
type Token = WhitespaceToken | NewlineToken | CommentToken | EqualsToken | PeriodToken | CommaToken | ColonToken | PLusToken | LeftSquareBracketToken | RightSquareBracketToken | LeftCurlyBracketToken | RightCurlyBracketToken | BareToken | EOFToken | StringToken;
type TokenFromType<T extends Token['type']> = Extract<Token, {
    type: T;
}>;
export declare class Tokenizer {
    private readonly input;
    private readonly iterator;
    constructor(input: string);
    peek(): Token;
    take(...types: Token['type'][]): boolean;
    assert(...types: Token['type'][]): void;
    expect<T extends Token['type']>(type: T): TokenFromType<T>;
    sequence<T1 extends Token['type'], T2 extends Token['type'], T3 extends Token['type']>(type1: T1, type2: T2, type3: T3): [TokenFromType<T1>, TokenFromType<T2>, TokenFromType<T3>];
    sequence<T1 extends Token['type'], T2 extends Token['type'], T3 extends Token['type'], T4 extends Token['type']>(type1: T1, type2: T2, type3: T3, type4: T4): [TokenFromType<T1>, TokenFromType<T2>, TokenFromType<T3>, TokenFromType<T4>];
    next(): Token;
    private scanBare;
    private scanWhitespace;
    private scanComment;
    private scanString;
    private scanLiteralString;
    private scanBasicString;
}
export {};
