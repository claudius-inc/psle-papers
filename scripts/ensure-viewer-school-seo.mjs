import { readFileSync, writeFileSync } from "node:fs";

const viewerPath = "app/pages/view/[id].vue";
const source = readFileSync(viewerPath, "utf8");

const staleTitleSchoolBlock = `const titleSchool = computed(() =>
  paper.value?.schoolName
    .replace(/\\s+\\(primary\\)$/i, "")
    .replace(/\\s+\\(junior\\)$/i, " Junior") || "",
);`;

const officialTitleSchoolBlock = `const titleSchool = computed(() => paper.value?.schoolName || "");`;
const compactPracticeMeta = `<small>{{ item.levelName }} {{ item.subjectName }} {{ item.typeName }}</small>`;
const readablePracticeMeta = `<small>Level {{ item.levelName }} · {{ item.subjectName }} · {{ item.typeName }}</small>`;
const splitReadablePracticeTitle = `<strong>{{ item.yearCode }} {{ item.schoolName }}</strong>
                ${readablePracticeMeta}`;
const splitCompactPracticeTitle = `<strong>{{ item.yearCode }} {{ item.schoolName }}</strong>
                ${compactPracticeMeta}`;
const combinedPracticeTitle = `<strong>{{ item.yearCode }} {{ item.schoolName }} {{ item.levelName }} {{ item.subjectName }} {{ item.typeName }}</strong>
                <small>Open next related paper</small>`;

let nextSource = source;

if (nextSource.includes(staleTitleSchoolBlock)) {
  nextSource = nextSource.replace(staleTitleSchoolBlock, officialTitleSchoolBlock);
} else if (!nextSource.includes(officialTitleSchoolBlock)) {
  console.error(
    `${viewerPath} is missing the expected viewer school-title block. Review viewer SEO school-name handling.`,
  );
  process.exit(1);
}

if (nextSource.includes(splitReadablePracticeTitle)) {
  nextSource = nextSource.replace(splitReadablePracticeTitle, combinedPracticeTitle);
} else if (nextSource.includes(splitCompactPracticeTitle)) {
  nextSource = nextSource.replace(splitCompactPracticeTitle, combinedPracticeTitle);
} else if (nextSource.includes(compactPracticeMeta)) {
  nextSource = nextSource.replace(compactPracticeMeta, readablePracticeMeta);
}

if (!nextSource.includes(combinedPracticeTitle)) {
  console.error(
    `${viewerPath} is missing the expected viewer practice-sequence title block.`,
  );
  process.exit(1);
}

for (const staleSnippet of [
  "replace(/\\s+\\(primary\\)$/i",
  "replace(/\\s+\\(junior\\)$/i",
  "<strong>{{ item.yearCode }} {{ item.schoolName }}</strong>",
  "{{ item.schoolName }}</strong>\n                <small>{{ item.levelName }}",
  "{{ item.schoolName }}</strong>\n                <small>Level {{ item.levelName }}",
]) {
  if (nextSource.includes(staleSnippet)) {
    console.error(`${viewerPath} contains stale viewer SEO snippet: ${staleSnippet}`);
    process.exit(1);
  }
}

if (nextSource !== source) {
  writeFileSync(viewerPath, nextSource);
  console.log("Normalized viewer SEO school names and sequence metadata.");
} else {
  console.log("Viewer SEO school names and sequence metadata already normalized.");
}
