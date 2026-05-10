import { existsSync, readFileSync } from "node:fs";

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

const runbook = readRequired("SEO_RUNBOOK.md");

const pages = [
  {
    label: "download",
    sourcePath: "app/pages/download-exam-papers.vue",
    generatedPath: ".output/public/download-exam-papers/index.html",
    eventName: "download_exam_collection_click",
    source: "download_exam_collection_grid",
    handler: "trackDownloadCollectionClick",
    clickSnippet: "@click=\"trackDownloadCollectionClick(collection)\"",
    paths: [
      "/exam-papers/2025",
      "/exam-papers/primary-6",
      "/exam-papers/mathematics",
      "/exam-papers/science",
      "/exam-papers/english",
      "/exam-papers/chinese",
      "/exam-papers/sa2",
      "/exam-papers/psle-revision",
    ],
  },
  {
    label: "past year",
    sourcePath: "app/pages/past-year-exam-papers.vue",
    generatedPath: ".output/public/past-year-exam-papers/index.html",
    eventName: "past_year_collection_click",
    source: "past_year_collection_grid",
    handler: "trackPastYearCollectionClick",
    clickSnippet: "@click=\"trackPastYearCollectionClick(collection)\"",
    paths: [
      "/exam-papers/2025",
      "/exam-papers/2024",
      "/exam-papers/primary-6",
      "/exam-papers/primary-6-mathematics-sa2",
      "/exam-papers/primary-6-science-sa2",
      "/top-school-exam-papers",
    ],
  },
  {
    label: "test paper",
    sourcePath: "app/pages/test-papers.vue",
    generatedPath: ".output/public/test-papers/index.html",
    eventName: "test_paper_collection_click",
    source: "test_paper_collection_grid",
    handler: "trackTestCollectionClick",
    clickSnippet: "@click=\"trackTestCollectionClick(collection)\"",
    paths: [
      "/exam-papers/2025",
      "/exam-papers/primary-6",
      "/exam-papers/primary-6-mathematics",
      "/exam-papers/primary-6-science",
      "/exam-papers/sa2",
      "/exam-papers/psle-revision",
    ],
  },
];

for (const page of pages) {
  const source = readRequired(page.sourcePath);
  const generated = readRequired(page.generatedPath);

  for (const snippet of [
    "trackEvent",
    page.handler,
    page.eventName,
    page.source,
    "collection_title",
    "target_path",
    page.clickSnippet,
  ]) {
    if (!source.includes(snippet)) {
      fail(`${page.label} page is missing collection tracking snippet: ${snippet}`);
    }
  }

  for (const path of page.paths) {
    if (!source.includes(path)) {
      fail(`${page.label} page source is missing collection link: ${path}`);
    }
    if (!generated.includes(path)) {
      fail(`Generated ${page.label} page is missing collection link: ${path}`);
    }
  }

  if (!runbook.includes(page.eventName) || !runbook.includes(page.source)) {
    fail(`SEO runbook is missing ${page.label} funnel event or source documentation.`);
  }
}

for (const snippet of [
  "Broad Landing Funnel Checks",
  "download_exam_collection_click",
  "free_exam_collection_click",
  "past_year_collection_click",
  "test_paper_collection_click",
  "Custom event parameter `collection_title`",
  "paper_view_click",
  "paper_open",
  "paper_download",
]) {
  if (!runbook.includes(snippet)) {
    fail(`SEO runbook is missing broad landing funnel snippet: ${snippet}`);
  }
}

if (process.exitCode) process.exit();
console.log("Broad landing funnel audit passed.");
