import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { repositoryDirectory } from "../test-support/lint-runner.mjs";

const textlintDirectory = path.join(
  repositoryDirectory,
  "skills",
  "japanese-technical-business-writing",
  "textlint"
);
const strictConfig = JSON.parse(
  readFileSync(path.join(textlintDirectory, "strict.json"), "utf8")
);
const reviewConfig = JSON.parse(
  readFileSync(path.join(textlintDirectory, "review.json"), "utf8")
);
const strictTechnical = strictConfig.rules["preset-ja-technical-writing"];
const reviewTechnical = reviewConfig.rules["preset-ja-technical-writing"];
const reviewAi = reviewConfig.rules["@textlint-ja/preset-ai-writing"];

test("strict Lintは本文の文体を自動判定する", () => {
  assert.equal(
    strictTechnical["no-mix-dearu-desumasu"].preferInBody,
    ""
  );
});

test("数字表記をreview Lintだけで確認する", () => {
  assert.equal(strictTechnical["arabic-kanji-numbers"], false);
  assert.equal(reviewTechnical["arabic-kanji-numbers"], true);
});

test("review Lintで太字の警告を重複させない", () => {
  assert.equal(
    reviewAi["no-ai-list-formatting"].disableBoldListItems,
    true
  );
  assert.equal(reviewAi["no-ai-emphasis-patterns"], false);
});
