import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  repositoryDirectory,
  runLintFile
} from "../test-support/lint-runner.mjs";

const corpusDirectory = path.join(repositoryDirectory, "test", "corpus");
const naturalDirectory = path.join(corpusDirectory, "natural");
const unnaturalDirectory = path.join(corpusDirectory, "unnatural");

for (const file of readdirSync(naturalDirectory).sort()) {
  test(`自然文を誤検知しない: ${file}`, () => {
    const result = runLintFile(path.join(naturalDirectory, file));
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  });
}

for (const file of readdirSync(unnaturalDirectory).sort()) {
  test(`不自然文コーパスを解析できる: ${file}`, () => {
    const result = runLintFile(path.join(unnaturalDirectory, file));
    assert.doesNotMatch(
      `${result.stdout}\n${result.stderr}`,
      /Unexpected error|Cannot find|command not found/
    );
  });
}

for (const file of ["ai-list-formatting.md", "fragmented-sentences.md"]) {
  test(`明確なstrict違反を検出する: ${file}`, () => {
    const result = runLintFile(path.join(unnaturalDirectory, file));
    assert.notEqual(result.status, 0);
  });
}
