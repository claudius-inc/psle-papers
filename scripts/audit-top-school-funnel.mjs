import { existsSync, readFileSync } from "node:fs";

const sourcePath = "app/pages/top-school-exam-papers.vue";
const runbookPath = "SEO_RUNBOOK.md";
const keywordMapPath = "SEO_KEYWORD_MAP.md";
const generatedPath = ".output/public/top-school-exam-papers/index.html";

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

const topSchoolPage = readRequired(sourcePath);
const runbook = readRequired(runbookPath);
const keywordMap = readRequired(keywordMapPath);
const generatedPage = readRequired(generatedPath);

const expectedSchools = [
  ["Methodist Girls' School (Primary)", "/exam-papers/school-methodist-girls-school-primary", "methodist girls school primary exam papers"],
  ["Singapore Chinese Girls' Primary School", "/exam-papers/school-singapore-chinese-girls-primary-school", "singapore chinese girls primary school exam papers"],
  ["CHIJ St. Nicholas Girls' School", "/exam-papers/school-chij-st-nicholas-girls-school", "chij st nicholas girls school exam papers"],
  ["Anglo-Chinese School (Primary)", "/exam-papers/school-anglo-chinese-school-primary", "anglo chinese school primary exam papers"],
  ["Anglo-Chinese School (Junior)", "/exam-papers/school-anglo-chinese-school-junior", "anglo chinese school junior exam papers"],
  ["Pei Hwa Presbyterian Primary School", "/exam-papers/school-pei-hwa-presbyterian-primary-school", "pei hwa presbyterian primary school exam papers"],
  ["Red Swastika School", "/exam-papers/school-red-swastika-school", "red swastika school exam papers"],
  ["Tao Nan School", "/exam-papers/school-tao-nan-school", "tao nan school exam papers"],
];

for (const snippet of [
  "trackEvent",
  "trackTopSchoolCollectionClick",
  "top_school_collection_click",
  "top_school_collection_grid",
  "school_name",
  "target_path",
  "@click=\"trackTopSchoolCollectionClick(collection)\"",
]) {
  if (!topSchoolPage.includes(snippet)) {
    fail(`Top school page is missing collection tracking snippet: ${snippet}`);
  }
}

for (const staleSnippet of [
  "Anglo Chinese School (Primary)",
  "Anglo Chinese School (Junior)",
]) {
  if (topSchoolPage.includes(staleSnippet)) {
    fail(`Top school page still contains stale school name: ${staleSnippet}`);
  }
  if (generatedPage.includes(staleSnippet)) {
    fail(`Generated top school page still contains stale school name: ${staleSnippet}`);
  }
}

for (const [schoolName, path, query] of expectedSchools) {
  if (!topSchoolPage.includes(schoolName)) {
    fail(`Top school page is missing school card source: ${schoolName}`);
  }
  if (!topSchoolPage.includes(path)) {
    fail(`Top school page is missing school card link: ${path}`);
  }
  if (!generatedPage.includes(path)) {
    fail(`Generated top school page is missing school collection link: ${path}`);
  }
  if (!keywordMap.includes(query) || !keywordMap.includes(path)) {
    fail(`Keyword map is missing ${query} mapped to ${path}`);
  }
  if (!runbook.includes(query) || !runbook.includes(`https://sgexamhub.com${path}`)) {
    fail(`SEO runbook is missing indexing or query tracking for ${schoolName}`);
  }
}

for (const snippet of [
  "Top School Funnel Checks",
  "top_school_collection_click",
  "top_school_collection_grid",
  "Custom event parameter `school_name`",
  "paper_view_click",
  "paper_open",
  "paper_download",
]) {
  if (!runbook.includes(snippet)) {
    fail(`SEO runbook is missing top-school funnel snippet: ${snippet}`);
  }
}

if (process.exitCode) process.exit();
console.log("Top school funnel audit passed.");
