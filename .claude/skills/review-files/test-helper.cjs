const { readFileSync } = require("node:fs");
const { join } = require("node:path");

const reviewRules = readFileSync(join(__dirname, "review-rules.md"), "utf8");
const source = readFileSync(join(__dirname, "workflow.js"), "utf8")
  .replace(/^export const meta/m, "const meta");
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const execute = new AsyncFunction("args", "agent", "pipeline", source);

exports.reviewRules = reviewRules;
exports.runReviews = async (rules, {
  files = ["a.js", "b.js"],
  reply = () => "レビュー結果",
} = {}) => {
  const prompts = [];
  const agent = async (prompt, opts) => {
    prompts.push(prompt);
    return reply(opts.label);
  };
  // 本物の pipeline と同じく、失敗した項目は null にして他の項目を続ける
  const pipeline = async (items, task) =>
    Promise.all(items.map(item => task(item).catch(() => null)));
  await execute({ files, reviewRules: rules }, agent, pipeline);
  return prompts;
};
