import rawFileList from "../../public/json/files.json";
import dropdownOptions from "../../public/json/dropdownOptions.json";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";

export interface PaperSeoRoute {
  slug: string;
  path: string;
  title: string;
  description: string;
  paperCount: number;
  year?: string;
  levelCode?: string;
  subjectCode?: string;
  typeCode?: string;
  schoolCode?: string;
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

export const typeSlugMap = Object.fromEntries(
  options.Type.filter((option) => option.code !== "0").map((option) => [
    slugify(option.name),
    option.code,
  ]),
);

export const schoolSlugMap = Object.fromEntries(
  options.School.filter((option) => option.code !== "0").map((option) => [
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
  // Newest first: year desc, then level desc (P6 above lower levels within a year),
  // then school code asc as a stable tie-breaker.
  .sort((a, b) => {
    if (a.yearCode !== b.yearCode) return Number(b.yearCode) - Number(a.yearCode);
    if (a.levelCode !== b.levelCode) return Number(b.levelCode) - Number(a.levelCode);
    return a.schoolCode.localeCompare(b.schoolCode);
  });

const yearOptions = options.Year.filter((option) => option.code !== "0");
const levelOptions = options.Level.filter((option) => option.code !== "0");
const subjectOptions = options.Subject.filter((option) => option.code !== "0");
const typeOptions = options.Type.filter((option) => option.code !== "0");
const schoolOptions = options.School.filter((option) => option.code !== "0");

const formatLevelName = (name: string) => name.replace(/^P([1-6])$/, "Primary $1");
const formatLevelTitle = (name: string) => name.replace(/^P([1-6])$/, "P$1");
const formatSubjectName = (name: string) =>
  name === "Mathematics" ? "Maths" : name;
const formatTypeTitle = (name: string) =>
  name === "Practice Paper" ? "Practice Papers" : name;
const formatSchoolTitle = (name: string) =>
  name.replace(/\s+\(primary\)$/i, "").replace(/\s+\(junior\)$/i, " Junior");
const latestYear = Math.max(...yearOptions.map((year) => Number(year.code))).toString();

const countPapers = ({
  year,
  levelCode,
  subjectCode,
  typeCode,
  schoolCode,
}: {
  year?: string;
  levelCode?: string;
  subjectCode?: string;
  typeCode?: string;
  schoolCode?: string;
}) =>
  allParsedPapers.filter((paper) => {
    if (year && paper.yearCode !== year) return false;
    if (levelCode && paper.levelCode !== levelCode) return false;
    if (subjectCode && paper.subjectCode !== subjectCode) return false;
    if (typeCode && paper.typeCode !== typeCode) return false;
    if (schoolCode && paper.schoolCode !== schoolCode) return false;
    return true;
  }).length;

const buildCollectionDescription = ({
  paperCount,
  titleParts,
  year,
  levelCode,
  typeCode,
  schoolCode,
}: {
  paperCount: number;
  titleParts: string[];
  year?: string;
  levelCode?: string;
  typeCode?: string;
  schoolCode?: string;
}) => {
  const count = paperCount.toLocaleString();

  if (!titleParts.length) {
    return `Download ${count} free Singapore primary exam papers PDF files for P2-P6 Maths, Science, English and Chinese. View online for 2026 revision.`;
  }

  const focus = titleParts
    .map((part) => part.replace(/^P([1-6])$/, "Primary $1"))
    .join(" ");
  const fullPaperLabel = titleParts.includes("Practice Papers")
    ? `${focus} PDFs`
    : `${focus} exam papers`;
  const shortPaperLabel = titleParts.includes("Practice Papers")
    ? `${focus} PDFs`
    : `${focus} papers`;
  const action = schoolCode
    ? "Compare school papers online, then download free PDFs for revision."
    : levelCode === "6"
      ? "View online or download free PDFs for PSLE revision."
      : year === latestYear
        ? "Latest available for 2026 revision. View online or download free PDFs."
        : typeCode
          ? "View online or download free PDFs for Singapore primary timed practice."
          : "View online or download free PDFs for Singapore primary revision.";
  const descriptions = [
    `${count} free ${fullPaperLabel}. ${action}`,
    `${count} free ${shortPaperLabel}. ${action}`,
    `${count} free exam paper PDFs in this collection. ${action}`,
  ];

  return descriptions.find((description) => description.length <= 170) || descriptions[2];
};

const buildRoute = ({
  slug,
  year,
  levelCode,
  subjectCode,
  typeCode,
  schoolCode,
}: {
  slug: string;
  year?: string;
  levelCode?: string;
  subjectCode?: string;
  typeCode?: string;
  schoolCode?: string;
}): PaperSeoRoute => {
  const levelName = formatLevelName(getOptionName("Level", levelCode));
  const levelTitle = formatLevelTitle(getOptionName("Level", levelCode));
  const subjectName = formatSubjectName(getOptionName("Subject", subjectCode));
  const typeName = getOptionName("Type", typeCode);
  const typeTitle = formatTypeTitle(typeName);
  const schoolName = getOptionName("School", schoolCode);
  const schoolTitle = formatSchoolTitle(schoolName);
  const parts = [year, levelName, subjectName, typeTitle, schoolName].filter(Boolean);
  const titleParts = [year, levelTitle, subjectName, typeTitle, schoolTitle].filter(Boolean);
  const label = parts.length
    ? parts.includes("Practice Papers")
      ? parts.join(" ")
      : `${parts.join(" ")} exam papers`
    : "exam papers";
  const paperCount = countPapers({
    year,
    levelCode,
    subjectCode,
    typeCode,
    schoolCode,
  });
  const bareTitle = titleParts.length
    ? titleParts.includes("Practice Papers")
      ? titleParts.join(" ")
      : `${titleParts.join(" ")} Exam Papers`
    : "Singapore Primary Exam Papers PDF | Free Download";
  const titleWithBrand = `${bareTitle} | SG Exam Hub`;
  const title = titleWithBrand.length > 70 ? bareTitle : titleWithBrand;
  const description = buildCollectionDescription({
    paperCount,
    titleParts,
    year,
    levelCode,
    typeCode,
    schoolCode,
  });

  return {
    slug,
    path: slug ? `/exam-papers/${slug}` : "/exam-papers",
    title,
    description,
    paperCount,
    year,
    levelCode,
    subjectCode,
    typeCode,
    schoolCode,
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
  ...typeOptions.map((type) =>
    buildRoute({ slug: slugify(type.name), typeCode: type.code }),
  ),
  ...schoolOptions.map((school) =>
    buildRoute({
      slug: `school-${slugify(school.name)}`,
      schoolCode: school.code,
    }),
  ),
  ...yearOptions.flatMap((year) =>
    levelOptions.map((level) =>
      buildRoute({
        slug: `${year.code}-${slugify(level.name)}`,
        year: year.code,
        levelCode: level.code,
      }),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    subjectOptions.map((subject) =>
      buildRoute({
        slug: `${year.code}-${slugify(subject.name)}`,
        year: year.code,
        subjectCode: subject.code,
      }),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    typeOptions.map((type) =>
      buildRoute({
        slug: `${year.code}-${slugify(type.name)}`,
        year: year.code,
        typeCode: type.code,
      }),
    ),
  ),
  ...levelOptions.flatMap((level) =>
    typeOptions.map((type) =>
      buildRoute({
        slug: `${slugify(level.name)}-${slugify(type.name)}`,
        levelCode: level.code,
        typeCode: type.code,
      }),
    ),
  ),
  ...subjectOptions.flatMap((subject) =>
    typeOptions.map((type) =>
      buildRoute({
        slug: `${slugify(subject.name)}-${slugify(type.name)}`,
        subjectCode: subject.code,
        typeCode: type.code,
      }),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    schoolOptions.map((school) =>
      buildRoute({
        slug: `${year.code}-school-${slugify(school.name)}`,
        year: year.code,
        schoolCode: school.code,
      }),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    levelOptions.flatMap((level) =>
      schoolOptions.map((school) =>
        buildRoute({
          slug: `${year.code}-${slugify(level.name)}-school-${slugify(school.name)}`,
          year: year.code,
          levelCode: level.code,
          schoolCode: school.code,
        }),
      ),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    typeOptions.flatMap((type) =>
      schoolOptions.map((school) =>
        buildRoute({
          slug: `${year.code}-${slugify(type.name)}-school-${slugify(school.name)}`,
          year: year.code,
          typeCode: type.code,
          schoolCode: school.code,
        }),
      ),
    ),
  ),
  ...levelOptions.flatMap((level) =>
    schoolOptions.map((school) =>
      buildRoute({
        slug: `${slugify(level.name)}-school-${slugify(school.name)}`,
        levelCode: level.code,
        schoolCode: school.code,
      }),
    ),
  ),
  ...subjectOptions.flatMap((subject) =>
    schoolOptions.map((school) =>
      buildRoute({
        slug: `${slugify(subject.name)}-school-${slugify(school.name)}`,
        subjectCode: subject.code,
        schoolCode: school.code,
      }),
    ),
  ),
  ...typeOptions.flatMap((type) =>
    schoolOptions.map((school) =>
      buildRoute({
        slug: `${slugify(type.name)}-school-${slugify(school.name)}`,
        typeCode: type.code,
        schoolCode: school.code,
      }),
    ),
  ),
  ...levelOptions.flatMap((level) =>
    subjectOptions.flatMap((subject) =>
      schoolOptions.map((school) =>
        buildRoute({
          slug: `${slugify(level.name)}-${slugify(subject.name)}-school-${slugify(
            school.name,
          )}`,
          levelCode: level.code,
          subjectCode: subject.code,
          schoolCode: school.code,
        }),
      ),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    levelOptions.flatMap((level) =>
      subjectOptions.flatMap((subject) =>
        schoolOptions.map((school) =>
          buildRoute({
            slug: `${year.code}-${slugify(level.name)}-${slugify(
              subject.name,
            )}-school-${slugify(school.name)}`,
            year: year.code,
            levelCode: level.code,
            subjectCode: subject.code,
            schoolCode: school.code,
          }),
        ),
      ),
    ),
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
  ...yearOptions.flatMap((year) =>
    levelOptions.flatMap((level) =>
      typeOptions.map((type) =>
        buildRoute({
          slug: `${year.code}-${slugify(level.name)}-${slugify(type.name)}`,
          year: year.code,
          levelCode: level.code,
          typeCode: type.code,
        }),
      ),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    subjectOptions.flatMap((subject) =>
      typeOptions.map((type) =>
        buildRoute({
          slug: `${year.code}-${slugify(subject.name)}-${slugify(type.name)}`,
          year: year.code,
          subjectCode: subject.code,
          typeCode: type.code,
        }),
      ),
    ),
  ),
  ...levelOptions.flatMap((level) =>
    subjectOptions.flatMap((subject) =>
      typeOptions.map((type) =>
        buildRoute({
          slug: `${slugify(level.name)}-${slugify(subject.name)}-${slugify(
            type.name,
          )}`,
          levelCode: level.code,
          subjectCode: subject.code,
          typeCode: type.code,
        }),
      ),
    ),
  ),
  ...yearOptions.flatMap((year) =>
    levelOptions.flatMap((level) =>
      subjectOptions.flatMap((subject) =>
        typeOptions.map((type) =>
          buildRoute({
            slug: `${year.code}-${slugify(level.name)}-${slugify(
              subject.name,
            )}-${slugify(type.name)}`,
            year: year.code,
            levelCode: level.code,
            subjectCode: subject.code,
            typeCode: type.code,
          }),
        ),
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
        if (route.typeCode && paper.typeCode !== route.typeCode) return false;
        if (route.schoolCode && paper.schoolCode !== route.schoolCode) return false;
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
    if (route.typeCode && paper.typeCode !== route.typeCode) return false;
    if (route.schoolCode && paper.schoolCode !== route.schoolCode) return false;
    return true;
  });
