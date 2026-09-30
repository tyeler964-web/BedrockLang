import {
    ProgramNode,
    ProjectNode,
    EventNode,
    StatementNode,
    PlayerMessageNode,
    CommandNode
} from "../parser/ast";

import {
    BedrockProjectIR,
    BehaviorPackIR,
    ResourcePackIR,
    BedrockEventIR,
    BedrockStatementIR,
    BedrockPlayerMessageIR,
    BedrockCommandIR
} from "./ir";

export class IRBuilder {

    build(
        ast: ProgramNode
    ): BedrockProjectIR {

        const project =
            this.findProject(ast);

        const events =
            ast.declarations
                .filter(
                    (
                        declaration
                    ): declaration is EventNode =>
                        declaration.type === "Event"
                )
                .map(
                    event =>
                        this.buildEvent(
                            event
                        )
                );

        const behaviorPack:
            BehaviorPackIR = {

            type:
                "BehaviorPack",

            name:
                `${project.name} Behavior Pack`,

            events
        };

        const resourcePack:
            ResourcePackIR = {

            type:
                "ResourcePack",

            name:
                `${project.name} Resource Pack`
        };

        return {

            type:
                "BedrockProject",

            name:
                project.name,

            behaviorPack,

            resourcePack
        };
    }

    private findProject(
        ast: ProgramNode
    ): ProjectNode {

        const project =
            ast.declarations.find(
                (
                    declaration
                ): declaration is ProjectNode =>
                    declaration.type === "Project"
            );

        if (!project) {

            throw new Error(
                "IR error: Project declaration was not found."
            );
        }

        return project;
    }

    private buildEvent(
        event: EventNode
    ): BedrockEventIR {

        const statements:
            BedrockStatementIR[] = [];

        const commands:
            BedrockCommandIR[] = [];

        for (
            const statement
            of event.body
        ) {

            if (
                statement.type === "Command"
            ) {

                commands.push(
                    this.buildCommand(
                        statement
                    )
                );

                continue;
            }

            statements.push(
                this.buildStatement(
                    statement
                )
            );
        }

        return {

            type:
                "Event",

            target:
                event.target,

            event:
                event.event,

            statements,

            commands
        };
    }

    private buildCommand(
        statement: CommandNode
    ): BedrockCommandIR {

        return {

            type:
                "Command",

            command:
                statement.command
        };
    }

    private buildStatement(
        statement: StatementNode
    ): BedrockStatementIR {

        switch (
            statement.type
        ) {

            case "PlayerMessage":

                return this.buildPlayerMessage(
                    statement
                );

            case "Command":

                throw new Error(
                    "IR error: Command reached the statement builder unexpectedly."
                );

            default:

                throw new Error(
                    "IR error: Unsupported statement."
                );
        }
    }

    private buildPlayerMessage(
        statement: PlayerMessageNode
    ): BedrockPlayerMessageIR {

        return {

            type:
                "PlayerMessage",

            message:
                statement.message
        };
    }
}