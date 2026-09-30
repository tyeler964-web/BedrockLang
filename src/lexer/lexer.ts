import { TokenType } from "./tokenType";
import { Token } from "./token";

export class Lexer {

    private position = 0;

    constructor(
        private source: string
    ) {}

    tokenize(): Token[] {

        const tokens: Token[] = [];

        while (!this.isAtEnd()) {

            const character =
                this.advance();

            if (
                this.isWhitespace(
                    character
                )
            ) {
                continue;
            }

            if (character === "{") {

                tokens.push(
                    this.token(
                        TokenType.LBrace,
                        character
                    )
                );

                continue;
            }

            if (character === "}") {

                tokens.push(
                    this.token(
                        TokenType.RBrace,
                        character
                    )
                );

                continue;
            }

            if (character === "(") {

                tokens.push(
                    this.token(
                        TokenType.LParen,
                        character
                    )
                );

                continue;
            }

            if (character === ")") {

                tokens.push(
                    this.token(
                        TokenType.RParen,
                        character
                    )
                );

                continue;
            }

            if (character === ".") {

                tokens.push(
                    this.token(
                        TokenType.Dot,
                        character
                    )
                );

                continue;
            }

            if (character === '"') {

                tokens.push(
                    this.readString()
                );

                continue;
            }

            if (
                this.isIdentifierStart(
                    character
                )
            ) {

                tokens.push(
                    this.readIdentifier(
                        character
                    )
                );

                continue;
            }

            throw new Error(
                `Unexpected character '${character}' at position ${this.position - 1}`
            );
        }

        tokens.push({
            type: TokenType.EOF,
            value: ""
        });

        return tokens;
    }

    private readString(): Token {

        let value = "";

        while (
            !this.isAtEnd() &&
            this.source[this.position] !== '"'
        ) {

            value += this.advance();
        }

        if (this.isAtEnd()) {

            throw new Error(
                "Unterminated string."
            );
        }

        this.advance();

        return {
            type: TokenType.String,
            value
        };
    }

    private readIdentifier(
        firstCharacter: string
    ): Token {

        let value =
            firstCharacter;

        while (!this.isAtEnd()) {

            const character =
                this.source[this.position];

            if (
                character === undefined ||
                !this.isIdentifierPart(
                    character
                )
            ) {
                break;
            }

            value += this.advance();
        }

        switch (value) {

            case "project":

                return this.token(
                    TokenType.KeywordProject,
                    value
                );

            case "event":

                return this.token(
                    TokenType.KeywordEvent,
                    value
                );

            case "player":

                return this.token(
                    TokenType.KeywordPlayer,
                    value
                );

            case "join":

                return this.token(
                    TokenType.KeywordJoin,
                    value
                );

            case "message":

                return this.token(
                    TokenType.KeywordMessage,
                    value
                );

            case "command":

                return this.token(
                    TokenType.KeywordCommand,
                    value
                );

            default:

                return this.token(
                    TokenType.Identifier,
                    value
                );
        }
    }

    private token(
        type: TokenType,
        value: string
    ): Token {

        return {
            type,
            value
        };
    }

    private advance(): string {

        const character =
            this.source[this.position];

        if (
            character === undefined
        ) {

            throw new Error(
                "Unexpected end of source."
            );
        }

        this.position++;

        return character;
    }

    private isAtEnd(): boolean {

        return (
            this.position >=
            this.source.length
        );
    }

    private isWhitespace(
        character: string
    ): boolean {

        return /\s/.test(
            character
        );
    }

    private isIdentifierStart(
        character: string
    ): boolean {

        return /[a-zA-Z_]/.test(
            character
        );
    }

    private isIdentifierPart(
        character: string
    ): boolean {

        return /[a-zA-Z0-9_]/.test(
            character
        );
    }
}