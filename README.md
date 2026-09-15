# claude-code-workflow-tests

記事「Claude Code の workflow にはテストを書くべし」のサンプルコードと、テストが本当に機能するかを確かめるためのリポジトリ。

## 構成

```text
.claude/skills/review-files/
├── SKILL.md           # レビュー基準を読み、workflow.js を Workflow ツールで実行するスキル
├── review-rules.md    # レビュー基準
├── workflow.js        # ファイルごとに AI へレビューを依頼する workflow
├── test-helper.cjs    # workflow.js を読み込み、agent / pipeline を差し替えて動かす補助関数
└── workflow.test.cjs  # テスト本体
```

## テストの実行

Node.js 標準のテスト機能だけを使うので、追加パッケージは不要。

```bash
cd .claude/skills/review-files
node workflow.test.cjs
```

## テストが機能することの確認

`workflow.js` を 1 か所ずつ壊し、対応するテストが失敗することを確かめた（Node.js v24.2.0）。

| 壊した内容 | 失敗するテスト |
|---|---|
| 依頼文からレビュー基準を外す | 各AIへの依頼に、ファイルから読んだレビュー基準が入る |
| レビュー基準のチェックを消す | レビュー基準がなければ止まる |
| レビュー対象のチェックを消す | レビュー対象がなければ、成功扱いにせず止まる |
| `null` のチェックを消す | 未完了のレビューがあれば止まる |
| 先頭のファイルだけレビューする | 各AIへの依頼に〜 / 未完了のレビューがあれば止まる |

## テストで確認できないこと

- Claude が `SKILL.md` の指示どおりに `review-rules.md` を読むか
- 本物の Workflow 実行環境での挙動（`phase()` / `log()` などは差し替えていない。`Date.now()` / `Math.random()` が使えない制約も再現しない）
- AI が基準を守ってレビューできるか
