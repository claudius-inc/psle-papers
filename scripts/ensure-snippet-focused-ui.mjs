import { readFileSync, writeFileSync } from "node:fs";

const files = [
  {
    path: "app/pages/index.vue",
    replacements: [
      [
        '<section class="filters-bar"',
        '<section class="filters-bar" data-nosnippet',
      ],
      [
        ':class="viewMode === \'grid\' ? \'papers-grid\' : \'papers-list\'"',
        ':class="viewMode === \'grid\' ? \'papers-grid\' : \'papers-list\'" data-nosnippet',
      ],
    ],
    expectedSnippets: [
      '<section class="filters-bar" data-nosnippet',
      "data-nosnippet",
    ],
  },
  {
    path: "app/pages/exam-papers/[[slug]].vue",
    replacements: [
      [
        '<section class="filter-container"',
        '<section class="filter-container" data-nosnippet',
      ],
      [
        ':class="viewMode === \'grid\' ? \'papers-grid\' : \'papers-list\'"',
        ':class="viewMode === \'grid\' ? \'papers-grid\' : \'papers-list\'" data-nosnippet',
      ],
    ],
    expectedSnippets: [
      '<section class="filter-container" data-nosnippet',
      "data-nosnippet",
    ],
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

for (const file of files) {
  let source = readFileSync(file.path, "utf8");

  for (const [before, after] of file.replacements) {
    if (source.includes(after)) continue;
    if (!source.includes(before)) {
      fail(`${file.path} is missing snippet target: ${before}`);
      continue;
    }
    source = source.replace(before, after);
  }

  for (const snippet of file.expectedSnippets) {
    if (!source.includes(snippet)) {
      fail(`${file.path} is missing expected snippet-focused UI marker: ${snippet}`);
    }
  }

  writeFileSync(file.path, source);
}

if (process.exitCode) process.exit();
console.log("Snippet-focused UI normalizer passed.");
