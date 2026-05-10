import { readFileSync, writeFileSync } from "node:fs";

const viewerPath = "app/pages/view/[id].vue";
const source = readFileSync(viewerPath, "utf8");

const staleTitleSchoolBlock = `const titleSchool = computed(() =>
  paper.value?.schoolName
    .replace(/\\s+\\(primary\\)$/i, "")
    .replace(/\\s+\\(junior\\)$/i, " Junior") || "",
);`;

const officialTitleSchoolBlock = `const titleSchool = computed(() => paper.value?.schoolName || "");`;

let nextSource = source;

if (source.includes(staleTitleSchoolBlock)) {
  nextSource = source.replace(staleTitleSchoolBlock, officialTitleSchoolBlock);
} else if (!source.includes(officialTitleSchoolBlock)) {
  console.error(
    `${viewerPath} is missing the expected viewer school-title block. Review viewer SEO school-name handling.`,
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

if (nextSource !== source) {
  writeFileSync(viewerPath, nextSource);
  console.log("Normalized viewer SEO school names.");
} else {
  console.log("Viewer SEO school names already normalized.");
}
