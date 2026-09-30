import {
    mkdirSync
} from "fs";

import {
    BedrockProjectIR
} from "../ir/ir";

import {
    BehaviorPackGenerator
} from "./behaviorPackGenerator";

import {
    ResourcePackGenerator
} from "./resourcePackGenerator";

import {
    FunctionGenerator
} from "./functionGenerator";

export class BedrockProjectGenerator {

    generate(
        project: BedrockProjectIR
    ): string {

        const projectDirectory =
            `build/${project.name}`;

        mkdirSync(
            projectDirectory,
            {
                recursive: true
            }
        );

        const behaviorPackGenerator =
            new BehaviorPackGenerator();

        behaviorPackGenerator.generate(
            project
        );

        const resourcePackGenerator =
            new ResourcePackGenerator();

        resourcePackGenerator.generate(
            project
        );

        const functionGenerator =
            new FunctionGenerator();

        functionGenerator.generate(
            project
        );

        return projectDirectory;
    }
}