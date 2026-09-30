import { TokenType } from "./tokenType";

export interface Token {
    type: TokenType;
    value: string;
}