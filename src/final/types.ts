export type PackKind = "behavior" | "resource";
export interface SourceFile { pack: PackKind; path: string; content: string; binary?: boolean; }
export interface CommandParam { type: string; name: string; optional?: boolean; enumName?: string; }
export interface CustomCommandDef { name: string; description: string; permission: "Any"|"GameDirectors"|"Admin"|"Host"|"Owner"; cheatsRequired: boolean; params: CommandParam[]; body: string[]; }
export interface ScheduleDef { every: number; unit: "ticks"|"seconds"|"minutes"; body: string[]; }
export interface EconomyDef { currencies: { name:string; symbol:string; defaultBalance:number }[]; scoreboard: boolean; scoreboardTitle:string; startingMoney:number; startingShards:number; }
export type StructureOperation =
  | { kind: "set"; block: string; x:number; y:number; z:number }
  | { kind: "fill"; block: string; x1:number; y1:number; z1:number; x2:number; y2:number; z2:number; mode?:string }
  | { kind: "box"; block:string; x1:number;y1:number;z1:number;x2:number;y2:number;z2:number }
  | { kind: "hollow"; block:string; x1:number;y1:number;z1:number;x2:number;y2:number;z2:number; inner?:string }
  | { kind: "sphere"; block:string; x:number;y:number;z:number;radius:number;hollow?:boolean }
  | { kind: "cylinder"; block:string; x:number;y:number;z:number;radius:number;height:number;hollow?:boolean }
  | { kind: "pillar"; block:string; x:number;y1:number;z:number;y2:number }
  | { kind: "line"; block:string; x1:number;y1:number;z1:number;x2:number;y2:number;z2:number }
  | { kind: "stairs"; block:string; x:number;y:number;z:number;length:number;direction:string }
  | { kind: "clear"; x1:number;y1:number;z1:number;x2:number;y2:number;z2:number };
export interface StructureDef { name:string; operations:StructureOperation[]; }
export interface StructureSpawnDef { structure:string; enabled:boolean; intervalTicks:number; chance:number; attempts:number; minDistance:number; maxDistance:number; dimensions:("overworld"|"nether"|"end")[]; }
export interface FinalProject {
  name: string; description: string; minEngineVersion: [number,number,number];
  behaviorFiles: SourceFile[]; resourceFiles: SourceFile[]; scripts: string[]; functions: string[];
  commands: CustomCommandDef[]; schedules: ScheduleDef[]; structures: StructureDef[]; structureSpawns: StructureSpawnDef[];
  economy?: EconomyDef;
}
