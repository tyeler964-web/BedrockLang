#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");
const root = path.resolve(__dirname, "..");
const result = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", path.join(root, "src/cli/commands.ts"), ...process.argv.slice(2)], { cwd: root, stdio: "inherit" });
process.exit(result.status ?? 1);
