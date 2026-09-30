import { readFileSync } from "fs";
import { compile } from "./compiler";

const input = process.argv[2] ?? "examples/hello.bdl";
const source = readFileSync(input, "utf8");

try {
  const result = compile(source);
  console.log("=== BedrockLang 1.7.9 ===");
  console.log(`Input: ${input}`);
  console.log("Compilation successful.");
  console.log(`Behavior Pack: ${result.behaviorPack}`);
  console.log(`Resource Pack: ${result.resourcePack}`);
  console.log(`MCAddon: ${result.mcaddon}`);
} catch (error) {
  console.error("Compilation failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
