#!/usr/bin/env node
/**
 * Cross-platform replacement for the git-info shell script.
 * Generates src/generated/gitInfo.ts with the current git commit hash and tag.
 */
import { execSync } from "child_process";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

const outDir = join("src", "generated");

// Remove and recreate the output directory
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// Get git info (fall back gracefully if git is not available)
let commitHash = "unknown";
let version = "unknown";
try {
    commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch (_) {
    // not a git repo or git not installed
}
try {
    version = execSync("git describe --tags --always", { encoding: "utf8" }).trim();
} catch (_) {
    version = commitHash;
}

const content = `export default { commitHash: '${commitHash}', version: '${version}' };\n`;
writeFileSync(join(outDir, "gitInfo.ts"), content, "utf8");

console.log(`git-info: commitHash=${commitHash}  version=${version}`);
