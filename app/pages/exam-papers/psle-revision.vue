<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "PSLE Revision Papers | Primary 6 Exam Papers";
const visibleTitle = "PSLE Revision Papers";
const pageDescription =
  "Use free Primary 6 exam papers for PSLE revision. Open recent P6 SA2, Maths, Science, English and Chinese papers online, then download useful PDFs for timed practice.";
const pageUrl = "https://sgexamhub.com/exam-papers/psle-revision";

const latestPslePapers = allParsedPapers
  .filter((paper) => paper.levelCode === "6" && ["2025", "2024"].includes(paper.yearCode))
  .slice(0, 12);

const p6Sa2Papers = allParsedPapers
  .filter((paper) => paper.levelCode === "6" && paper.typeCode === "4")
  .slice(0, 8);

const featuredPaper = p6Sa2Papers[0] || latestPslePapers[0];

const psleCollections = [
  {
    title: "2025 Primary 6 SA2 exam papers",
    description: "Recent P6 final assessment papers for PSLE-style timing.",
    to: "/exam-papers/2025-primary-6-sa2",
  },
  {
    title: "Primary 6 Maths SA2 papers",
    description: "Maths papers for multi-step questions and speed practice.",
    to: "/exam-papers/primary-6-mathematics-sa2",
  },
  {
    title: "Primary 6 Science SA2 papers",
    description: "Science papers for concepts, keywords and explanation practice.",
    to: "/exam-papers/primary-6-science-sa2",
  },
  {
    title: "Primary 6 English SA2 papers",
    description: "English papers for comprehension, grammar and exam stamina.",
    to: "/exam-papers/primary-6-english-sa2",
  },
  {
    title: "2025 Primary 6 Maths papers",
    description: "Latest P6 Maths PDFs from Singapore primary schools.",
    to: "/exam-papers/2025-primary-6-mathematics",
  },
  {
    title: "2025 Primary 6 Science papers",
    description: "Latest P6 Science PDFs for topic-by-topic revision.",
    to: "/exam-papers/2025-primary-6-science",
  },
];

const schoolCollections = [
  {
    title: "Nanyang Primary P6 Maths papers",
    to: "/exam-papers/primary-6-mathematics-school-nanyang-primary-school",
  },
  {
    title: "Nanyang Primary P6 Science papers",
    to: "/exam-papers/primary-6-science-school-nanyang-primary-school",
  },
  {
    title: "Raffles Girls' Primary 2025 SA2 papers",
    to: "/exam-papers/2025-sa2-school-raffles-girls-primary-school",
  },
  {
    title: "Henry Park Primary P6 Maths papers",
    to: "/exam-papers/primary-6-mathematics-school-henry-park-primary-school",
  },
];

const faqItems = [
  {
    question: "Are these papers useful for PSLE revision?",
    answer:
      "Yes. Primary 6 school exam papers, especially SA2 papers, help students practise timing, question styles, corrections and weak-topic revision before PSLE preparation.",
  },
  {
    question: "Which PSLE revision papers should students start with?",
    answer:
      "Start with a recent Primary 6 SA2 paper, then move to Maths, Science, English or Chinese papers based on the student's weakest subject.",
  },
  {
    question: "Can I download the PSLE revision papers as PDFs?",
    answer:
      "Yes. Open a paper to check the school, subject and exam type, then use the Download PDF action for timed practice and marking.",
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
  page_path: "/exam-papers/psle-revision",
  page_title: visibleTitle,
};

const trackPslePaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackPslePaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  latestPslePapers.slice(0, 10).map((paper, index) => ({
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
        "PSLE revision papers, Primary 6 exam papers, P6 SA2 papers, PSLE practice papers, free P6 exam paper PDF download, Singapore primary school exam papers",
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
          name: "Primary 6 papers for PSLE revision",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <div class="psle-page">
    <header class="hero">
      <div class="content-wrapper hero-grid">
        <div>
          <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span aria-hidden="true">/</span>
            <NuxtLink to="/exam-papers">Exam Papers</NuxtLink>
            <span aria-hidden="true">/</span>
            <span>PSLE Revision</span>
          </nav>
          <p class="eyebrow">Primary 6 revision path</p>
          <h1>{{ visibleTitle }}</h1>
          <p class="subtitle">
            Build a PSLE practice routine with free Primary 6 school exam papers.
            Open a recent SA2 paper first, then download useful Maths, Science,
            English or Chinese PDFs for timed revision.
          </p>
          <div class="hero-actions">
            <NuxtLink to="/exam-papers/2025-primary-6-sa2">
              Start with P6 SA2
            </NuxtLink>
            <NuxtLink to="/exam-papers/primary-6-mathematics-sa2">
              Practise P6 Maths
            </NuxtLink>
          </div>
        </div>
        <aside v-if="featuredPaper" class="feature-card" aria-label="Featured PSLE paper">
          <span>Start here</span>
          <strong>
            {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
            {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
          </strong>
          <small>{{ featuredPaper.schoolName }}</small>
          <div class="card-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackPslePaperView(featuredPaper.filename, 'psle_revision_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackPslePaperDownload(featuredPaper.filename, 'psle_revision_hero')"
            >
              Download PDF
            </a>
          </div>
        </aside>
      </div>
    </header>

    <main class="content-wrapper main-content">
      <section class="section" aria-labelledby="psle-path-heading">
        <div class="section-header">
          <span>High-intent PSLE paths</span>
          <h2 id="psle-path-heading">Choose a Primary 6 practice set</h2>
          <p>
            Move from this PSLE revision page into focused collections, then open
            individual papers and download PDFs that match the next practice session.
          </p>
        </div>
        <div class="collection-grid">
          <NuxtLink
            v-for="collection in psleCollections"
            :key="collection.to"
            class="collection-card"
            :to="collection.to"
          >
            <strong>{{ collection.title }}</strong>
            <span>{{ collection.description }}</span>
          </NuxtLink>
        </div>
      </section>

      <section class="practice-panel" aria-labelledby="practice-sequence-heading">
        <div>
          <span>Revision sequence</span>
          <h2 id="practice-sequence-heading">How to use P6 papers before PSLE</h2>
        </div>
        <ol>
          <li>Open one recent SA2 paper and complete it under timed conditions.</li>
          <li>Mark mistakes by topic, skill and question type before moving on.</li>
          <li>Download another subject or school paper to check whether the same mistakes repeat.</li>
        </ol>
      </section>

      <section class="section" aria-labelledby="latest-psle-heading">
        <div class="section-header">
          <span>Open or download</span>
          <h2 id="latest-psle-heading">Recent Primary 6 papers for PSLE revision</h2>
          <p>
            Use these recent papers as entry points, then continue into related
            school and subject collections.
          </p>
        </div>
        <div class="paper-grid">
          <article v-for="paper in latestPslePapers" :key="paper.filename" class="paper-card">
            <div class="paper-meta">
              <span>{{ paper.yearCode }}</span>
              <span>{{ paper.subjectName }}</span>
              <span>{{ paper.typeName }}</span>
            </div>
            <h3>{{ paper.schoolName }} {{ paper.levelName }} paper</h3>
            <div class="card-actions">
              <NuxtLink
                :to="`/view/${paper.filename}`"
                @click="trackPslePaperView(paper.filename, 'psle_revision_latest')"
              >
                View Paper
              </NuxtLink>
              <a
                :href="buildPdfFileUrl(paper.filename)"
                :download="buildPaperDownloadName(paper)"
                @click="trackPslePaperDownload(paper.filename, 'psle_revision_latest')"
              >
                Download PDF
              </a>
            </div>
          </article>
        </div>
      </section>

      <section class="section" aria-labelledby="school-path-heading">
        <div class="section-header">
          <span>Top school practice</span>
          <h2 id="school-path-heading">Compare PSLE-style papers by school</h2>
          <p>
            School-specific collections help students compare question style and
            difficulty before choosing which PDFs to download next.
          </p>
        </div>
        <div class="school-links">
          <NuxtLink
            v-for="collection in schoolCollections"
            :key="collection.to"
            :to="collection.to"
          >
            {{ collection.title }}
          </NuxtLink>
        </div>
      </section>

      <section class="section" aria-labelledby="p6-sa2-heading">
        <div class="section-header">
          <span>SA2 focus</span>
          <h2 id="p6-sa2-heading">Primary 6 SA2 papers for PSLE timing</h2>
        </div>
        <div class="compact-list">
          <article v-for="paper in p6Sa2Papers" :key="paper.filename" class="compact-paper">
            <div>
              <strong>
                {{ paper.yearCode }} {{ paper.schoolName }} {{ paper.subjectName }}
              </strong>
              <span>{{ paper.levelName }} {{ paper.typeName }}</span>
            </div>
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackPslePaperView(paper.filename, 'psle_revision_sa2')"
            >
              View Paper
            </NuxtLink>
          </article>
        </div>
      </section>

      <section class="section faq-section" aria-labelledby="psle-faq-heading">
        <div class="section-header">
          <span>Before downloading</span>
          <h2 id="psle-faq-heading">PSLE revision paper questions</h2>
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

.psle-page {
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

.hero {
  background: linear-gradient(180deg, #f6fbf8 0%, #ffffff 100%);
  border-bottom: 1px solid #dbe7df;
  padding: 2rem 0 2.6rem;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 2rem;
  align-items: end;
}

.back-link,
.breadcrumb a {
  color: #166534;
  font-weight: 800;
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
.practice-panel span,
.feature-card span {
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 900;
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
  max-width: 740px;
  margin-top: 0.75rem;
  font-size: clamp(2.4rem, 6vw, 4.8rem);
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
.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-actions {
  margin-top: 1.5rem;
}

.hero-actions a,
.card-actions a,
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
.card-actions a:first-child,
.compact-paper a {
  background: #14532d;
  color: #ffffff;
}

.hero-actions a:last-child,
.card-actions a:last-child {
  border: 1px solid #cbd5e1;
  color: #1e293b;
  background: #ffffff;
}

.feature-card {
  display: grid;
  gap: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.2rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
}

.feature-card strong {
  font-size: 1.35rem;
  line-height: 1.25;
}

.feature-card small {
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
.practice-panel h2 {
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
.practice-panel,
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

.collection-card:hover,
.school-links a:hover {
  border-color: #166534;
  box-shadow: 0 12px 28px rgba(20, 83, 45, 0.1);
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

.practice-panel {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
}

.practice-panel ol {
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
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 800;
}

.school-links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.school-links a {
  border: 1px solid #dbe3ee;
  border-radius: 8px;
  color: #172033;
  font-weight: 800;
  line-height: 1.4;
  padding: 1rem;
  text-decoration: none;
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

@media (max-width: 900px) {
  .hero-grid,
  .practice-panel {
    grid-template-columns: 1fr;
  }

  .collection-grid,
  .paper-grid,
  .faq-grid,
  .school-links {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .hero {
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
