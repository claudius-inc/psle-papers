import { existsSync, readFileSync } from "node:fs";

const checks = [
  {
    path: "app/pages/index.vue",
    snippets: [
      'class="filters-bar" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
    ],
  },
  {
    path: "app/pages/exam-papers/[[slug]].vue",
    snippets: [
      'class="filter-container" data-nosnippet',
      ':class="[\'papers-container\', `papers-${viewMode}`]" data-nosnippet',
    ],
  },
  {
    path: ".output/public/index.html",
    snippets: [
      "data-nosnippet",
      "SG Exam Hub: Free Singapore Primary Exam Papers",
      "No sign-up needed",
    ],
  },
  {
    path: ".output/public/exam-papers/index.html",
    snippets: [
      "data-nosnippet",
      "Singapore Primary Exam Papers PDF | Free Download",
      "No sign-up needed",
    ],
  },
  {
    path: ".output/public/exam-papers/2025-primary-6-mathematics-sa2/index.html",
    snippets: [
      "data-nosnippet",
      "2025 Primary 6 Maths SA2 Exam Papers",
      "Download PDF",
    ],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

for (const check of checks) {
  if (!existsSync(check.path)) {
    fail(`Missing snippet-focused UI audit target: ${check.path}`);
    continue;
  }

  const content = readFileSync(check.path, "utf8");
  for (const snippet of check.snippets) {
    if (!content.includes(snippet)) {
      fail(`${check.path} is missing snippet-focused UI snippet: ${snippet}`);
    }
  }
}

if (process.exitCode) process.exit();
console.log("Snippet-focused UI audit passed.");
