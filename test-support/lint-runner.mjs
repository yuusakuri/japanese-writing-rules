import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repositoryDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
export const lintScript = path.join(
  repositoryDirectory,
  "skills",
  "japanese-technical-business-writing",
  "scripts",
  "lint-writing.mjs"
);

export function runLintFile(target) {
  return spawnSync(process.execPath, [lintScript, target], {
    cwd: repositoryDirectory,
    encoding: "utf8"
  });
}

export function runLint(content) {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), "japanese-writing-rules-")
  );
  const target = path.join(temporaryDirectory, "target.md");
  writeFileSync(target, content, "utf8");

  const result = runLintFile(target);
  rmSync(temporaryDirectory, { recursive: true, force: true });
  return result;
}

export function readCorpusFile(...segments) {
  const target = path.join(repositoryDirectory, "test", "corpus", ...segments);
  return readFileSync(target, "utf8");
}
