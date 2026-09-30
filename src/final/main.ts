import { readFileSync } from "fs";
import { resolve } from "path";
import { compile } from "./compiler";

const ROOT = resolve(__dirname, "../..");
const VERSION_FILE = resolve(ROOT, "versions.json");

function getVersionId(): string {
  const registry = JSON.parse(readFileSync(VERSION_FILE, "utf8"));
  return registry.current.identifier;
}

const VERSION_ID = getVersionId();
const input = process.argv[2] ?? "examples/hello.bdl";
const source = readFileSync(input, "utf8");

try {
  const result = compile(source);
  console.log(`=== BedrockLang ${VERSION_ID} ===`);
  console.log(`Input: ${input}`);
  console.log("Compilation successful.");
  console.log(`Behavior Pack: ${result.behaviorPack}`);
  console.log(`Resource Pack: ${result.resourcePack}`);
  console.log(`MCAddon: ${result.mcaddon}`);
  console.log(`Version ID: ${VERSION_ID}`);
} catch (error) {
  console.error(`Compilation failed [${VERSION_ID}].`);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
