import { existsSync, readFileSync } from "node:fs";

const sourcePath = "app/pages/free-exam-papers.vue";
const runbookPath = "SEO_RUNBOOK.md";
const keywordMapPath = "SEO_KEYWORD_MAP.md";
const generatedPath = ".output/public/free-exam-papers/index.html";

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const readRequired = (path) => {
  if (!existsSync(path)) {
    fail(`Missing required file: ${path}`);
    return "";
  }
  return readFileSync(path, "utf8");
};

const freeExamPage = readRequired(sourcePath);
const runbook = readRequired(runbookPath);
const keywordMap = readRequired(keywordMapPath);
const generatedPage = readRequired(generatedPath);

const expectedCollections = [
  ["2025 primary exam papers", "/exam-papers/2025"],
  ["Primary 6 free exam papers", "/exam-papers/primary-6"],
  ["Free Maths exam papers", "/exam-papers/mathematics"],
  ["Free Science exam papers", "/exam-papers/science"],
  ["Free English exam papers", "/exam-papers/english"],
  ["Free Chinese exam papers", "/exam-papers/chinese"],
  ["Top school exam papers", "/top-school-exam-papers"],
  ["PSLE revision papers", "/exam-papers/psle-revision"],
];

for (const snippet of [
  "trackEvent",
  "trackFreeCollectionClick",
  "free_exam_collection_click",
  "free_exam_collection_grid",
  "collection_title",
  "target_path",
  "@click=\"trackFreeCollectionClick(collection)\"",
]) {
  if (!freeExamPage.includes(snippet)) {
    fail(`Free exam papers page is missing collection tracking snippet: ${snippet}`);
  }
}

for (const [title, path] of expectedCollections) {
  if (!freeExamPage.includes(title)) {
    fail(`Free exam papers page is missing collection source: ${title}`);
  }
  if (!freeExamPage.includes(path)) {
    fail(`Free exam papers page is missing collection link: ${path}`);
  }
  if (!generatedPage.includes(path)) {
    fail(`Generated free exam papers page is missing collection link: ${path}`);
  }
}

for (const [query, path] of [
  ["free exam papers", "/free-exam-papers"],
  ["free exam papers singapore", "/free-exam-papers"],
]) {
  if (!keywordMap.includes(query) || !keywordMap.includes(path)) {
    fail(`Keyword map is missing ${query} mapped to ${path}`);
  }
  if (!runbook.includes(query)) {
    fail(`SEO runbook is missing query tracking for ${query}`);
  }
}

for (const snippet of [
  "Free Exam Funnel Checks",
  "free_exam_collection_click",
  "free_exam_collection_grid",
  "Custom event parameter `collection_title`",
  "paper_view_click",
  "paper_open",
  "paper_download",
]) {
  if (!runbook.includes(snippet)) {
    fail(`SEO runbook is missing free-exam funnel snippet: ${snippet}`);
  }
}

if (process.exitCode) process.exit();
console.log("Free exam funnel audit passed.");
