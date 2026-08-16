import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import {
  lintScript,
  repositoryDirectory,
  runLint
} from "../test-support/lint-runner.mjs";

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

test("一行にある複数の文を検出する", () => {
  const result = runLint("設定を読み込みます。値を検証します。\n");
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /一行に複数の文を記載しないでください/
  );
});

test("別の行にある複数の文を受け入れる", () => {
  const result = runLint("設定を読み込みます。\n値を検証します。\n");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("かぎ括弧内の句点を文の区切りとして数えない", () => {
  const result = runLint("画面に「設定しました。」と表示します。\n");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("文章の太字を検出する", () => {
  const result = runLint("この設定は**必須**です。\n");
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /文章では太字による強調を使用しないでください/
  );
});

test("見出しと箇条書きの太字を検出する", () => {
  const result = runLint("# **重要な設定**\n\n- **注意:** 値を確認します。\n");
  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /文章では太字による強調を使用しないでください/
  );
});

test("正式ではない専門用語の表記を検出する", () => {
  const result = runLint("Githubを使用します。\n");
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /GitHub/);
});

test("常体で統一された文章を受け入れる", () => {
  const result = runLint("設定ファイルを読み込む。\n値を検証する。\n");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("です・ます調と常体が混在する文章を検出する", () => {
  const result = runLint(
    "設定ファイルを読み込みます。\n値を検証します。\n設定値は有効である。\n"
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /文体|ですます|である/);
});

test("算用数字と漢数字の表記候補は処理を失敗させない", () => {
  const result = runLint("一つの方法があります。\n");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("対象ファイルがない場合は成功する", () => {
  const result = spawnSync(process.execPath, [lintScript], {
    cwd: repositoryDirectory,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
