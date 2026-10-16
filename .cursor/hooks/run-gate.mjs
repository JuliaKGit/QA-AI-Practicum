#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptName = process.argv[2];
if (!scriptName) {
  process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
  process.exit(0);
}

const dir = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(dir, scriptName);
let stdin = Buffer.alloc(0);
try {
  stdin = readFileSync(0);
} catch {
  stdin = Buffer.alloc(0);
}

for (const [cmd, args] of [["py", ["-3", scriptPath]], ["python3", [scriptPath]], ["python", [scriptPath]]]) {
  const result = spawnSync(cmd, args, { input: stdin, encoding: "utf8" });
  if (result.error) continue;
  if (result.stdout) process.stdout.write(result.stdout);
  process.exit(result.status ?? 0);
}

process.stdout.write(JSON.stringify({ permission: "allow" }) + "\n");
process.exit(0);
