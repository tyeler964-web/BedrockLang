import { parseSource } from "./parser";
import { generate, BuildResult } from "./generator";

export function compile(source: string): BuildResult {
  return generate(parseSource(source));
}
