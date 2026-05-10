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

let nextSource = source;

if (nextSource.includes(staleTitleSchoolBlock)) {
  nextSource = nextSource.replace(staleTitleSchoolBlock, officialTitleSchoolBlock);
} else if (!nextSource.includes(officialTitleSchoolBlock)) {
  console.error(
    `${viewerPath} is missing the expected viewer school-title block. Review viewer SEO school-name handling.`,
  );
  process.exit(1);
}

if (nextSource.includes(compactPracticeMeta)) {
  nextSource = nextSource.replace(compactPracticeMeta, readablePracticeMeta);
} else if (!nextSource.includes(readablePracticeMeta)) {
  console.error(
    `${viewerPath} is missing the expected viewer practice-sequence metadata block.`,
  );
  process.exit(1);
}

for (const staleSnippet of [
  "replace(/\\s+\\(primary\\)$/i",
  "replace(/\\s+\\(junior\\)$/i",
]) {
  if (nextSource.includes(staleSnippet)) {
    console.error(`${viewerPath} still strips official school qualifiers: ${staleSnippet}`);
    process.exit(1);
  }
}

if (nextSource.includes("{{ item.schoolName }}</strong>\n                <small>{{ item.levelName }}")) {
  console.error(`${viewerPath} can concatenate school names and levels in rendered snippets.`);
  process.exit(1);
}

if (nextSource !== source) {
  writeFileSync(viewerPath, nextSource);
  console.log("Normalized viewer SEO school names and sequence metadata.");
} else {
  console.log("Viewer SEO school names and sequence metadata already normalized.");
}
