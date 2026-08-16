# Japanese Writing Rules

自然で正確な日本語の技術文書とビジネス文書を作成するためのCodex Skillと文章Lintです。
生成時の判断、機械的に確定できる検査、文脈に応じた改善候補を分離し、Lintへ文章を従属させずに品質を整えます。

## 収録内容

`japanese-technical-business-writing`は、文章の正確さ、情報の順序、段落、文の構造、専門用語、文体を制御するSkillです。
`register-writing-rule`は、文章への修正指摘を分析し、再利用できる指摘だけをSkill、用語辞書、Lintへ反映するSkillです。

```text
skills/
├─ japanese-technical-business-writing/
│  ├─ SKILL.md
│  ├─ agents/openai.yaml
│  ├─ textlint/
│  │  ├─ strict.json
│  │  ├─ review.json
│  │  └─ terminology.yml
│  ├─ rules/
│  │  ├─ one-sentence-one-line.js
│  │  └─ no-strong-emphasis.js
│  └─ scripts/lint-writing.mjs
└─ register-writing-rule/
   ├─ SKILL.md
   └─ agents/openai.yaml
test/
├─ corpus/
│  ├─ natural/
│  └─ unnatural/
├─ config.test.mjs
├─ corpus.test.mjs
└─ lint-writing.test.mjs
```

## セットアップ

Node.js 20以降を用意し、依存パッケージをインストールします。

```bash
npm ci
```

CodexへSkillを登録する場合は、各SkillのディレクトリをCodexのSkillディレクトリへコピーします。

```bash
cp -R skills/japanese-technical-business-writing ~/.codex/skills/
cp -R skills/register-writing-rule ~/.codex/skills/
```

## 文章Lintの実行

Markdownまたはテキストファイルを指定します。

```bash
npm run lint:writing -- docs/design.md
```

strict Lintは、文体の混在、正式表記の誤り、一文が複数行にまたがる問題、一行に複数の文がある問題、太字などを検出すると終了コードを失敗にします。
review Lintは改善候補を表示しますが、候補が存在するだけでは終了コードを失敗にしません。
算用数字と漢数字の使い分けは文書ごとの表記規約に関わるため、review Lintで確認します。

## テスト

独自Lint、Lint設定、用語辞書、実行スクリプトの連携を確認します。
技術書、仕様書、手順書、ビジネス報告書の正常文コーパスも検査し、strict Lintが自然な文章を誤検知しないことを確認します。

```bash
npm test
```
