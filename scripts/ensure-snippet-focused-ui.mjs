import { readFileSync, writeFileSync } from "node:fs";

const files = [
  {
    path: "app/pages/index.vue",
    filterClass: "filters-bar",
    resultsClassBinding: ':class="[\'papers-container\', `papers-${viewMode}`]"',
  },
  {
    path: "app/pages/exam-papers/[[slug]].vue",
    filterClass: "filter-container",
    resultsClassBinding: ':class="[\'papers-container\', `papers-${viewMode}`]"',
  },
];

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const addDataNosnippetToClass = (source, className, filePath) => {
  const classPattern = new RegExp(
    `(<(?:div|section)\\s+class="${className}"(?![^>]*\\bdata-nosnippet\\b))`,
  );

  if (!source.includes(`class="${className}"`)) {
    fail(`${filePath} is missing snippet-focused UI class: ${className}`);
    return source;
  }

  return source.replace(classPattern, "$1 data-nosnippet");
};

const addDataNosnippetToResults = (source, classBinding, filePath) => {
  const withMarker = `${classBinding} data-nosnippet`;

  if (source.includes(withMarker)) return source;
  if (!source.includes(classBinding)) {
    fail(`${filePath} is missing snippet-focused results binding: ${classBinding}`);
    return source;
  }

  return source.replace(classBinding, withMarker);
};

const normalizeHomepagePaperCountCopy = (source) => {
  const next = source
    .replace(
      /\{\{\s*totalPaperCountRounded\.toLocaleString\(\)\s*\}\}\+/g,
      "{{ totalPaperCount.toLocaleString() }}",
    )
    .replace(
      /const totalPaperCountRounded = computed\(\(\) => \{\n\s*const count = \(rawFileList as string\[\]\)\.length;\n\s*return Math\.floor\(count \/ 100\) \* 100;\n\}\);\n/g,
      "",
    )
    .replace(
      /(<div\s+class="hero-stats"(?![^>]*\bdata-nosnippet\b))/,
      "$1 data-nosnippet",
    );

  for (const staleSnippet of [
    "totalPaperCountRounded",
    "2,200+",
    "2,200 +",
  ]) {
    if (next.includes(staleSnippet)) {
      fail(`Homepage still exposes stale paper-count snippet copy: ${staleSnippet}`);
    }
  }
  if (!next.includes('class="hero-stats" data-nosnippet')) {
    fail("Homepage hero stats must be excluded from Google snippets.");
  }

  return next;
};

for (const file of files) {
  let source = readFileSync(file.path, "utf8");

  source = addDataNosnippetToClass(source, file.filterClass, file.path);
  source = addDataNosnippetToResults(source, file.resultsClassBinding, file.path);
  if (file.path === "app/pages/index.vue") {
    source = normalizeHomepagePaperCountCopy(source);
  }

  for (const snippet of [
    `class="${file.filterClass}" data-nosnippet`,
    `${file.resultsClassBinding} data-nosnippet`,
  ]) {
    if (!source.includes(snippet)) {
      fail(`${file.path} is missing expected snippet-focused UI marker: ${snippet}`);
    }
  }

  writeFileSync(file.path, source);
}

if (process.exitCode) process.exit();
console.log("Snippet-focused UI normalizer passed.");
