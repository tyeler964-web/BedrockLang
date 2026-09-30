import { mkdirSync, writeFileSync } from "fs";
import { ProgramNode, EventNode } from "../parser/ast";

export class ScriptGenerator {

    generate(
        ast: ProgramNode,
        behaviorPackDirectory: string
    ): void {

        const scriptsDirectory =
            `${behaviorPackDirectory}/scripts`;

        mkdirSync(scriptsDirectory, {
            recursive: true
        });

        const javascript = this.generateJavaScript(ast);

        writeFileSync(
            `${scriptsDirectory}/main.js`,
            javascript
        );

        console.log(
            `Generated Script API file: ${scriptsDirectory}/main.js`
        );
    }

    private generateJavaScript(
        ast: ProgramNode
    ): string {

        const lines: string[] = [];

        lines.push(
            `import { world } from "@minecraft/server";`
        );

        lines.push("");

        for (const declaration of ast.declarations) {

            if (declaration.type === "Event") {

                lines.push(
                    this.generateEvent(declaration)
                );

                lines.push("");
            }
        }

        return lines.join("\n");
    }

    private generateEvent(
        event: EventNode
    ): string {

        if (
            event.target === "player" &&
            event.event === "join"
        ) {

            const statements = event.body
                .map(statement => {

                    if (
                        statement.type === "PlayerMessage"
                    ) {

                        const message =
                            this.escapeJavaScriptString(
                                statement.message
                            );

                        return `    player.sendMessage("${message}");`;
                    }

                    throw new Error(
                        `Unsupported statement: ${statement.type}`
                    );
                })
                .join("\n");

            return [
                `world.afterEvents.playerSpawn.subscribe((event) => {`,
                `    const player = event.player;`,
                "",
                statements,
                `});`
            ].join("\n");
        }

        throw new Error(
            `Unsupported event: ${event.target}.${event.event}`
        );
    }

    private escapeJavaScriptString(
        value: string
    ): string {

        return value
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\n/g, "\\n");
    }
}