import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "fs";
import { execFileSync, spawnSync } from "child_process";
import { resolve, basename } from "path";

type Config = {
  prefix: string;
  version: { normal: string; temp: string };
  commands: Record<string, { description: string; action: string }>;
  quickstart: { cats: string[] };
};

const ROOT = resolve(__dirname, "../..");
const CONFIG = resolve(ROOT, "bdl-cli.json");
const config: Config = JSON.parse(readFileSync(CONFIG, "utf8"));

function versionId(): string {
  return config.version.temp || config.version.normal;
}

function run(command: string, args: string[] = []) {
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
}

function help() {
  console.log("BedrockLang custom terminal commands");
  console.log("");
  for (const [name, item] of Object.entries(config.commands)) {
    console.log(`  ${config.prefix} ${name.padEnd(30)} ${item.description}`);
  }
}

function list() {
  console.log("=== BDL Status Commands ===");
  console.log(`VERSION: ${versionId()}`);
  console.log(`ROOT: ${ROOT}`);
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Build folder: ${existsSync(resolve(ROOT, "build")) ? "present" : "missing"}`);
}

function showVersion(value?: string) {
  const versions = JSON.parse(readFileSync(resolve(ROOT, "versions.json"), "utf8"));
  if (!value) {
    console.log(`Current BDL version: ${versionId()}`);
    return;
  }
  const wanted = value.replace(/^%?NrSshot@|^%?TempSshot@|%$/g, "").replaceAll(",", ".");
  const found = versions.versions.find((v: any) => v.version === wanted);
  if (!found) return console.error(`Unknown BDL version: ${wanted}`);
  console.log(JSON.stringify(found, null, 2));
}

function cat(args: string[]) {
  if (!args.length) return console.error("Usage: BDL -cat <file> [start] [end]");
  const file = resolve(ROOT, args[0]);
  if (!existsSync(file) || !statSync(file).isFile()) return console.error(`CAT: file not found: ${args[0]}`);
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const start = Math.max(1, Number(args[1] ?? 1));
  const end = Math.min(lines.length, Number(args[2] ?? lines.length));
  for (let i = start; i <= end; i++) console.log(`${String(i).padStart(5, " ")} | ${lines[i - 1]}`);
}

function executeFileOrFolder(target: string) {
  const path = resolve(ROOT, target);
  if (!existsSync(path)) return console.error(`BDL -cf: not found: ${target}`);
  const info = statSync(path);
  if (info.isDirectory()) {
    const entries = readdirSync(path);
    console.log(`BDL -cf: analyzing folder ${target}`);
    for (const entry of entries) {
      const child = resolve(path, entry);
      if (statSync(child).isFile() && /\.(bdl|ts|js|json|mcfunction|lang|md)$/i.test(entry)) {
        console.log(`  -> ${entry}`);
      }
    }
    return;
  }
  if (target.endsWith(".bdl")) run(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", "src/main.ts", target]);
  else if (target.endsWith(".ts")) run(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", target]);
  else if (target.endsWith(".js")) run(process.execPath, [target]);
  else cat([target]);
}

function analyzeBinary(file: string) {
  const path = resolve(ROOT, file);
  const data = readFileSync(path);
  const printable = [...data].filter(b => b >= 32 && b < 127).length;
  console.log(`=== Binary Analyzer: ${file} ===`);
  console.log(`Bytes: ${data.length}`);
  console.log(`Printable ratio: ${data.length ? ((printable / data.length) * 100).toFixed(2) : "0.00"}%`);
  console.log(`Header: ${[...data.subarray(0, 16)].map(b => b.toString(16).padStart(2, "0")).join(" ")}`);
  console.log(`ZIP: ${data[0] === 0x50 && data[1] === 0x4b ? "yes" : "no"}`);
}

function ping() {
  const start = process.hrtime.bigint();
  spawnSync(process.execPath, ["-e", "process.stdout.write('pong')"], { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] });
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  console.log(`BDL ping: ${ms.toFixed(2)} ms`);
}

function quickstart() {
  const start = Date.now();
  const cats = config.quickstart.cats;
  let value = 0;
  console.log("\n=== Quick Start ===");
  console.log("Starting quick start!");
  const node = (label: string) => console.log(label);
  try {
    node("PERCENTAGE 5%");
    if (existsSync(resolve(ROOT, "build"))) { rmSync(resolve(ROOT, "build"), { recursive: true, force: true }); value++; }
    node("PERCENTAGE 15%");
    run(process.platform === "win32" ? "npx.cmd" : "npx", ["tsc", "--noEmit"]);
    value++;
    node("PERCENTAGE 35% — data was analyzed, successfully cache the available " + value + " data nodes");
    for (const item of cats) {
      console.log(`running cache for ${item}`);
      const file = resolve(ROOT, item);
      if (existsSync(file)) { value++; console.log(`CAT OK: ${item}`); }
      else { console.log(`CAT FAILED: ${item}`); }
    }
    node("PERCENTAGE 65%");
    run(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", "src/main.ts", "examples/full.bdl"]);
    value++;
    node("PERCENTAGE 90%");
    ping();
    node("PERCENTAGE2 100% loaded");
    const seconds = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`=== ${versionId()} ===`);
    console.log(`Successfully loaded quickstart for ${versionId()}`);
    console.log(`PERCENTAGE2 100% loaded, for ${seconds}s`);
    console.log("===== COMPLETED =====");
  } catch (error) {
    const seconds = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`PERCENTAGE2 — failed after ${seconds}s`);
    console.error("NODE: FAILED");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args.shift();
  if (!command || command === "help") return help();
  if (command === "list") return list();
  if (command === "VCR") return showVersion();
  if (command.startsWith("%cli-%")) return showVersion(command.slice(6));
  if (command === "run") return run("npm", [args.shift() ?? "check"]);
  if (command === "-rm") { const target = resolve(ROOT, args[0] ?? "build"); rmSync(target, { recursive: true, force: true }); return console.log(`Removed ${args[0] ?? "build"}`); }
  if (command === "-cat") return cat(args);
  if (command === "-cf") return executeFileOrFolder(args[0] ?? "");
  if (command === "-qkstart") return quickstart();
  if (command === "ping") return ping();
  if (command === "binary") return analyzeBinary(args[0] ?? "");
  console.error(`Unknown BDL command: ${command}. Use BDL help.`);
  process.exitCode = 1;
}

main();
