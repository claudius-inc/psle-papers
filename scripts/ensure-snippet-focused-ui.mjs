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
      /{{\s*totalPaperCountRounded\.toLocaleString\(\)\s*}}\+/g,
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

const insertHomepageLinksAfter = (source, anchor, additions, filePath) => {
  if (!source.includes(anchor)) {
    fail(`${filePath} is missing homepage directory anchor: ${anchor}`);
    return source;
  }

  const missingAdditions = additions.filter((addition) => !source.includes(addition));
  if (!missingAdditions.length) return source;

  return source.replace(anchor, `${anchor}\n${missingAdditions.join("\n")}`);
};

const ensureHomepagePriorityDirectoryLinks = (source, filePath) => {
  let next = source;

  next = insertHomepageLinksAfter(
    next,
    '      { label: "Primary 6 English Exam Papers", to: "/exam-papers/primary-6-english" },',
    [
      '      { label: "Primary 6 Chinese Exam Papers", to: "/exam-papers/primary-6-chinese" },',
    ],
    filePath,
  );

  next = insertHomepageLinksAfter(
    next,
    '      { label: "Primary 5 Science Exam Papers", to: "/exam-papers/primary-5-science" },',
    [
      '      { label: "Primary 5 English Exam Papers", to: "/exam-papers/primary-5-english" },',
      '      { label: "Primary 5 Chinese Exam Papers", to: "/exam-papers/primary-5-chinese" },',
    ],
    filePath,
  );

  next = insertHomepageLinksAfter(
    next,
    '      { label: "Primary 4 Maths Exam Papers", to: "/exam-papers/primary-4-mathematics" },',
    [
      '      { label: "Primary 4 Science Exam Papers", to: "/exam-papers/primary-4-science" },',
      '      { label: "Primary 4 English Exam Papers", to: "/exam-papers/primary-4-english" },',
      '      { label: "Primary 4 Chinese Exam Papers", to: "/exam-papers/primary-4-chinese" },',
      '      { label: "Primary 3 Maths Exam Papers", to: "/exam-papers/primary-3-mathematics" },',
      '      { label: "Primary 3 Science Exam Papers", to: "/exam-papers/primary-3-science" },',
      '      { label: "Primary 3 English Exam Papers", to: "/exam-papers/primary-3-english" },',
      '      { label: "Primary 3 Chinese Exam Papers", to: "/exam-papers/primary-3-chinese" },',
      '      { label: "Primary 3 Higher Chinese Exam Papers", to: "/exam-papers/primary-3-higher-chinese" },',
    ],
    filePath,
  );

  next = insertHomepageLinksAfter(
    next,
    '      { label: "English SA2 Exam Papers", to: "/exam-papers/english-sa2" },',
    [
      '      { label: "Chinese SA2 Exam Papers", to: "/exam-papers/chinese-sa2" },',
      '      { label: "Primary 6 English SA2 Exam Papers", to: "/exam-papers/primary-6-english-sa2" },',
      '      { label: "Primary 6 Chinese SA2 Exam Papers", to: "/exam-papers/primary-6-chinese-sa2" },',
    ],
    filePath,
  );

  for (const requiredSnippet of [
    'Primary 6 Chinese Exam Papers',
    'Primary 5 English Exam Papers',
    'Primary 4 Science Exam Papers',
    'Primary 3 Science Exam Papers',
    'Primary 6 Chinese SA2 Exam Papers',
  ]) {
    if (!next.includes(requiredSnippet)) {
      fail(`${filePath} is missing priority homepage directory link: ${requiredSnippet}`);
    }
  }

  return next;
};

for (const file of files) {
  let source = readFileSync(file.path, "utf8");

  source = addDataNosnippetToClass(source, file.filterClass, file.path);
  source = addDataNosnippetToResults(source, file.resultsClassBinding, file.path);
  if (file.path === "app/pages/index.vue") {
    source = normalizeHomepagePaperCountCopy(source);
    source = ensureHomepagePriorityDirectoryLinks(source, file.path);
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
