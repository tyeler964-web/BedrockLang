import {
    ProgramNode,
    EventNode,
    StatementNode,
    ProjectNode
} from "../parser/ast";

export class SemanticAnalyzer {

    analyze(
        ast: ProgramNode
    ): void {

        this.validateProjectDeclarations(
            ast
        );

        const project =
            this.findProject(
                ast
            );

        this.validateProject(
            project
        );

        for (
            const declaration
            of ast.declarations
        ) {

            if (
                declaration.type === "Event"
            ) {

                this.validateEvent(
                    declaration
                );
            }
        }
    }

    private validateProjectDeclarations(
        ast: ProgramNode
    ): void {

        const projects =
            ast.declarations.filter(
                declaration =>
                    declaration.type === "Project"
            );

        if (
            projects.length === 0
        ) {

            throw new Error(
                "Semantic error: A project declaration is required."
            );
        }

        if (
            projects.length > 1
        ) {

            throw new Error(
                "Semantic error: Only one project declaration is allowed."
            );
        }
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

        if (
            !project
        ) {

            throw new Error(
                "Semantic error: Project declaration was not found."
            );
        }

        return project;
    }

    private validateProject(
        project: ProjectNode
    ): void {

        if (
            project.name.trim().length === 0
        ) {

            throw new Error(
                "Semantic error: Project name cannot be empty."
            );
        }
    }

    private validateEvent(
        event: EventNode
    ): void {

        if (
            event.target !== "player"
        ) {

            throw new Error(
                `Semantic error: Unsupported event target '${event.target}'.`
            );
        }

        const supportedPlayerEvents = [
            "join",
            "leave"
        ];

        if (
            !supportedPlayerEvents.includes(
                event.event
            )
        ) {

            throw new Error(
                `Semantic error: Unsupported player event '${event.event}'.`
            );
        }

        for (
            const statement
            of event.body
        ) {

            this.validateStatement(
                statement
            );
        }
    }

    private validateStatement(
        statement: StatementNode
    ): void {

        switch (
            statement.type
        ) {

            case "PlayerMessage":

                if (
                    statement.message.trim().length === 0
                ) {

                    throw new Error(
                        "Semantic error: Player message cannot be empty."
                    );
                }

                break;

            case "Command":

                if (
                    statement.command.trim().length === 0
                ) {

                    throw new Error(
                        "Semantic error: Command cannot be empty."
                    );
                }

                if (
                    statement.command.startsWith("/")
                ) {

                    throw new Error(
                        "Semantic error: Commands must not start with '/'."
                    );
                }

                break;

            default:

                throw new Error(
                    "Semantic error: Unsupported statement."
                );
        }
    }
}