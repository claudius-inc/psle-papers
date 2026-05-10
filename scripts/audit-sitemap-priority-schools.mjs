import { existsSync, readFileSync } from "node:fs";

const sourcePath = "app/pages/sitemap.vue";
const generatedPath = ".output/public/sitemap/index.html";

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

const source = readRequired(sourcePath);
const generated = readRequired(generatedPath);

const prioritySchoolPaths = [
  "/exam-papers/school-raffles-girls-primary-school",
  "/exam-papers/school-nanyang-primary-school",
  "/exam-papers/school-henry-park-primary-school",
  "/exam-papers/school-methodist-girls-school-primary",
  "/exam-papers/school-singapore-chinese-girls-primary-school",
  "/exam-papers/school-chij-st-nicholas-girls-school",
  "/exam-papers/school-anglo-chinese-school-primary",
  "/exam-papers/school-anglo-chinese-school-junior",
  "/exam-papers/school-pei-hwa-presbyterian-primary-school",
  "/exam-papers/school-red-swastika-school",
  "/exam-papers/school-tao-nan-school",
];

for (const snippet of [
  "priorityTopSchoolLinks",
  "Priority school collections",
  "Top School Exam Paper Paths",
  "MGS",
  "SCGS",
  "CHIJ St. Nicholas",
  "Red Swastika",
  "Tao Nan",
]) {
  if (!source.includes(snippet)) {
    fail(`Sitemap source is missing priority school snippet: ${snippet}`);
  }
}

for (const path of prioritySchoolPaths) {
  if (!source.includes(path.replace("/exam-papers/", ""))) {
    fail(`Sitemap source is missing priority school slug for ${path}`);
  }
  if (!generated.includes(path)) {
    fail(`Generated sitemap page is missing priority school link: ${path}`);
  }
}

if (process.exitCode) process.exit();
console.log("Sitemap priority school audit passed.");
