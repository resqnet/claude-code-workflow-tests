const { test } = require("node:test");
const assert = require("node:assert/strict");
const { runReviews, reviewRules } = require("./test-helper.cjs");

test("各AIへの依頼に、ファイルから読んだレビュー基準が入る", async () => {
  const prompts = await runReviews(reviewRules);
  assert.equal(prompts.length, 2);
  for (const prompt of prompts) {
    assert.ok(prompt.includes(reviewRules), "レビュー基準が依頼文にありません");
  }
});

test("レビュー基準がなければ止まる", async () => {
  await assert.rejects(runReviews(""), /レビュー基準が渡されていません/);
});

test("レビュー対象がなければ、成功扱いにせず止まる", async () => {
  await assert.rejects(
    runReviews(reviewRules, { files: [] }),
    /レビュー対象のファイルが渡されていません/
  );
});

test("未完了のレビューがあれば止まる", async () => {
  const reply = file => (file === "b.js" ? null : "レビュー結果");
  await assert.rejects(
    runReviews(reviewRules, { reply }),
    /未完了のレビューがあります/
  );
});
