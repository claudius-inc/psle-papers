import { existsSync, readFileSync } from "node:fs";

const sourcePath = "public/json/dropdownOptions.json";
const routeSourcePath = "app/utils/paperSeo.ts";
const viewerSourcePath = "app/pages/view/[id].vue";
const generatedChecks = [
  {
    path: ".output/public/index.html",
    snippets: ["Anglo-Chinese School (Junior)", "Anglo-Chinese School (Primary)"],
  },
  {
    path: ".output/public/sitemap/index.html",
    snippets: ["Anglo-Chinese School (Primary)", "Anglo-Chinese School (Junior)"],
  },
  {
    path: ".output/public/exam-papers/school-anglo-chinese-school-primary/index.html",
    snippets: ["Anglo-Chinese School (Primary)", "Anglo-Chinese School (Primary) Exam Papers"],
  },
  {
    path: ".output/public/exam-papers/school-anglo-chinese-school-junior/index.html",
    snippets: ["Anglo-Chinese School (Junior) Exam Papers"],
  },
  {
    path: ".output/public/view/6_1073_3_4_2025/index.html",
    snippets: ["Raffles Girls&#39; Primary School", "Level P6"],
  },
];

const weakSchoolNamePattern = /Anglo Chinese School/g;

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const source = readFileSync(sourcePath, "utf8");
const routeSource = readFileSync(routeSourcePath, "utf8");
const viewerSource = readFileSync(viewerSourcePath, "utf8");

for (const snippet of [
  '"name": "Anglo-Chinese School (Junior)"',
  '"name": "Anglo-Chinese School (Primary)"',
]) {
  if (!source.includes(snippet)) {
    fail(`${sourcePath} is missing official school name: ${snippet}`);
  }
}

if (weakSchoolNamePattern.test(source)) {
  fail(`${sourcePath} still contains unhyphenated Anglo Chinese School.`);
}

for (const snippet of [
  "const formatSchoolTitle = (name: string) => name;",
  "schoolOptions.map((school) =>",
  "const trimToTitleLimit = (candidate: string) =>",
  "titleCandidates.find((candidate) => candidate.length <= 70) || compactBareTitle",
]) {
  if (!routeSource.includes(snippet)) {
    fail(`${routeSourcePath} is missing source guard snippet: ${snippet}`);
  }
}

if (!viewerSource.includes('const titleSchool = computed(() => paper.value?.schoolName || "");')) {
  fail(`${viewerSourcePath} must preserve official school names in viewer SEO titles.`);
}

if (!viewerSource.includes("Level {{ item.levelName }}")) {
  fail(`${viewerSourcePath} must label practice-sequence levels to avoid concatenated snippets.`);
}

for (const staleSnippet of [
  "replace(/\\s+\\(primary\\)$/i",
  "replace(/\\s+\\(junior\\)$/i",
  "{{ item.schoolName }}</strong>\n                <small>{{ item.levelName }}",
]) {
  if (viewerSource.includes(staleSnippet)) {
    fail(`${viewerSourcePath} contains stale viewer SEO snippet: ${staleSnippet}`);
  }
}

for (const staleSnippet of [
  "replace(/\\s+\\(primary\\)$/i",
  "schools.map((school) =>",
  "const title =\n    titleCandidates.find((candidate) => candidate.length <= 70) || compactBareTitle;",
]) {
  if (routeSource.includes(staleSnippet)) {
    fail(`${routeSourcePath} contains stale school-name route snippet: ${staleSnippet}`);
  }
}

for (const check of generatedChecks) {
  if (!existsSync(check.path)) {
    fail(`Missing generated page for school-name audit: ${check.path}`);
    continue;
  }

  const html = readFileSync(check.path, "utf8");
  if (weakSchoolNamePattern.test(html)) {
    fail(`${check.path} still contains unhyphenated Anglo Chinese School.`);
  }

  for (const snippet of check.snippets) {
    if (!html.includes(snippet)) {
      fail(`${check.path} is missing official school-name snippet: ${snippet}`);
    }
  }
}

if (process.exitCode) process.exit();
console.log("School name quality audit passed.");
