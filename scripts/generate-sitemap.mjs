import { readFileSync, writeFileSync } from "node:fs";

const siteUrl = "https://sgexamhub.com";
const files = JSON.parse(readFileSync("public/json/files.json", "utf8"));
const options = JSON.parse(readFileSync("public/json/dropdownOptions.json", "utf8"));

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/p([1-6])$/, "primary-$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const years = options.Year.filter((option) => option.code !== "0");
const levels = options.Level.filter((option) => option.code !== "0");
const subjects = options.Subject.filter((option) => option.code !== "0");
const types = options.Type.filter((option) => option.code !== "0");
const schools = options.School.filter((option) => option.code !== "0");

const hasPapers = ({ year, levelCode, subjectCode, typeCode, schoolCode }) =>
  files.some((filename) => {
    const [paperLevel, paperSchool, paperSubject, paperType, paperYear] =
      filename.split("_");
    if (year && paperYear !== year) return false;
    if (levelCode && paperLevel !== levelCode) return false;
    if (subjectCode && paperSubject !== subjectCode) return false;
    if (typeCode && paperType !== typeCode) return false;
    if (schoolCode && paperSchool !== schoolCode) return false;
    return true;
  });

const paperViewRoutes = files
  .filter((filename) => filename.split("_").length === 5)
  .sort((a, b) => {
    const [levelA, schoolA, , , yearA] = a.split("_");
    const [levelB, schoolB, , , yearB] = b.split("_");
    if (yearA !== yearB) return Number(yearB) - Number(yearA);
    if (levelA !== levelB) return Number(levelB) - Number(levelA);
    return schoolA.localeCompare(schoolB);
  })
  .map((filename) => ({
    path: `/view/${filename}`,
    priority: "0.5",
    changefreq: "monthly",
  }));

const routeEntries = [
  { path: "/", priority: "1.0" },
  { path: "/sitemap", priority: "0.7" },
  { path: "/exam-papers", priority: "0.9" },
  ...years.map((year) => ({
    path: `/exam-papers/${year.code}`,
    year: year.code,
    priority: "0.8",
  })),
  ...levels.map((level) => ({
    path: `/exam-papers/${slugify(level.name)}`,
    levelCode: level.code,
    priority: "0.8",
  })),
  ...subjects.map((subject) => ({
    path: `/exam-papers/${slugify(subject.name)}`,
    subjectCode: subject.code,
    priority: "0.8",
  })),
  ...types.map((type) => ({
    path: `/exam-papers/${slugify(type.name)}`,
    typeCode: type.code,
    priority: "0.8",
  })),
  ...schools.map((school) => ({
    path: `/exam-papers/school-${slugify(school.name)}`,
    schoolCode: school.code,
    priority: "0.7",
  })),
  ...years.flatMap((year) =>
    levels.map((level) => ({
      path: `/exam-papers/${year.code}-${slugify(level.name)}`,
      year: year.code,
      levelCode: level.code,
      priority: "0.7",
    })),
  ),
  ...years.flatMap((year) =>
    subjects.map((subject) => ({
      path: `/exam-papers/${year.code}-${slugify(subject.name)}`,
      year: year.code,
      subjectCode: subject.code,
      priority: "0.7",
    })),
  ),
  ...years.flatMap((year) =>
    types.map((type) => ({
      path: `/exam-papers/${year.code}-${slugify(type.name)}`,
      year: year.code,
      typeCode: type.code,
      priority: "0.7",
    })),
  ),
  ...levels.flatMap((level) =>
    types.map((type) => ({
      path: `/exam-papers/${slugify(level.name)}-${slugify(type.name)}`,
      levelCode: level.code,
      typeCode: type.code,
      priority: "0.7",
    })),
  ),
  ...subjects.flatMap((subject) =>
    types.map((type) => ({
      path: `/exam-papers/${slugify(subject.name)}-${slugify(type.name)}`,
      subjectCode: subject.code,
      typeCode: type.code,
      priority: "0.7",
    })),
  ),
  ...years.flatMap((year) =>
    schools.map((school) => ({
      path: `/exam-papers/${year.code}-school-${slugify(school.name)}`,
      year: year.code,
      schoolCode: school.code,
      priority: "0.6",
    })),
  ),
  ...years.flatMap((year) =>
    levels.flatMap((level) =>
      schools.map((school) => ({
        path: `/exam-papers/${year.code}-${slugify(level.name)}-school-${slugify(
          school.name,
        )}`,
        year: year.code,
        levelCode: level.code,
        schoolCode: school.code,
        priority: "0.55",
      })),
    ),
  ),
  ...levels.flatMap((level) =>
    subjects.map((subject) => ({
      path: `/exam-papers/${slugify(level.name)}-${slugify(subject.name)}`,
      levelCode: level.code,
      subjectCode: subject.code,
      priority: "0.7",
    })),
  ),
  ...years.flatMap((year) =>
    levels.flatMap((level) =>
      subjects.map((subject) => ({
        path: `/exam-papers/${year.code}-${slugify(level.name)}-${slugify(
          subject.name,
        )}`,
        year: year.code,
        levelCode: level.code,
        subjectCode: subject.code,
        priority: "0.6",
      })),
    ),
  ),
  ...years.flatMap((year) =>
    levels.flatMap((level) =>
      types.map((type) => ({
        path: `/exam-papers/${year.code}-${slugify(level.name)}-${slugify(
          type.name,
        )}`,
        year: year.code,
        levelCode: level.code,
        typeCode: type.code,
        priority: "0.6",
      })),
    ),
  ),
  ...years.flatMap((year) =>
    subjects.flatMap((subject) =>
      types.map((type) => ({
        path: `/exam-papers/${year.code}-${slugify(subject.name)}-${slugify(
          type.name,
        )}`,
        year: year.code,
        subjectCode: subject.code,
        typeCode: type.code,
        priority: "0.6",
      })),
    ),
  ),
  ...levels.flatMap((level) =>
    subjects.flatMap((subject) =>
      types.map((type) => ({
        path: `/exam-papers/${slugify(level.name)}-${slugify(
          subject.name,
        )}-${slugify(type.name)}`,
        levelCode: level.code,
        subjectCode: subject.code,
        typeCode: type.code,
        priority: "0.7",
      })),
    ),
  ),
  ...years.flatMap((year) =>
    levels.flatMap((level) =>
      subjects.flatMap((subject) =>
        types.map((type) => ({
          path: `/exam-papers/${year.code}-${slugify(level.name)}-${slugify(
            subject.name,
          )}-${slugify(type.name)}`,
          year: year.code,
          levelCode: level.code,
          subjectCode: subject.code,
          typeCode: type.code,
          priority: "0.6",
        })),
      ),
    ),
  ),
  ...paperViewRoutes,
].filter((route) => route.path === "/" || route.path === "/exam-papers" || hasPapers(route));

const today = new Date().toISOString().slice(0, 10);
const urls = routeEntries
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq || "weekly"}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

writeFileSync("public/sitemap.xml", sitemap);
console.log(`Generated ${routeEntries.length} sitemap URLs`);
