import { existsSync, readFileSync } from "node:fs";

const sourcePath = "public/json/dropdownOptions.json";
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
];

const weakSchoolNamePattern = /Anglo Chinese School/g;

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

const source = readFileSync(sourcePath, "utf8");

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
