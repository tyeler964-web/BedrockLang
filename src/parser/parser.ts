import { Token } from "../lexer/token";
import { TokenType } from "../lexer/tokenType";

import {
    ProgramNode,
    DeclarationNode,
    ProjectNode,
    EventNode,
    StatementNode,
    PlayerMessageNode,
    CommandNode
} from "./ast";

export class Parser {

    private position = 0;

    constructor(
        private tokens: Token[]
    ) {}

    parse(): ProgramNode {

        const declarations:
            DeclarationNode[] = [];

        while (
            !this.check(
                TokenType.EOF
            )
        ) {

            declarations.push(
                this.parseDeclaration()
            );
        }

        return {
            type: "Program",
            declarations
        };
    }

    private parseDeclaration():
        DeclarationNode {

        if (
            this.match(
                TokenType.KeywordProject
            )
        ) {

            return this.parseProject();
        }

        if (
            this.match(
                TokenType.KeywordEvent
            )
        ) {

            return this.parseEvent();
        }

        throw this.error(
            `Unexpected token: ${this.current().value}`
        );
    }

    private parseProject():
        ProjectNode {

        const name =
            this.consume(
                TokenType.String,
                "Expected project name."
            );

        return {
            type: "Project",
            name: name.value
        };
    }

    private parseEvent():
        EventNode {

        const target =
            this.consume(
                TokenType.KeywordPlayer,
                "Expected 'player' after 'event'."
            );

        this.consume(
            TokenType.Dot,
            "Expected '.' after 'player'."
        );

        const event =
            this.parsePlayerEventName();

        this.consume(
            TokenType.LBrace,
            "Expected '{' before event body."
        );

        const body:
            StatementNode[] = [];

        while (
            !this.check(
                TokenType.RBrace
            ) &&
            !this.check(
                TokenType.EOF
            )
        ) {

            body.push(
                this.parseStatement()
            );
        }

        this.consume(
            TokenType.RBrace,
            "Expected '}' after event body."
        );

        return {
            type: "Event",
            target: target.value,
            event: event.value,
            body
        };
    }

    private parsePlayerEventName():
        Token {

        if (
            this.check(
                TokenType.KeywordJoin
            )
        ) {

            return this.advance();
        }

        if (
            this.check(
                TokenType.Identifier
            )
        ) {

            const event =
                this.advance();

            if (
                event.value !== "leave"
            ) {

                throw this.error(
                    `Unsupported player event '${event.value}'.`
                );
            }

            return event;
        }

        throw this.error(
            "Expected player event name."
        );
    }

    private parseStatement():
        StatementNode {

        if (
            this.match(
                TokenType.KeywordPlayer
            )
        ) {

            return this.parsePlayerMessage();
        }

        if (
            this.match(
                TokenType.KeywordCommand
            )
        ) {

            return this.parseCommand();
        }

        throw this.error(
            `Unexpected statement: ${this.current().value}`
        );
    }

    private parsePlayerMessage():
        PlayerMessageNode {

        this.consume(
            TokenType.Dot,
            "Expected '.' after 'player'."
        );

        this.consume(
            TokenType.KeywordMessage,
            "Expected 'message'."
        );

        this.consume(
            TokenType.LParen,
            "Expected '('."
        );

        const message =
            this.consume(
                TokenType.String,
                "Expected message text."
            );

        this.consume(
            TokenType.RParen,
            "Expected ')'."
        );

        return {
            type: "PlayerMessage",
            message: message.value
        };
    }

    private parseCommand():
        CommandNode {

        const command =
            this.consume(
                TokenType.String,
                "Expected command text."
            );

        return {
            type: "Command",
            command: command.value
        };
    }

    private match(
        type: TokenType
    ): boolean {

        if (
            this.check(type)
        ) {

            this.advance();

            return true;
        }

        return false;
    }

    private check(
        type: TokenType
    ): boolean {

        return (
            this.current().type === type
        );
    }

    private advance(): Token {

        if (
            !this.check(
                TokenType.EOF
            )
        ) {

            this.position++;
        }

        return this.previous();
    }

    private current(): Token {

        const token =
            this.tokens[this.position];

        if (
            token === undefined
        ) {

            throw new Error(
                "Parser reached an invalid token position."
            );
        }

        return token;
    }

    private previous(): Token {

        const token =
            this.tokens[
                this.position - 1
            ];

        if (
            token === undefined
        ) {

            throw new Error(
                "Parser has no previous token."
            );
        }

        return token;
    }

    private consume(
        type: TokenType,
        message: string
    ): Token {

        if (
            this.check(type)
        ) {

            return this.advance();
        }

        throw this.error(
            message
        );
    }

    private error(
        message: string
    ): Error {

        return new Error(
            `${message} Found '${this.current().value}' at position ${this.position}.`
        );
    }
}