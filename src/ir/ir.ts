export interface BedrockProjectIR {
    type: "BedrockProject";

    name: string;

    behaviorPack: BehaviorPackIR;

    resourcePack: ResourcePackIR;
}

export interface BehaviorPackIR {
    type: "BehaviorPack";

    name: string;

    events: BedrockEventIR[];
}

export interface ResourcePackIR {
    type: "ResourcePack";

    name: string;
}

export interface BedrockEventIR {
    type: "Event";

    target: string;

    event: string;

    statements: BedrockStatementIR[];

    commands: BedrockCommandIR[];
}

export interface BedrockCommandIR {
    type: "Command";

    command: string;
}

export type BedrockStatementIR =
    | BedrockPlayerMessageIR;

export interface BedrockPlayerMessageIR {
    type: "PlayerMessage";

    message: string;
}