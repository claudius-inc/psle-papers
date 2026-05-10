<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackEvent, trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "2026 Primary Exam Papers Revision | SG Exam Hub";
const visibleTitle = "2026 Primary Exam Papers Revision";
const pageDescription =
  "Prepare for 2026 with free Singapore primary school exam papers. No sign-up needed. Use latest 2025 and 2024 PDFs for P2-P6 Maths, Science, English and Chinese.";
const pageUrl = "https://sgexamhub.com/exam-papers/2026-revision";

const latestPapers = allParsedPapers
  .filter((paper) => ["2025", "2024"].includes(paper.yearCode))
  .slice(0, 12);

const primarySixSa2Papers = allParsedPapers
  .filter((paper) => paper.levelCode === "6" && paper.typeCode === "4")
  .slice(0, 6);

const featuredPaper = latestPapers[0];

const revisionCollections = [
  {
    title: "2025 Primary 6 SA2 exam papers",
    description: "Start with recent P6 SA2 papers for PSLE-style timed practice.",
    to: "/exam-papers/2025-primary-6-sa2",
  },
  {
    title: "2025 Primary 6 Maths exam papers",
    description: "Use the latest P6 Maths PDFs for problem-solving revision.",
    to: "/exam-papers/2025-primary-6-mathematics",
  },
  {
    title: "2025 Primary 6 Science exam papers",
    description: "Compare recent Science papers and practise answer keywords.",
    to: "/exam-papers/2025-primary-6-science",
  },
  {
    title: "2025 Primary 6 English exam papers",
    description: "Use recent English papers for comprehension, grammar and composition practice.",
    to: "/exam-papers/2025-primary-6-english",
  },
  {
    title: "2025 Primary 6 Chinese exam papers",
    description: "Use recent Chinese papers for language, comprehension and writing practice.",
    to: "/exam-papers/2025-primary-6-chinese",
  },
  {
    title: "2025 Primary 6 Maths SA2 papers",
    description: "Open final assessment Maths papers before downloading timed sets.",
    to: "/exam-papers/2025-primary-6-mathematics-sa2",
  },
  {
    title: "2025 Primary 6 English SA2 papers",
    description: "Practise final assessment English papers before the next timed session.",
    to: "/exam-papers/2025-primary-6-english-sa2",
  },
  {
    title: "2025 Primary 6 Chinese SA2 papers",
    description: "Practise final assessment Chinese papers for PSLE-style preparation.",
    to: "/exam-papers/2025-primary-6-chinese-sa2",
  },
  {
    title: "2024 Primary 6 exam papers",
    description: "Add 2024 papers after completing the latest available PDFs.",
    to: "/exam-papers/2024-primary-6",
  },
  {
    title: "Top school 2025 SA2 papers",
    description: "Browse school-specific SA2 papers from Nanyang, Raffles Girls and more.",
    to: "/exam-papers/2025-sa2-school-nanyang-primary-school",
  },
];

const faqItems = [
  {
    question: "Are there 2026 Singapore primary exam papers here?",
    answer:
      "SG Exam Hub uses the latest available past-year papers for 2026 revision. Students can start with 2025 and 2024 papers, then download related PDFs by level, subject, school and exam type.",
  },
  {
    question: "Which papers should students start with for 2026 revision?",
    answer:
      "Primary 6 students should begin with recent SA2 papers, then practise Maths, Science, English or Chinese papers from the same level before moving to older years.",
  },
  {
    question: "Can the papers be downloaded as PDFs?",
    answer:
      "Yes. Open any paper to check the details online, then use the Download PDF button for timed practice, marking and repeated revision.",
  },
];

const buildPaperDownloadName = (paper: ParsedPaper) =>
  `${[
    paper.yearCode,
    paper.levelName,
    paper.subjectName,
    paper.typeName,
    paper.schoolName,
  ]
    .join("-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}.pdf`;

const analyticsContext = {
  page_path: "/exam-papers/2026-revision",
  page_title: visibleTitle,
};

const trackRevisionPaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackRevisionPaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const trackRevisionCollectionClick = (collection: (typeof revisionCollections)[number]) => {
  trackEvent("revision_collection_click", {
    ...analyticsContext,
    source: "revision_collection_grid",
    collection_title: collection.title,
    target_path: collection.to,
  });
};

const itemListElements = computed(() =>
  latestPapers.slice(0, 10).map((paper, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://sgexamhub.com/view/${paper.filename}`,
    item: {
      "@type": "LearningResource",
      name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName}`,
      learningResourceType: "Exam paper",
      isAccessibleForFree: true,
      inLanguage: "en-SG",
      educationalLevel: paper.levelName,
      about: paper.subjectName,
      url: `https://sgexamhub.com/view/${paper.filename}`,
      encoding: {
        "@type": "MediaObject",
        contentUrl: buildPdfFileUrl(paper.filename),
        encodingFormat: "application/pdf",
        name: `${paper.yearCode} ${paper.levelName} ${paper.subjectName} ${paper.typeName} PDF`,
      },
      potentialAction: [
        {
          "@type": "ViewAction",
          target: `https://sgexamhub.com/view/${paper.filename}`,
        },
        {
          "@type": "DownloadAction",
          target: buildPdfFileUrl(paper.filename),
        },
      ],
    },
  })),
);

useHead({
  title: pageTitle,
  meta: [
    { name: "description", content: pageDescription },
    {
      name: "keywords",
      content:
        "2026 primary exam papers, Singapore primary exam papers 2026 revision, 2025 exam papers, P6 SA2 papers, PSLE revision papers, free exam paper PDF download",
    },
    ...buildSocialMeta({
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
    }),
  ],
  link: [{ rel: "canonical", href: pageUrl }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify([
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: visibleTitle,
          description: pageDescription,
          url: pageUrl,
          inLanguage: "en-SG",
          isPartOf: {
            "@type": "WebSite",
            name: "SG Exam Hub",
            url: "https://sgexamhub.com/",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://sgexamhub.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Exam Papers",
              item: "https://sgexamhub.com/exam-papers",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: visibleTitle,
              item: pageUrl,
            },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
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
          name: "Latest papers for 2026 primary revision",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <div class="revision-page">
    <header class="revision-hero">
      <div class="content-wrapper hero-layout">
        <div class="hero-copy">
          <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span aria-hidden="true">/</span>
            <NuxtLink to="/exam-papers">Exam Papers</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>2026 Revision</span>
          </nav>
          <p class="eyebrow">2026 revision path</p>
          <h1>{{ visibleTitle }}</h1>
          <p class="subtitle">
            Use the latest available 2025 and 2024 Singapore primary school exam
            papers to prepare for 2026. No sign-up needed: open a paper online
            first, then download useful PDFs for timed practice.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/exam-papers/2025-primary-6-sa2">
              Start with Primary 6 SA2
            </NuxtLink>
            <NuxtLink to="/exam-papers/2025">Browse 2025 papers</NuxtLink>
          </div>
        </div>
        <aside v-if="featuredPaper" class="featured-paper" aria-label="Featured latest paper" data-nosnippet>
          <span>Latest available paper</span>
          <strong>
            {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
            {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
          </strong>
          <small>{{ featuredPaper.schoolName }}</small>
          <div>
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackRevisionPaperView(featuredPaper.filename, '2026_revision_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackRevisionPaperDownload(featuredPaper.filename, '2026_revision_hero')"
            >
              Download PDF
            </a>
          </div>
        </aside>
      </div>
    </header>

    <main class="content-wrapper main-content">
      <section class="path-section" aria-labelledby="revision-path-heading">
        <div class="section-header">
          <span>Best next clicks</span>
          <h2 id="revision-path-heading">Choose a 2026 revision collection</h2>
          <p>
            These pages match common Google searches for 2026 primary revision
            and keep students moving from browsing to paper viewing and PDF download.
          </p>
        </div>
        <div class="collection-grid">
          <NuxtLink
            v-for="collection in revisionCollections"
            :key="collection.to"
            class="collection-card"
            :to="collection.to"
            @click="trackRevisionCollectionClick(collection)"
          >
            <strong>{{ collection.title }}</strong>
            <span>{{ collection.description }}</span>
          </NuxtLink>
        </div>
      </section>

      <section class="practice-plan" aria-labelledby="practice-plan-heading">
        <div>
          <span>Simple practice sequence</span>
          <h2 id="practice-plan-heading">How to use past-year papers for 2026</h2>
        </div>
        <ol>
          <li>Open one recent 2025 paper that matches the student's level and subject.</li>
          <li>Attempt it under timed conditions before checking weak topics.</li>
          <li>Download related 2024 or school-specific PDFs for follow-up practice.</li>
        </ol>
      </section>

      <section class="paper-section" aria-labelledby="latest-papers-heading" data-nosnippet>
        <div class="section-header">
          <span>Open or download</span>
          <h2 id="latest-papers-heading">Latest papers for 2026 revision</h2>
          <p>
            Start with recent papers, then continue into focused collections by
            level, subject, exam type or school.
          </p>
        </div>
        <div class="paper-grid">
          <article v-for="paper in latestPapers" :key="paper.filename" class="paper-card">
            <div class="paper-meta">
              <span>{{ paper.yearCode }}</span>
              <span>{{ paper.levelName }}</span>
              <span>{{ paper.typeName }}</span>
            </div>
            <h3>{{ paper.schoolName }} {{ paper.subjectName }}</h3>
            <div class="paper-actions">
              <NuxtLink
                :to="`/view/${paper.filename}`"
                @click="trackRevisionPaperView(paper.filename, '2026_revision_latest')"
              >
                View Paper
              </NuxtLink>
              <a
                :href="buildPdfFileUrl(paper.filename)"
                :download="buildPaperDownloadName(paper)"
                @click="trackRevisionPaperDownload(paper.filename, '2026_revision_latest')"
              >
                Download PDF
              </a>
            </div>
          </article>
        </div>
      </section>

      <section class="paper-section" aria-labelledby="p6-sa2-heading" data-nosnippet>
        <div class="section-header">
          <span>PSLE-style practice</span>
          <h2 id="p6-sa2-heading">Primary 6 SA2 papers for 2026 preparation</h2>
          <p>
            P6 SA2 papers are a strong starting point for timing, exam confidence
            and topic-by-topic correction before PSLE revision.
          </p>
        </div>
        <div class="compact-list">
          <article
            v-for="paper in primarySixSa2Papers"
            :key="paper.filename"
            class="compact-paper"
          >
            <div>
              <strong>
                {{ paper.yearCode }} {{ paper.schoolName }} {{ paper.subjectName }}
              </strong>
              <span>{{ paper.levelName }} {{ paper.typeName }}</span>
            </div>
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackRevisionPaperView(paper.filename, '2026_revision_p6_sa2')"
            >
              View Paper
            </NuxtLink>
          </article>
        </div>
      </section>

      <section class="faq-section" aria-labelledby="revision-faq-heading">
        <div class="section-header">
          <span>Before downloading</span>
          <h2 id="revision-faq-heading">2026 exam paper questions</h2>
        </div>
        <div class="faq-grid">
          <article v-for="item in faqItems" :key="item.question" class="faq-card">
            <h3>{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.revision-page {
  min-height: 100vh;
  background: #ffffff;
  color: #172033;
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
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.revision-hero {
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
  border-bottom: 1px solid #dbe7f3;
  padding: 2rem 0 2.5rem;
}

.hero-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 2rem;
  align-items: end;
}

.back-link,
.breadcrumb a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover,
.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 1rem 0 1.25rem;
  color: #64748b;
  font-size: 0.9rem;
}

.eyebrow,
.section-header span,
.practice-plan span,
.featured-paper span {
  display: inline-flex;
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 780px;
  margin-top: 0.75rem;
  font-size: clamp(2.35rem, 6vw, 4.75rem);
  line-height: 0.98;
  letter-spacing: 0;
}

.subtitle {
  max-width: 760px;
  margin-top: 1.1rem;
  color: #475569;
  font-size: 1.08rem;
  line-height: 1.75;
}

.hero-actions,
.paper-actions,
.featured-paper div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-actions {
  margin-top: 1.5rem;
}

.hero-actions a,
.featured-paper a,
.paper-actions a,
.compact-paper a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 800;
  text-decoration: none;
}

.hero-actions a:first-child,
.featured-paper a:first-child,
.paper-actions a:first-child,
.compact-paper a {
  background: #0f172a;
  color: #ffffff;
}

.hero-actions a:last-child,
.featured-paper a:last-child,
.paper-actions a:last-child {
  border: 1px solid #cbd5e1;
  color: #1e293b;
  background: #ffffff;
}

.featured-paper {
  display: grid;
  gap: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.2rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.featured-paper strong {
  font-size: 1.35rem;
  line-height: 1.25;
}

.featured-paper small {
  color: #64748b;
  font-weight: 700;
}

.main-content {
  display: grid;
  gap: 2.5rem;
  padding-top: 2.5rem;
  padding-bottom: 3rem;
}

.section-header {
  max-width: 760px;
  margin-bottom: 1rem;
}

.section-header h2,
.practice-plan h2 {
  margin-top: 0.45rem;
  font-size: clamp(1.55rem, 4vw, 2.25rem);
  letter-spacing: 0;
}

.section-header p {
  margin-top: 0.65rem;
  color: #526173;
  line-height: 1.7;
}

.collection-grid,
.paper-grid,
.faq-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.collection-card,
.paper-card,
.faq-card,
.practice-plan,
.compact-paper {
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  background: #ffffff;
}

.collection-card {
  display: grid;
  gap: 0.55rem;
  padding: 1rem;
  color: inherit;
  text-decoration: none;
}

.collection-card:hover {
  border-color: #2563eb;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.1);
}

.collection-card strong,
.paper-card h3,
.faq-card h3 {
  color: #111827;
  font-size: 1.05rem;
  line-height: 1.35;
}

.collection-card span,
.faq-card p,
.compact-paper span {
  color: #64748b;
  line-height: 1.55;
}

.practice-plan {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
}

.practice-plan ol {
  margin: 0;
  padding-left: 1.25rem;
  color: #334155;
  line-height: 1.8;
}

.paper-card {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.paper-meta span {
  border-radius: 999px;
  background: #e0f2fe;
  color: #075985;
  padding: 0.25rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 800;
}

.compact-list {
  display: grid;
  gap: 0.75rem;
}

.compact-paper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
}

.compact-paper div {
  display: grid;
  gap: 0.25rem;
}

.faq-card {
  padding: 1rem;
}

.faq-card p {
  margin-top: 0.55rem;
}

@media (max-width: 860px) {
  .hero-layout,
  .practice-plan {
    grid-template-columns: 1fr;
  }

  .collection-grid,
  .paper-grid,
  .faq-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .revision-hero {
    padding-top: 1.4rem;
  }

  h1 {
    font-size: 2.35rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .compact-paper {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
