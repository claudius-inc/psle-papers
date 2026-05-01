<script setup lang="ts">
const route = useRoute();
const slugParam = route.params.slug;
const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
const seoRoute = getSeoRouteBySlug(slug);

if (!seoRoute) {
  throw createError({ statusCode: 404, statusMessage: "Exam paper index not found" });
}

const papers = computed(() => getPapersForRoute(seoRoute));
const visiblePapers = computed(() => papers.value.slice(0, 60));
const relatedRoutes = computed(() =>
  seoRoutes
    .filter((item) => item.path !== seoRoute.path)
    .filter((item) => {
      if (!seoRoute.year && !seoRoute.levelCode && !seoRoute.subjectCode) {
        return !item.year && (!item.levelCode || !item.subjectCode);
      }
      if (seoRoute.year && item.year === seoRoute.year) return true;
      if (seoRoute.levelCode && item.levelCode === seoRoute.levelCode) return true;
      if (seoRoute.subjectCode && item.subjectCode === seoRoute.subjectCode) {
        return true;
      }
      return false;
    })
    .slice(0, 24),
);

const pageUrl = `https://sgexamhub.com${seoRoute.path}`;

useHead({
  title: seoRoute.title,
  meta: [
    { name: "description", content: seoRoute.description },
    { property: "og:title", content: seoRoute.title },
    { property: "og:description", content: seoRoute.description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: pageUrl },
  ],
  link: [{ rel: "canonical", href: pageUrl }],
});
</script>

<template>
  <div class="index-page">
    <header class="index-hero">
      <div class="content-wrapper">
        <NuxtLink class="home-link" to="/">SG Exam Hub</NuxtLink>
        <h1>{{ seoRoute.title.replace(" | SG Exam Hub", "") }}</h1>
        <p>{{ seoRoute.description }}</p>
      </div>
    </header>

    <main class="content-wrapper index-content">
      <section class="paper-section" aria-labelledby="paper-list">
        <div class="section-heading">
          <h2 id="paper-list">{{ papers.length }} papers available</h2>
          <p>Open a paper to view it online or download the PDF.</p>
        </div>

        <div class="paper-list">
          <article
            v-for="paper in visiblePapers"
            :key="paper.filename"
            class="paper-row"
          >
            <div>
              <h3>
                {{ paper.yearCode }} {{ paper.levelName }} {{ paper.schoolName }}
              </h3>
              <p>{{ paper.subjectName }} {{ paper.typeName }}</p>
            </div>
            <NuxtLink :to="`/view/${paper.filename}`">View Paper</NuxtLink>
          </article>
        </div>
      </section>

      <section class="related-section" aria-labelledby="related-indexes">
        <h2 id="related-indexes">Browse related indexes</h2>
        <div class="related-links">
          <NuxtLink
            v-for="item in relatedRoutes"
            :key="item.path"
            :to="item.path"
          >
            {{ item.title.replace(" | SG Exam Hub", "") }}
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e293b;
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

.content-wrapper {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.index-hero {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 3rem 0;
}

.home-link {
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}

.index-hero h1 {
  color: #0f172a;
  font-size: 2.5rem;
  line-height: 1.15;
  margin: 1rem 0;
}

.index-hero p,
.section-heading p {
  color: #475569;
  line-height: 1.6;
  max-width: 680px;
}

.index-content {
  display: grid;
  gap: 3rem;
  padding-top: 2.5rem;
  padding-bottom: 4rem;
}

.section-heading {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
}

.section-heading h2,
.related-section h2 {
  color: #0f172a;
  font-size: 1.25rem;
  margin: 0;
}

.section-heading p {
  margin: 0;
}

.paper-list {
  display: grid;
  gap: 0.75rem;
}

.paper-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.paper-row h3 {
  color: #1e293b;
  font-size: 1rem;
  margin: 0 0 0.25rem;
}

.paper-row p {
  color: #64748b;
  margin: 0;
}

.paper-row a {
  flex: 0 0 auto;
  background: #4f46e5;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.65rem 0.9rem;
  text-decoration: none;
}

.related-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.related-links a {
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
}

.related-links a:hover,
.home-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

@media (max-width: 640px) {
  .index-hero h1 {
    font-size: 2rem;
  }

  .paper-row {
    align-items: stretch;
    flex-direction: column;
  }

  .paper-row a {
    text-align: center;
  }
}
</style>
