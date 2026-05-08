<script setup lang="ts">
import {
  allParsedPapers,
  seoRoutes,
  type PaperSeoRoute,
} from "~/utils/paperSeo";

const siteUrl = "https://sgexamhub.com";

const routeLabel = (route: PaperSeoRoute) =>
  route.title.replace(/\s+\|\s+SG Exam Hub$/, "");

const isRoute = (route: PaperSeoRoute, keys: Array<keyof PaperSeoRoute>) =>
  keys.every((key) => Boolean(route[key])) &&
  ["year", "levelCode", "subjectCode", "typeCode", "schoolCode"].every((key) =>
    keys.includes(key as keyof PaperSeoRoute)
      ? true
      : !route[key as keyof PaperSeoRoute],
  );

const sortByCount = (routes: PaperSeoRoute[]) =>
  [...routes].sort((a, b) => b.paperCount - a.paperCount || a.title.localeCompare(b.title));

const buildLinks = (routes: PaperSeoRoute[], limit?: number) =>
  sortByCount(routes)
    .slice(0, limit)
    .map((route) => ({
      label: routeLabel(route),
      to: route.path,
      count: route.paperCount,
    }));

const directorySections = [
  {
    title: "Core Pages",
    links: [
      { label: "Free Singapore Primary Exam Papers", to: "/", count: allParsedPapers.length },
      {
        label: "All Singapore Primary Exam Papers",
        to: "/exam-papers",
        count: allParsedPapers.length,
      },
    ],
  },
  {
    title: "Exam Papers By Year",
    links: buildLinks(seoRoutes.filter((route) => isRoute(route, ["year"]))),
  },
  {
    title: "Exam Papers By Primary Level",
    links: buildLinks(seoRoutes.filter((route) => isRoute(route, ["levelCode"]))),
  },
  {
    title: "Exam Papers By Subject",
    links: buildLinks(seoRoutes.filter((route) => isRoute(route, ["subjectCode"]))),
  },
  {
    title: "Exam Papers By Assessment Type",
    links: buildLinks(seoRoutes.filter((route) => isRoute(route, ["typeCode"]))),
  },
  {
    title: "Popular Year And Level Collections",
    links: buildLinks(
      seoRoutes.filter((route) => isRoute(route, ["year", "levelCode"])),
      40,
    ),
  },
  {
    title: "Popular Subject And Exam Type Collections",
    links: buildLinks(
      seoRoutes.filter((route) => isRoute(route, ["subjectCode", "typeCode"])),
    ),
  },
  {
    title: "Popular Level And Exam Type Collections",
    links: buildLinks(
      seoRoutes.filter((route) => isRoute(route, ["levelCode", "typeCode"])),
    ),
  },
  {
    title: "Popular Level Subject And Exam Type Collections",
    links: buildLinks(
      seoRoutes.filter((route) =>
        isRoute(route, ["levelCode", "subjectCode", "typeCode"]),
      ),
      60,
    ),
  },
  {
    title: "Popular School Level And Subject Collections",
    links: buildLinks(
      seoRoutes.filter((route) =>
        isRoute(route, ["levelCode", "subjectCode", "schoolCode"]),
      ),
      80,
    ),
  },
  {
    title: "Top School Exam Paper Collections",
    links: buildLinks(
      seoRoutes.filter((route) => isRoute(route, ["schoolCode"])),
      40,
    ),
  },
];

const latestPaperLinks = allParsedPapers.slice(0, 80).map((paper) => ({
  label: `${paper.yearCode} ${paper.levelName} ${paper.subjectName} ${paper.typeName} - ${paper.schoolName}`,
  to: `/view/${paper.filename}`,
}));

useHead({
  title: "SG Exam Hub Sitemap | Singapore Primary Exam Paper Directory",
  meta: [
    {
      name: "description",
      content:
        "Browse the SG Exam Hub sitemap for Singapore primary school exam papers by year, level, subject, assessment type, school and latest PDF papers.",
    },
    {
      name: "robots",
      content: "index, follow",
    },
  ],
  link: [{ rel: "canonical", href: `${siteUrl}/sitemap` }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "SG Exam Hub sitemap",
        itemListElement: directorySections
          .flatMap((section) => section.links)
          .slice(0, 100)
          .map((link, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: link.label,
            url: `${siteUrl}${link.to}`,
          })),
      }),
    },
  ],
});
</script>

<template>
  <main class="sitemap-page">
    <section class="hero">
      <div class="content-wrapper">
        <p class="eyebrow">SG Exam Hub directory</p>
        <h1>Singapore Primary Exam Paper Sitemap</h1>
        <p>
          Browse the main exam paper collections by year, primary level, subject,
          assessment type and school. Each link opens an indexed page with papers
          available to view online or download as PDF.
        </p>
      </div>
    </section>

    <section class="content-wrapper directory-grid" aria-label="Exam paper sitemap">
      <article
        v-for="section in directorySections"
        :key="section.title"
        class="directory-section"
      >
        <h2>{{ section.title }}</h2>
        <div class="directory-links">
          <NuxtLink
            v-for="link in section.links"
            :key="link.to"
            :to="link.to"
          >
            <span>{{ link.label }}</span>
            <small v-if="'count' in link">{{ link.count.toLocaleString() }} papers</small>
          </NuxtLink>
        </div>
      </article>
    </section>

    <section class="content-wrapper latest-section" aria-labelledby="latest-papers-heading">
      <div class="latest-header">
        <h2 id="latest-papers-heading">Latest Paper Pages</h2>
        <NuxtLink to="/exam-papers">Browse all papers</NuxtLink>
      </div>
      <div class="latest-links">
        <NuxtLink
          v-for="paper in latestPaperLinks"
          :key="paper.to"
          :to="paper.to"
        >
          {{ paper.label }}
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.sitemap-page {
  background: #ffffff;
  color: #1e293b;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  min-height: 100vh;
}

.content-wrapper {
  margin: 0 auto;
  max-width: 1120px;
  padding: 0 1.5rem;
  width: 100%;
}

.hero {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 4rem 0 3rem;
}

.eyebrow {
  color: #4f46e5;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 1rem;
  text-transform: uppercase;
}

h1 {
  color: #0f172a;
  font-family: Outfit, "Plus Jakarta Sans", sans-serif;
  font-size: 2.7rem;
  line-height: 1.12;
  margin: 0 0 1rem;
}

.hero p:last-child {
  color: #475569;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
  max-width: 760px;
}

.directory-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding-bottom: 2rem;
  padding-top: 2rem;
}

.directory-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
}

.directory-section h2,
.latest-header h2 {
  color: #0f172a;
  font-size: 1.05rem;
  line-height: 1.35;
  margin: 0 0 1rem;
}

.directory-links,
.latest-links {
  display: grid;
  gap: 0.65rem;
}

.directory-links a {
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  line-height: 1.4;
  padding-bottom: 0.65rem;
  text-decoration: none;
}

.directory-links a:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.directory-links a:hover,
.latest-links a:hover,
.latest-header a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.directory-links span {
  font-size: 0.92rem;
  font-weight: 700;
}

.directory-links small {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 0.78rem;
  line-height: 1.4;
}

.latest-section {
  padding-bottom: 4rem;
}

.latest-header {
  align-items: center;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 2rem;
}

.latest-header a,
.latest-links a {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.4;
  text-decoration: none;
}

.latest-links {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

@media (max-width: 800px) {
  h1 {
    font-size: 2.1rem;
  }

  .directory-grid,
  .latest-links {
    grid-template-columns: 1fr;
  }

  .latest-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
