import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";

import {
    BedrockProjectIR
} from "../ir/ir";

import {
    IRBuilder
} from "../ir/irBuilder";

import {
    SemanticAnalyzer
} from "../semantic/semanticAnalyzer";

import {
    BedrockProjectGenerator
} from "../generators/bedrockProjectGenerator";

export class Compiler {

    compile(
        source: string
    ): BedrockProjectIR {

        const lexer =
            new Lexer(source);

        const tokens =
            lexer.tokenize();

        const parser =
            new Parser(tokens);

        const ast =
            parser.parse();

        const analyzer =
            new SemanticAnalyzer();

        analyzer.analyze(ast);

        const irBuilder =
            new IRBuilder();

        const ir =
            irBuilder.build(ast);

        const projectGenerator =
            new BedrockProjectGenerator();

        projectGenerator.generate(
            ir
        );

        return ir;
    }
}