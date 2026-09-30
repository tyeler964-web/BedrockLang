import { mkdirSync, writeFileSync, rmSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";
import { FinalProject } from "./types";

export interface BuildResult {
  root: string;
  behaviorPack: string;
  resourcePack: string;
  mcaddon: string;
}

export function generate(project: FinalProject, out = "build"): BuildResult {
  const root = `${out}/${project.name}`;
  rmSync(root, { recursive: true, force: true });
  const bp = `${root}/behavior_packs/${project.name}_BP`;
  const rp = `${root}/resource_packs/${project.name}_RP`;
  mkdirSync(bp, { recursive: true });
  mkdirSync(rp, { recursive: true });

  const bpUuid = randomUUID();
  const rpUuid = randomUUID();
  const scriptUuid = randomUUID();

  writeJson(`${bp}/manifest.json`, {
    format_version: 2,
    header: { name: `${project.name} Behavior Pack`, description: project.description, uuid: bpUuid, version: [1,0,0], min_engine_version: project.minEngineVersion },
    modules: [
      { type: "data", uuid: randomUUID(), version: [1,0,0] },
      { type: "script", language: "javascript", uuid: scriptUuid, version: [1,0,0], entry: "scripts/main.js" }
    ],
    dependencies: [{ uuid: rpUuid, version: [1,0,0] }, { module_name: "@minecraft/server", version: "2.10.0" }]
  });

  writeJson(`${rp}/manifest.json`, {
    format_version: 2,
    header: { name: `${project.name} Resource Pack`, description: project.description, uuid: rpUuid, version: [1,0,0], min_engine_version: project.minEngineVersion },
    modules: [{ type: "resources", uuid: randomUUID(), version: [1,0,0] }]
  });

  for (const f of project.behaviorFiles) writeFile(bp, f.path, f.content);
  for (const f of project.resourceFiles) writeFile(rp, f.path, f.content);

  const scripts = project.scripts.filter(x => !x.startsWith("@@PATH:"));
  writeFile(bp, "scripts/main.js", [
    'import { world } from "@minecraft/server";',
    "",
    ...scripts
  ].join("\n") + "\n");

  for (const entry of project.scripts.filter(x => x.startsWith("@@PATH:"))) {
    const first = entry.indexOf("\n");
    const path = entry.slice(7, first);
    writeFile(bp, path, entry.slice(first + 1));
  }

  for (const entry of project.functions) {
    const first = entry.indexOf("\n");
    const path = entry.slice(7, first);
    writeFile(bp, `functions/${path}`, entry.slice(first + 1));
  }

  const mcaddon = `${out}/${project.name}.mcaddon`;
  createMcaddon(mcaddon, [
    [`${project.name}_BP.mcpack`, bp],
    [`${project.name}_RP.mcpack`, rp]
  ]);
  return { root, behaviorPack: bp, resourcePack: rp, mcaddon };
}

function writeFile(root: string, path: string, content: string): void {
  const full = `${root}/${path.replace(/^\\/+/, "")}`;
  mkdirSync(full.slice(0, full.lastIndexOf("/")), { recursive: true });
  writeFileSync(full, content, "utf8");
}
function writeJson(path: string, value: unknown): void {
  mkdirSync(path.slice(0, path.lastIndexOf("/")), { recursive: true });
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function createMcaddon(path: string, packs: [string, string][]): void {
  const { execFileSync } = require("child_process");
  const tmp = resolve(path + ".tmp");
  const output = resolve(path);

  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  for (const [name, folder] of packs) {
    const parent = tmp + "/" + name.replace(/\.mcpack$/, "");
    mkdirSync(parent, { recursive: true });
    execFileSync("cp", ["-R", resolve(folder) + "/.", parent]);
  }

  execFileSync("zip", ["-qr", output, "."], { cwd: tmp });
  rmSync(tmp, { recursive: true, force: true });
}
