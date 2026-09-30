export type PackKind = "behavior" | "resource";
export interface SourceFile { pack: PackKind; path: string; content: string; binary?: boolean; }
export interface CommandParam { type: string; name: string; optional?: boolean; enumName?: string; }
export interface CustomCommandDef { name: string; description: string; permission: "Any"|"GameDirectors"|"Admin"|"Host"|"Owner"; cheatsRequired: boolean; params: CommandParam[]; body: string[]; }
export interface ScheduleDef { every: number; unit: "ticks"|"seconds"|"minutes"; body: string[]; }
export interface FinalProject {
  name: string; description: string; minEngineVersion: [number,number,number];
  behaviorFiles: SourceFile[]; resourceFiles: SourceFile[]; scripts: string[]; functions: string[];
  commands: CustomCommandDef[]; schedules: ScheduleDef[];
}
