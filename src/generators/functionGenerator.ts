import {
    mkdirSync,
    writeFileSync
} from "fs";

import {
    BedrockProjectIR,
    BedrockEventIR
} from "../ir/ir";

export class FunctionGenerator {

    generate(
        project: BedrockProjectIR
    ): string[] {

        const directory =
            `build/${project.name}/behavior_packs/${project.name}_BP/functions/events`;

        mkdirSync(
            directory,
            {
                recursive: true
            }
        );

        const generatedFiles:
            string[] = [];

        for (
            const event
            of project.behaviorPack.events
        ) {

            if (
                event.commands.length === 0
            ) {
                continue;
            }

            const file =
                this.generateEventFunction(
                    directory,
                    event
                );

            generatedFiles.push(
                file
            );
        }

        return generatedFiles;
    }

    private generateEventFunction(
        directory: string,
        event: BedrockEventIR
    ): string {

        const functionName =
            this.getFunctionName(
                event
            );

        const commands =
            event.commands
                .map(
                    command =>
                        command.command
                )
                .join("\n");

        const output =
            commands.length > 0
                ? `${commands}\n`
                : "";

        const file =
            `${directory}/${functionName}.mcfunction`;

        writeFileSync(
            file,
            output,
            "utf8"
        );

        return file;
    }

    private getFunctionName(
        event: BedrockEventIR
    ): string {

        return `${event.target}_${event.event}`;
    }
}