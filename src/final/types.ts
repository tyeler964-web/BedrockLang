export type PackKind = "behavior" | "resource";

export interface SourceFile {
  pack: PackKind;
  path: string;
  content: string;
  binary?: boolean;
}

export interface FinalProject {
  name: string;
  description: string;
  minEngineVersion: [number, number, number];
  behaviorFiles: SourceFile[];
  resourceFiles: SourceFile[];
  scripts: string[];
  functions: string[];
}
