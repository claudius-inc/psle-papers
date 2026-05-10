// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from "node:fs";

const files = JSON.parse(readFileSync("public/json/files.json", "utf8")) as string[];
const options = JSON.parse(
  readFileSync("public/json/dropdownOptions.json", "utf8"),
) as {
  Level: { code: string; name: string }[];
  Subject: { code: string; name: string }[];
  Type: { code: string; name: string }[];
  Year: { code: string; name: string }[];
  School: { code: string; name: string }[];
};

const slugify = (value: string) =>
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

const hasPapers = ({
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
  .map((filename) => `/view/${filename}`);

const seoIndexRoutes = [
  "/",
  "/sitemap",
  "/download-exam-papers",
  "/free-exam-papers",
  "/past-year-exam-papers",
  "/test-papers",
  "/top-school-exam-papers",
  "/exam-papers",
  "/exam-papers/2026-revision",
  "/exam-papers/psle-revision",
  ...years.map((year) => ({ path: `/exam-papers/${year.code}`, year: year.code })),
  ...levels.map((level) => ({
    path: `/exam-papers/${slugify(level.name)}`,
    levelCode: level.code,
  })),
  ...subjects.map((subject) => ({
    path: `/exam-papers/${slugify(subject.name)}`,
    subjectCode: subject.code,
  })),
  ...types.map((type) => ({
    path: `/exam-papers/${slugify(type.name)}`,
    typeCode: type.code,
  })),
  ...schools.map((school) => ({
    path: `/exam-papers/school-${slugify(school.name)}`,
    schoolCode: school.code,
  })),
  ...years.flatMap((year) =>
    levels.map((level) => ({
      path: `/exam-papers/${year.code}-${slugify(level.name)}`,
      year: year.code,
      levelCode: level.code,
    })),
  ),
  ...years.flatMap((year) =>
    subjects.map((subject) => ({
      path: `/exam-papers/${year.code}-${slugify(subject.name)}`,
      year: year.code,
      subjectCode: subject.code,
    })),
  ),
  ...years.flatMap((year) =>
    types.map((type) => ({
      path: `/exam-papers/${year.code}-${slugify(type.name)}`,
      year: year.code,
      typeCode: type.code,
    })),
  ),
  ...levels.flatMap((level) =>
    types.map((type) => ({
      path: `/exam-papers/${slugify(level.name)}-${slugify(type.name)}`,
      levelCode: level.code,
      typeCode: type.code,
    })),
  ),
  ...subjects.flatMap((subject) =>
    types.map((type) => ({
      path: `/exam-papers/${slugify(subject.name)}-${slugify(type.name)}`,
      subjectCode: subject.code,
      typeCode: type.code,
    })),
  ),
  ...years.flatMap((year) =>
    schools.map((school) => ({
      path: `/exam-papers/${year.code}-school-${slugify(school.name)}`,
      year: year.code,
      schoolCode: school.code,
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
      })),
    ),
  ),
  ...years.flatMap((year) =>
    types.flatMap((type) =>
      schools.map((school) => ({
        path: `/exam-papers/${year.code}-${slugify(type.name)}-school-${slugify(
          school.name,
        )}`,
        year: year.code,
        typeCode: type.code,
        schoolCode: school.code,
      })),
    ),
  ),
  ...levels.flatMap((level) =>
    schools.map((school) => ({
      path: `/exam-papers/${slugify(level.name)}-school-${slugify(school.name)}`,
      levelCode: level.code,
      schoolCode: school.code,
    })),
  ),
  ...subjects.flatMap((subject) =>
    schools.map((school) => ({
      path: `/exam-papers/${slugify(subject.name)}-school-${slugify(school.name)}`,
      subjectCode: subject.code,
      schoolCode: school.code,
    })),
  ),
  ...types.flatMap((type) =>
    schools.map((school) => ({
      path: `/exam-papers/${slugify(type.name)}-school-${slugify(school.name)}`,
      typeCode: type.code,
      schoolCode: school.code,
    })),
  ),
  ...levels.flatMap((level) =>
    subjects.flatMap((subject) =>
      schools.map((school) => ({
        path: `/exam-papers/${slugify(level.name)}-${slugify(
          subject.name,
        )}-school-${slugify(school.name)}`,
        levelCode: level.code,
        subjectCode: subject.code,
        schoolCode: school.code,
      })),
    ),
  ),
  ...years.flatMap((year) =>
    levels.flatMap((level) =>
      subjects.flatMap((subject) =>
        schools.map((school) => ({
          path: `/exam-papers/${year.code}-${slugify(level.name)}-${slugify(
            subject.name,
          )}-school-${slugify(school.name)}`,
          year: year.code,
          levelCode: level.code,
          subjectCode: subject.code,
          schoolCode: school.code,
        })),
      ),
    ),
  ),
  ...levels.flatMap((level) =>
    subjects.map((subject) => ({
      path: `/exam-papers/${slugify(level.name)}-${slugify(subject.name)}`,
      levelCode: level.code,
      subjectCode: subject.code,
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
        })),
      ),
    ),
  ),
  ...paperViewRoutes,
]
  .filter((route) => {
    if (typeof route === "string") return true;
    return hasPapers(route);
  })
  .map((route) => (typeof route === "string" ? route : route.path));

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: seoIndexRoutes,
    },
  },
});
