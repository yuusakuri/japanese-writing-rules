import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const lintScript = path.join(
  repositoryDirectory,
  "skills",
  "japanese-technical-business-writing",
  "scripts",
  "lint-writing.mjs"
);

function runLint(content) {
  const temporaryDirectory = mkdtempSync(
    path.join(tmpdir(), "japanese-writing-rules-")
  );
  const target = path.join(temporaryDirectory, "target.md");
  writeFileSync(target, content, "utf8");

  const result = spawnSync(process.execPath, [lintScript, target], {
    cwd: repositoryDirectory,
    encoding: "utf8"
  });

  rmSync(temporaryDirectory, { recursive: true, force: true });
  return result;
}

test("問題のない文章を受け入れる", () => {
  const result = runLint("設定を保存します。\n");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("一文の途中にある改行を検出する", () => {
  const result = runLint("設定画面で値を\n入力します。\n");
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /一文の途中で改行しないでください/
  );
});

test("本文の太字を検出する", () => {
  const result = runLint("この設定は**必須**です。\n");
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /本文では太字による強調を使用しないでください/
  );
});

test("正式ではない専門用語の表記を検出する", () => {
  const result = runLint("Githubを使用します。\n");
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /GitHub/);
});

test("対象ファイルがない場合は成功する", () => {
  const result = spawnSync(process.execPath, [lintScript], {
    cwd: repositoryDirectory,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
