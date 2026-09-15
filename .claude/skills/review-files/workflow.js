export const meta = {
  name: "review-files",
  description: "ファイルごとにレビューし、結果を集める",
};

if (!args?.reviewRules?.trim()) {
  throw new Error("レビュー基準が渡されていません");
}
if (!Array.isArray(args.files) || args.files.length === 0) {
  throw new Error("レビュー対象のファイルが渡されていません");
}

const reviews = await pipeline(args.files, file =>
  agent(
    args.reviewRules + "\n\nこの基準で " + file + " をレビューしてください。",
    { label: file }
  )
);

if (reviews.some(review => review === null)) {
  throw new Error("未完了のレビューがあります");
}

return reviews;
