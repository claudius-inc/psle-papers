import rawFileList from "../../public/json/files.json";
import dropdownOptions from "../../public/json/dropdownOptions.json";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";

export interface PaperSeoRoute {
  slug: string;
  path: string;
  title: string;
  description: string;
  year?: string;
  levelCode?: string;
  subjectCode?: string;
}

const options = dropdownOptions as DropdownData;
const rawFiles = rawFileList as string[];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/p([1-6])$/, "primary-$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const levelSlugMap = Object.fromEntries(
  options.Level.filter((option) => option.code !== "0").map((option) => [
    slugify(option.name),
    option.code,
  ]),
);

export const subjectSlugMap = Object.fromEntries(
  options.Subject.filter((option) => option.code !== "0").map((option) => [
    slugify(option.name),
    option.code,
  ]),
);

export const getOptionName = (
  category: keyof DropdownData,
  code: string | undefined,
) => {
  if (!code) return "";
  return options[category]?.find((option) => option.code === code)?.name || code;
};

export const parsePaper = (filename: string): ParsedPaper | null => {
  const parts = filename.split("_");
  if (parts.length !== 5) return null;

  const [levelCode, schoolCode, subjectCode, typeCode, yearCode] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];

  return {
    filename,
    levelCode,
    schoolCode,
    subjectCode,
    typeCode,
    yearCode,
    levelName: getOptionName("Level", levelCode),
    schoolName: getOptionName("School", schoolCode),
    subjectName: getOptionName("Subject", subjectCode),
    typeName: getOptionName("Type", typeCode),
  };
};

export const allParsedPapers = rawFiles
  .map((filename) => parsePaper(filename))
  .filter((paper): paper is ParsedPaper => paper !== null)
  // Newest first: year desc, then level desc (P6 above P1 within a year),
  // then school code asc as a stable tie-breaker.
  .sort((a, b) => {
    if (a.yearCode !== b.yearCode) return Number(b.yearCode) - Number(a.yearCode);
    if (a.levelCode !== b.levelCode) return Number(b.levelCode) - Number(a.levelCode);
    return a.schoolCode.localeCompare(b.schoolCode);
  });

const yearOptions = options.Year.filter((option) => option.code !== "0");
const levelOptions = options.Level.filter((option) => option.code !== "0");
const subjectOptions = options.Subject.filter((option) => option.code !== "0");

const buildRoute = ({
  slug,
  year,
  levelCode,
  subjectCode,
}: {
  slug: string;
  year?: string;
  levelCode?: string;
  subjectCode?: string;
}): PaperSeoRoute => {
  const levelName = getOptionName("Level", levelCode);
  const subjectName = getOptionName("Subject", subjectCode);
  const parts = [year, levelName, subjectName].filter(Boolean);
  const label = parts.length ? `${parts.join(" ")} exam papers` : "exam papers";
  const title = `${label.replace(/^./, (char) => char.toUpperCase())} | SG Exam Hub`;
  const description = `Browse free Singapore primary school ${label} with online viewing and PDF downloads for revision practice.`;

  return {
    slug,
    path: slug ? `/exam-papers/${slug}` : "/exam-papers",
    title,
    description,
    year,
    levelCode,
    subjectCode,
  };
};

export const seoRoutes: PaperSeoRoute[] = [
  buildRoute({ slug: "" }),
  ...yearOptions.map((year) => buildRoute({ slug: year.code, year: year.code })),
  ...levelOptions.map((level) =>
    buildRoute({ slug: slugify(level.name), levelCode: level.code }),
  ),
  ...subjectOptions.map((subject) =>
    buildRoute({ slug: slugify(subject.name), subjectCode: subject.code }),
  ),
  ...levelOptions.flatMap((level) =>
    subjectOptions.map((subject) =>
      buildRoute({
        slug: `${slugify(level.name)}-${slugify(subject.name)}`,
        levelCode: level.code,
        subjectCode: subject.code,
      }),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    levelOptions.flatMap((level) =>
      subjectOptions.map((subject) =>
        buildRoute({
          slug: `${year.code}-${slugify(level.name)}-${slugify(subject.name)}`,
          year: year.code,
          levelCode: level.code,
          subjectCode: subject.code,
        }),
      ),
    ),
  ),
].filter((route) =>
  route.slug === ""
    ? true
    : allParsedPapers.some((paper) => {
        if (route.year && paper.yearCode !== route.year) return false;
        if (route.levelCode && paper.levelCode !== route.levelCode) return false;
        if (route.subjectCode && paper.subjectCode !== route.subjectCode) {
          return false;
        }
        return true;
      }),
);

export const getSeoRouteBySlug = (slug: string) =>
  seoRoutes.find((route) => route.slug === slug);

export const getPapersForRoute = (route: PaperSeoRoute) =>
  allParsedPapers.filter((paper) => {
    if (route.year && paper.yearCode !== route.year) return false;
    if (route.levelCode && paper.levelCode !== route.levelCode) return false;
    if (route.subjectCode && paper.subjectCode !== route.subjectCode) return false;
    return true;
  });
