<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import dropdownOptions from "../../../public/json/dropdownOptions.json";
import type { DropdownData } from "~/composables/usePapers";
import {
  seoRoutes,
  getSeoRouteBySlug,
  allParsedPapers,
  getPapersForRoute,
} from "~/utils/paperSeo";
import {
  trackEvent,
  trackPaperDownload,
  trackPaperViewClick,
} from "~/utils/analytics";

const route = useRoute();
const slugParam = route.params.slug;
const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
const seoRoute = getSeoRouteBySlug(slug);

if (!seoRoute) {
  throw createError({ statusCode: 404, statusMessage: "Exam paper index not found" });
}

const options = dropdownOptions as DropdownData;

// Locked filters come from the URL slug; they can't be edited inline.
const lockedLevel = seoRoute.levelCode || "";
const lockedSubject = seoRoute.subjectCode || "";
const lockedType = seoRoute.typeCode || "";
const lockedYear = seoRoute.year || "";
const lockedSchool = seoRoute.schoolCode || "";

const initialFilters = () => ({
  Level: lockedLevel || "0",
  Subject: lockedSubject || "0",
  Year: lockedYear || "0",
  Type: lockedType || "0",
  School: lockedSchool || "0",
});

const filters = ref(initialFilters());
const resetFilters = () => {
  filters.value = initialFilters();
  trackEvent("paper_filters_reset", {
    source: "index_filters",
    page_slug: slug,
  });
};

const filteredPapers = computed(() =>
  allParsedPapers.filter((paper) => {
    const f = filters.value;
    if (f.Level !== "0" && paper.levelCode !== f.Level) return false;
    if (f.School !== "0" && paper.schoolCode !== f.School) return false;
    if (f.Subject !== "0" && paper.subjectCode !== f.Subject) return false;
    if (f.Type !== "0" && paper.typeCode !== f.Type) return false;
    if (f.Year !== "0" && paper.yearCode !== f.Year) return false;
    return true;
  }),
);

const routePapers = computed(() => getPapersForRoute(seoRoute));
const resultCount = computed(() => filteredPapers.value.length);
const trackFilterChange = (
  filterName: keyof typeof filters.value,
  filterValue: string,
) => {
  trackEvent("paper_filter_change", {
    source: "index_filters",
    page_slug: slug,
    filter_name: filterName,
    filter_value: filterValue,
    result_count: resultCount.value,
  });
};

// View mode (grid vs list) — shared with homepage via localStorage.
const viewMode = ref<"grid" | "list">("grid");
onMounted(() => {
  const saved = localStorage.getItem("paperViewMode");
  if (saved === "grid" || saved === "list") viewMode.value = saved;
});
const setViewMode = (mode: "grid" | "list") => {
  viewMode.value = mode;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("paperViewMode", mode);
  }
  trackEvent("paper_view_mode_change", {
    source: "index_results",
    page_slug: slug,
    mode,
  });
};

const relatedRoutes = computed(() =>
  seoRoutes
    .filter((item) => item.path !== seoRoute!.path)
    .filter((item) => {
      if (
        !seoRoute!.year &&
        !seoRoute!.levelCode &&
        !seoRoute!.subjectCode &&
        !seoRoute!.typeCode
      ) {
        return !item.year && (!item.levelCode || !item.subjectCode || !item.typeCode);
      }
      if (seoRoute!.year && item.year === seoRoute!.year) return true;
      if (seoRoute!.levelCode && item.levelCode === seoRoute!.levelCode) return true;
      if (seoRoute!.subjectCode && item.subjectCode === seoRoute!.subjectCode) {
        return true;
      }
      if (seoRoute!.typeCode && item.typeCode === seoRoute!.typeCode) return true;
      if (seoRoute!.schoolCode && item.schoolCode === seoRoute!.schoolCode) {
        return true;
      }
      return false;
    })
    .slice(0, 24),
);

const pageUrl = `https://sgexamhub.com${seoRoute.path}`;
const pageTitle = seoRoute.title.replace(" | SG Exam Hub", "");
const breadcrumbItems = computed(() => [
  { name: "Home", item: "https://sgexamhub.com/" },
  { name: "Exam Papers", item: "https://sgexamhub.com/exam-papers" },
  { name: pageTitle, item: pageUrl },
]);
const readableLevel = computed(() =>
  seoRoute.levelCode
    ? (options.Level.find((item) => item.code === seoRoute.levelCode)?.name || "").replace(
        /^P([1-6])$/,
        "Primary $1",
      )
    : "",
);
const readableSubject = computed(() =>
  seoRoute.subjectCode
    ? options.Subject.find((item) => item.code === seoRoute.subjectCode)?.name || ""
    : "",
);
const readableType = computed(() =>
  seoRoute.typeCode
    ? (options.Type.find((item) => item.code === seoRoute.typeCode)?.name || "").replace(
        /^Practice Paper$/,
        "Practice Papers",
      )
    : "",
);
const readableSchool = computed(() =>
  seoRoute.schoolCode
    ? options.School.find((item) => item.code === seoRoute.schoolCode)?.name || ""
    : "",
);
const landingIntro = computed(() => {
  const focus = [
    seoRoute.year,
    readableLevel.value,
    readableSubject.value,
    readableType.value,
    readableSchool.value,
  ]
    .filter(Boolean)
    .join(" ");

  const focusPaperLabel = focus.endsWith("Papers") ? focus : `${focus} exam papers`;

  return focus
    ? `This collection gathers ${seoRoute.paperCount.toLocaleString()} ${focusPaperLabel} in one place so parents and students can quickly compare papers, open a PDF viewer, and download useful practice papers for revision.`
    : `This exam paper index gathers ${seoRoute.paperCount.toLocaleString()} Singapore primary school test papers in one place so parents and students can browse by level, subject, year, school and exam type.`;
});
const focusLabel = computed(() =>
  [
    seoRoute.year,
    readableLevel.value,
    readableSubject.value === "Mathematics" ? "Maths" : readableSubject.value,
    readableType.value,
    readableSchool.value,
  ]
    .filter(Boolean)
    .join(" "),
);
const keywordPhrases = computed(() => {
  const focus = focusLabel.value || "Singapore primary school";
  const focusExamPaperLabel = focus.endsWith("Papers") ? focus : `${focus} exam papers`;
  const focusTestPaperLabel = focus.endsWith("Papers") ? focus : `${focus} test papers`;
  const phrases = [
    `free ${focusExamPaperLabel}`,
    `${focusTestPaperLabel} PDF download`,
    `${focus} practice papers for revision`,
  ];

  if (readableSubject.value === "Mathematics") {
    phrases.push(`${focus.replace("Maths", "Mathematics")} exam papers`);
  }

  if (seoRoute.levelCode === "6") {
    phrases.push(`${focus} PSLE practice papers`);
  }

  return [...new Set(phrases)];
});
const subjectRevisionAdvice = computed(() => {
  const subject = readableSubject.value;

  if (subject === "Mathematics") {
    return "For Maths practice, use each paper to check problem-solving speed, careless mistakes, word problems and multi-step questions before moving to another school paper.";
  }
  if (subject === "Science") {
    return "For Science revision, compare your answers with the question requirements and note repeated topics, keywords and explanation gaps after every attempt.";
  }
  if (subject === "English") {
    return "For English practice, focus on comprehension evidence, grammar accuracy, vocabulary use and time control across different school papers.";
  }
  if (subject === "Chinese" || subject === "Higher Chinese") {
    return "For Chinese practice, use the papers to revise comprehension, vocabulary, sentence structure and exam timing across different question types.";
  }

  return "Use this page to choose a focused set of papers, attempt one under timed conditions, then download related papers for follow-up practice.";
});
const studySteps = computed(() => [
  `Start with recent ${
    focusLabel.value.endsWith("Papers")
      ? focusLabel.value
      : `${focusLabel.value || "Singapore primary school"} papers`
  }, then use older papers to revise weak topics after each attempt.`,
  subjectRevisionAdvice.value,
  `Download selected PDFs for timed practice, marking, corrections and repeated revision before school assessments.`,
]);
const examTypeHighlights = computed(() => {
  const counts = new Map<string, number>();
  routePapers.value.forEach((paper) => {
    counts.set(paper.typeName, (counts.get(paper.typeName) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6)
    .map(([name, count]) => ({
      name: name === "Practice Paper" ? "Practice Papers" : name,
      count,
    }));
});
const schoolDiscoveryLinks = computed(() => {
  if (seoRoute.schoolCode) return [];

  const counts = new Map<string, { code: string; name: string; count: number }>();
  routePapers.value.forEach((paper) => {
    const existing = counts.get(paper.schoolCode);
    if (existing) {
      existing.count += 1;
      return;
    }
    counts.set(paper.schoolCode, {
      code: paper.schoolCode,
      name: paper.schoolName,
      count: 1,
    });
  });

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((school) => {
      const matchingRoutes = seoRoutes.filter((item) => {
        if (item.schoolCode !== school.code) return false;
        return true;
      });
      const route =
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.levelCode === seoRoute.levelCode &&
            item.subjectCode === seoRoute.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.levelCode === seoRoute.levelCode &&
            !item.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            item.subjectCode === seoRoute.subjectCode &&
            !item.levelCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            item.year === seoRoute.year &&
            !item.levelCode &&
            !item.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            !item.year &&
            item.levelCode === seoRoute.levelCode &&
            item.subjectCode === seoRoute.subjectCode,
        ) ||
        matchingRoutes.find(
          (item) =>
            !item.year &&
            !item.levelCode &&
            !item.subjectCode,
        );

      return route
        ? {
            name: school.name,
            count: school.count,
            path: route.path,
          }
        : null;
    })
    .filter((item): item is { name: string; count: number; path: string } => item !== null);
});
const faqItems = computed(() => [
  {
    question: `What is included in ${pageTitle}?`,
    answer: `${pageTitle} includes free Singapore primary school test papers that can be viewed online or downloaded as PDF files for revision practice.`,
  },
  {
    question: "How should students use these exam papers?",
    answer:
      "Students should try each paper under timed conditions, mark mistakes carefully, revise weak topics, and then attempt another related paper to check improvement.",
  },
  {
    question: "Can I download the papers for offline practice?",
    answer:
      "Yes. Open any paper from the list, then use the Download PDF button on the viewer page to save the paper for offline practice.",
  },
]);
const itemListElements = computed(() =>
  filteredPapers.value.slice(0, 30).map((paper, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://sgexamhub.com/view/${paper.filename}`,
    item: {
      "@type": "LearningResource",
      name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName}`,
      learningResourceType: "Exam paper",
      educationalLevel: paper.levelName,
      about: paper.subjectName,
      url: `https://sgexamhub.com/view/${paper.filename}`,
      encoding: {
        "@type": "MediaObject",
        contentUrl: `https://sgexamhub.com/files/${paper.filename}.pdf`,
        encodingFormat: "application/pdf",
      },
    },
  })),
);

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
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: pageTitle,
          description: seoRoute.description,
          url: pageUrl,
          isPartOf: {
            "@type": "WebSite",
            name: "SG Exam Hub",
            url: "https://sgexamhub.com/",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems.value.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.item,
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.value.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${pageTitle} paper list`,
          numberOfItems: filteredPapers.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <div class="index-page">
    <header class="index-hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to SG Exam Hub
        </NuxtLink>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <NuxtLink to="/">Home</NuxtLink>
          <span aria-hidden="true">/</span>
          <NuxtLink to="/exam-papers">Exam Papers</NuxtLink>
          <span aria-hidden="true">/</span>
          <span>{{ pageTitle }}</span>
        </nav>
        <h1>{{ pageTitle }}</h1>
        <p>{{ seoRoute.description }}</p>
      </div>
    </header>

    <!-- Filter bar (locked fields hidden) -->
    <div class="filter-container">
      <div class="content-wrapper filter-grid">
        <div v-if="!lockedLevel" class="filter-group">
          <label>Level</label>
          <select
            v-model="filters.Level"
            @change="trackFilterChange('Level', filters.Level)"
          >
            <option v-for="opt in options.Level" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedSubject" class="filter-group">
          <label>Subject</label>
          <select
            v-model="filters.Subject"
            @change="trackFilterChange('Subject', filters.Subject)"
          >
            <option v-for="opt in options.Subject" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedYear" class="filter-group">
          <label>Year</label>
          <select
            v-model="filters.Year"
            @change="trackFilterChange('Year', filters.Year)"
          >
            <option v-for="opt in options.Year" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedType" class="filter-group">
          <label>Exam Type</label>
          <select
            v-model="filters.Type"
            @change="trackFilterChange('Type', filters.Type)"
          >
            <option v-for="opt in options.Type" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedSchool" class="filter-group school-select">
          <label>School</label>
          <select
            v-model="filters.School"
            @change="trackFilterChange('School', filters.School)"
          >
            <option v-for="opt in options.School" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </div>
    </div>

    <main class="content-wrapper main-content">
      <section class="landing-support" aria-labelledby="revision-guide">
        <div>
          <h2 id="revision-guide">Use these papers for focused revision</h2>
          <p>{{ landingIntro }}</p>
        </div>
        <ol>
          <li v-for="step in studySteps" :key="step">{{ step }}</li>
        </ol>
      </section>

      <section class="search-support" aria-labelledby="search-support-heading">
        <div>
          <h2 id="search-support-heading">Find the right paper faster</h2>
          <p>
            This page is organized around searches parents and students commonly make
            before downloading Singapore primary school exam papers.
          </p>
        </div>
        <div class="search-support-grid">
          <div class="support-panel">
            <h3>Matching searches</h3>
            <ul>
              <li v-for="phrase in keywordPhrases" :key="phrase">{{ phrase }}</li>
            </ul>
          </div>
          <div v-if="examTypeHighlights.length" class="support-panel">
            <h3>Available exam types</h3>
            <ul>
              <li v-for="examType in examTypeHighlights" :key="examType.name">
                {{ examType.name }}: {{ examType.count }} PDFs
              </li>
            </ul>
          </div>
          <div v-if="schoolDiscoveryLinks.length" class="support-panel">
            <h3>Schools in this collection</h3>
            <div class="school-link-list">
              <NuxtLink
                v-for="school in schoolDiscoveryLinks"
                :key="school.path"
                :to="school.path"
              >
                {{ school.name }} ({{ school.count }})
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <section class="collection-faq" aria-labelledby="collection-faq-heading">
        <div class="collection-faq-header">
          <h2 id="collection-faq-heading">Questions about this collection</h2>
          <p>
            Check what is included before opening a paper online or downloading
            a PDF for revision practice.
          </p>
        </div>
        <div class="collection-faq-grid">
          <article
            v-for="item in faqItems"
            :key="item.question"
            class="faq-card"
          >
            <h3>{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
          </article>
        </div>
      </section>

      <div class="results-header">
        <div class="results-meta">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h2>
            Showing <strong>{{ resultCount }}</strong> available papers
          </h2>
        </div>
        <div class="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'grid' }"
            :aria-pressed="viewMode === 'grid'"
            aria-label="Grid view"
            @click="setViewMode('grid')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ active: viewMode === 'list' }"
            :aria-pressed="viewMode === 'list'"
            aria-label="List view"
            @click="setViewMode('list')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="resultCount === 0" class="empty-state">
        <span class="emoji">🔍</span>
        <h3>No papers found</h3>
        <p>Try adjusting your filters to find what you're looking for.</p>
        <button class="primary-btn" @click="resetFilters">Clear Filters</button>
      </div>

      <div v-else :class="['papers-container', `papers-${viewMode}`]">
        <div
          v-for="paper in filteredPapers"
          :key="paper.filename"
          class="paper-card"
        >
          <div class="card-header">
            <span class="badge year-badge">{{ paper.yearCode }}</span>
            <span class="badge level-badge">{{ paper.levelName }}</span>
          </div>
          <h3 class="school-name">{{ paper.schoolName }}</h3>
          <div class="card-details">
            <div class="detail-row">
              <span class="label">Subject:</span>
              <span class="value">{{ paper.subjectName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Exam:</span>
              <span class="value">{{ paper.typeName }}</span>
            </div>
          </div>
          <div class="card-actions">
            <NuxtLink
              class="view-btn"
              :to="`/view/${paper.filename}`"
              @click="trackPaperViewClick(paper.filename, 'index_results')"
            >
              View Paper
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </NuxtLink>
            <a
              class="download-btn"
              :href="`/files/${paper.filename}.pdf`"
              :download="`${paper.yearCode}-${paper.levelName}-${paper.subjectName}-${paper.typeName}-${paper.schoolName}.pdf`"
              @click="trackPaperDownload(paper.filename, 'index_results')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>

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
    <footer class="index-footer">
      <div class="footer-inner">
        <NuxtLink to="/">SG Exam Hub</NuxtLink>
        <span class="footer-sep" aria-hidden="true">|</span>
        <NuxtLink to="/exam-papers">All exam papers</NuxtLink>
        <span class="footer-sep" aria-hidden="true">|</span>
        <NuxtLink to="/sitemap">Sitemap</NuxtLink>
      </div>
    </footer>
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
  padding: 2.5rem 0 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 1rem;
}

.back-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
  color: #64748b;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.breadcrumb a {
  color: #4f46e5;
  text-decoration: none;
}

.breadcrumb a:hover {
  color: #4338ca;
  text-decoration: underline;
}

.index-hero h1 {
  color: #0f172a;
  font-size: 2.25rem;
  line-height: 1.15;
  margin: 0.5rem 0 0.75rem;
}

.index-hero p {
  color: #475569;
  line-height: 1.6;
  max-width: 680px;
  margin: 0;
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.landing-support {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(260px, 0.9fr);
  gap: 1.5rem;
  align-items: start;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.25rem;
  margin-bottom: 2rem;
}

.landing-support h2 {
  color: #0f172a;
  font-size: 1.15rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.landing-support p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.landing-support ol {
  color: #334155;
  display: grid;
  gap: 0.65rem;
  line-height: 1.5;
  margin: 0;
  padding-left: 1.25rem;
}

.landing-support li::marker {
  color: #4f46e5;
  font-weight: 800;
}

.search-support {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.search-support h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.search-support p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0 0 1.25rem;
}

.search-support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.support-panel {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1rem;
}

.support-panel h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  margin: 0 0 0.75rem;
}

.support-panel ul {
  color: #334155;
  display: grid;
  gap: 0.5rem;
  line-height: 1.45;
  margin: 0;
  padding-left: 1.1rem;
}

.school-link-list {
  display: grid;
  gap: 0.55rem;
}

.school-link-list a {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.35;
  text-decoration: none;
}

.school-link-list a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.collection-faq {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.collection-faq-header {
  margin-bottom: 1rem;
}

.collection-faq h2 {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1.35;
  margin: 0 0 0.5rem;
}

.collection-faq-header p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0;
}

.collection-faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.faq-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1rem;
}

.faq-card h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0 0 0.55rem;
}

.faq-card p {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

/* Filter bar (mirrors homepage) */
.filter-container {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem 0;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.filter-group.school-select {
  flex: 1 1 220px;
}

.filter-group label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-group select {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-size: 0.9rem;
  font-family: inherit;
}

.filter-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.reset-btn {
  margin-left: auto;
  padding: 0.55rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.reset-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Results header */
.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.results-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #475569;
}

.search-icon {
  color: #2563eb;
}

.results-header h2 {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
}

.results-header h2 strong {
  color: #0f172a;
  font-weight: 700;
}

.view-toggle {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
  gap: 2px;
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 34px;
  border: none;
  background: transparent;
  color: #64748b;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.view-toggle-btn:hover {
  color: #1e293b;
}

.view-toggle-btn.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

/* Cards (mirrors homepage) */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.paper-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.paper-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  border-color: #2563eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.year-badge {
  background-color: #e0e7ff;
  color: #4338ca;
}

.level-badge {
  background-color: #f1f5f9;
  color: #475569;
}

.school-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem;
  line-height: 1.4;
  flex-grow: 1;
}

.card-details {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.detail-row .value {
  font-weight: 500;
  color: #334155;
}

.card-actions {
  display: grid;
  gap: 0.55rem;
}

.view-btn,
.download-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  text-decoration: none;
}

.view-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  cursor: pointer;
}

.view-btn:hover {
  background-color: #4338ca;
}

.download-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.download-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* List view overrides */
.papers-list .paper-card {
  flex-direction: row;
  align-items: center;
  padding: 1rem 1.25rem;
  gap: 1.5rem;
}

.papers-list .card-header {
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0;
  gap: 0.35rem;
  flex-shrink: 0;
  min-width: 70px;
}

.papers-list .school-name {
  flex: 1 1 auto;
  margin: 0;
  font-size: 1rem;
}

.papers-list .card-details {
  flex: 0 0 auto;
  margin-bottom: 0;
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
}

.papers-list .detail-row {
  flex-direction: column;
  margin: 0;
  min-width: 70px;
}

.papers-list .detail-row .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #94a3b8;
}

.papers-list .card-actions {
  flex: 0 0 150px;
}

.papers-list .view-btn,
.papers-list .download-btn {
  width: auto;
  padding: 0.6rem 1.25rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-state .emoji {
  font-size: 3rem;
}

.empty-state h3 {
  margin: 0.75rem 0 0.5rem;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.25rem;
}

.primary-btn {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* Related indexes */
.related-section {
  margin-top: 3rem;
}

.related-section h2 {
  color: #0f172a;
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.related-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.related-links a {
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.related-links a:hover {
  color: #2563eb;
  border-color: #c7d2fe;
}

.index-footer {
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  padding: 1.5rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  justify-content: center;
  margin: 0 auto;
  max-width: 1100px;
}

.footer-inner a {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
}

.footer-inner a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.footer-sep {
  color: #cbd5e1;
  user-select: none;
}

@media (max-width: 640px) {
  .index-hero h1 {
    font-size: 1.875rem;
  }
  .landing-support {
    grid-template-columns: 1fr;
  }
  .filter-grid {
    flex-direction: column;
    align-items: stretch;
  }
  .reset-btn {
    margin-left: 0;
  }
  .papers-list .paper-card {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .papers-list .card-header {
    flex-direction: row;
    justify-content: space-between;
    min-width: 0;
  }
  .papers-list .card-details {
    justify-content: space-between;
  }
  .papers-list .card-actions {
    flex: 0 0 auto;
  }
  .papers-list .view-btn,
  .papers-list .download-btn {
    width: 100%;
  }
}
</style>
