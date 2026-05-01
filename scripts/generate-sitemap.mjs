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

const hasPapers = ({ year, levelCode, subjectCode }) =>
  files.some((filename) => {
    const [paperLevel, , paperSubject, , paperYear] = filename.split("_");
    if (year && paperYear !== year) return false;
    if (levelCode && paperLevel !== levelCode) return false;
    if (subjectCode && paperSubject !== subjectCode) return false;
    return true;
  });

const routeEntries = [
  { path: "/", priority: "1.0" },
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
].filter((route) => route.path === "/" || route.path === "/exam-papers" || hasPapers(route));

const today = new Date().toISOString().slice(0, 10);
const urls = routeEntries
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
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
