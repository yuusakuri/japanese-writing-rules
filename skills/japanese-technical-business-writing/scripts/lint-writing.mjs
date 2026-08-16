import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const invocationDirectory = process.cwd();
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillDirectory = path.resolve(scriptDirectory, "..");
const files = process.argv
  .slice(2)
  .filter((file) => /\.(md|txt)$/i.test(file))
  .map((file) => path.resolve(invocationDirectory, file));

if (files.length === 0) {
  process.exit(0);
}

const require = createRequire(import.meta.url);
const textlint = require.resolve("textlint/bin/textlint.js");

function run(config, useCustomRules = false) {
  return spawnSync(
    process.execPath,
    [
      textlint,
      "--config",
      path.resolve(skillDirectory, "textlint", config),
      ...(useCustomRules
        ? ["--rulesdir", path.resolve(skillDirectory, "rules")]
        : []),
      ...files
    ],
    {
      cwd: skillDirectory,
      encoding: "utf8",
      shell: false
    }
  );
}

const strictResult = run("strict.json", true);

if (strictResult.stdout) {
  process.stdout.write(strictResult.stdout);
}

if (strictResult.stderr) {
  process.stderr.write(strictResult.stderr);
}

if (strictResult.error) {
  process.stderr.write(`${strictResult.error.message}\n`);
}

if (strictResult.status !== 0) {
  process.stderr.write(`
文章Lintで修正が必要な問題を検出しました。

検出語だけを別の語へ置換して回避しないでください。
指摘された文を読み、意味を保ったまま問題の原因を解消してください。
専門用語は正式または一般的な技術表記を維持してください。
`);
  process.exit(strictResult.status ?? 1);
}

const reviewResult = run("review.json");
const reviewOutput =
  `${reviewResult.stdout ?? ""}${reviewResult.stderr ?? ""}`.trim();

if (reviewResult.error) {
  process.stderr.write(`${reviewResult.error.message}\n`);
  process.exit(1);
}

if (reviewOutput) {
  process.stdout.write(`
文章の改善候補があります。

${reviewOutput}

これらは強制修正ではありません。
文章全体を読み、修正によって日本語が自然かつ明確になる場合だけ直してください。
Lintを消すための体言止め、語尾変更、類義語への置換は行わないでください。
`);
}

process.exit(0);
