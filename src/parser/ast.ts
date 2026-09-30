export interface ProgramNode {
    type: "Program";
    declarations: DeclarationNode[];
}

export type DeclarationNode =
    | ProjectNode
    | EventNode;

export interface ProjectNode {
    type: "Project";
    name: string;
}

export interface EventNode {
    type: "Event";
    target: string;
    event: string;
    body: StatementNode[];
}

export type StatementNode =
    | PlayerMessageNode
    | CommandNode;

export interface PlayerMessageNode {
    type: "PlayerMessage";
    message: string;
}

export interface CommandNode {
    type: "Command";
    command: string;
}