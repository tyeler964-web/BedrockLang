import { readFileSync } from "fs";

import { Compiler } from "./compiler/compiler";

const inputFile =
    process.argv[2] ??
    "examples/hello.bdl";

const source =
    readFileSync(
        inputFile,
        "utf8"
    );

console.log(
    "=== BedrockLang Stage 7 ==="
);

console.log(
    `Input: ${inputFile}`
);

console.log(
    "\n=== Compiling ==="
);

try {

    const compiler =
        new Compiler();

    const ir =
        compiler.compile(
            source
        );

    console.log(
        "Compilation successful."
    );

    console.log(
        "\n=== Generated Project ==="
    );

    console.log(
        `Project: ${ir.name}`
    );

    console.log(
        `Behavior Pack: ${ir.behaviorPack.name}`
    );

    console.log(
        `Resource Pack: ${ir.resourcePack.name}`
    );

    console.log(
        `Events: ${ir.behaviorPack.events.length}`
    );

    const totalCommands =
        ir.behaviorPack.events.reduce(
            (
                total,
                event
            ) =>
                total +
                event.commands.length,
            0
        );

    console.log(
        `Commands: ${totalCommands}`
    );

    console.log(
        "\n=== Output ==="
    );

    console.log(
        `build/${ir.name}/behavior_packs/${ir.name}_BP`
    );

    console.log(
        `build/${ir.name}/resource_packs/${ir.name}_RP`
    );

    console.log(
        "\n=== Bedrock IR ==="
    );

    console.log(
        JSON.stringify(
            ir,
            null,
            2
        )
    );

    console.log(
        "\n=== Stage 7 Complete ==="
    );

} catch (error) {

    console.error(
        "\n=== Compilation Failed ==="
    );

    if (
        error instanceof Error
    ) {

        console.error(
            error.message
        );

    } else {

        console.error(
            error
        );
    }

    process.exitCode = 1;
}