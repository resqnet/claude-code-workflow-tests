const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");

// workflow.js を読み込み、agent と pipeline を引数で受け取る関数にする
const rules = readFileSync(`${__dirname}/review-rules.md`, "utf8");
const source = readFileSync(`${__dirname}/workflow.js`, "utf8").replace("export ", "");
const AsyncFunction = (async () => {}).constructor;
const workflow = new AsyncFunction("args", "agent", "pipeline", source);

// AI を呼ばずに動かし、送った依頼文を返す
async function run(args, reply = () => "レビュー結果") {
  const prompts = [];
  const agent = async (prompt, { label }) => {
    prompts.push(prompt);
    return reply(label);
  };
  // 本物と同じく、失敗した項目は null にして続ける
  const pipeline = (items, task) =>
    Promise.all(items.map(item => task(item).catch(() => null)));
  await workflow(args, agent, pipeline);
  return prompts;
}

const files = ["a.js", "b.js"];

test("各AIへの依頼にレビュー基準が入る", async () => {
  const prompts = await run({ files, reviewRules: rules });
  assert.equal(prompts.length, 2);
  for (const prompt of prompts) {
    assert.ok(prompt.includes(rules), "レビュー基準が依頼文にありません");
  }
});

test("レビュー基準がなければ止まる", () =>
  assert.rejects(run({ files, reviewRules: "" }), /レビュー基準が渡されていません/));

test("レビュー対象がなければ止まる", () =>
  assert.rejects(run({ files: [], reviewRules: rules }), /レビュー対象のファイルが渡されていません/));

test("未完了のレビューがあれば止まる", () =>
  assert.rejects(
    run({ files, reviewRules: rules }, file => (file === "b.js" ? null : "レビュー結果")),
    /未完了のレビューがあります/
  ));
