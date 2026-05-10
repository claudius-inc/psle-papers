<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "Free Test Papers Singapore | Primary PDF Download";
const visibleTitle = "Singapore Primary Test Papers";
const pageDescription =
  "Download free Singapore primary test papers for P2-P6 Maths, Science, English and Chinese. View recent school papers online, then save useful PDFs.";
const pageUrl = "https://sgexamhub.com/test-papers";

const latestTestPapers = allParsedPapers.slice(0, 12);
const featuredPaper = latestTestPapers[0];

const testPaperCollections = [
  {
    title: "2025 primary test papers",
    description: "Newest available school papers for current revision.",
    to: "/exam-papers/2025",
  },
  {
    title: "Primary 6 test papers",
    description: "P6 papers for PSLE-style revision and timed practice.",
    to: "/exam-papers/primary-6",
  },
  {
    title: "Primary 6 Maths test papers",
    description: "Maths papers for problem sums and multi-step questions.",
    to: "/exam-papers/primary-6-mathematics",
  },
  {
    title: "Primary 6 Science test papers",
    description: "Science papers for concepts, keywords and explanations.",
    to: "/exam-papers/primary-6-science",
  },
  {
    title: "SA2 test papers",
    description: "Final assessment papers for timed exam practice.",
    to: "/exam-papers/sa2",
  },
  {
    title: "PSLE revision papers",
    description: "Primary 6 SA2 and subject papers for PSLE preparation.",
    to: "/exam-papers/psle-revision",
  },
];

const faqItems = [
  {
    question: "Are these Singapore primary test papers free?",
    answer:
      "Yes. SG Exam Hub lists free Singapore primary school test papers that can be viewed online or downloaded as PDF files for personal revision practice.",
  },
  {
    question: "Which primary test paper should students start with?",
    answer:
      "Start with the newest paper for the student's level and subject, complete it under timed conditions, then open a related paper to check improvement.",
  },
  {
    question: "Can I download the test papers as PDFs?",
    answer:
      "Yes. Open a test paper first to check the school, subject and assessment type, then use the Download PDF button for offline practice and marking.",
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
  page_path: "/test-papers",
  page_title: visibleTitle,
};

const trackTestPaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackTestPaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  latestTestPapers.slice(0, 10).map((paper, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://sgexamhub.com/view/${paper.filename}`,
    item: {
      "@type": "LearningResource",
      name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName}`,
      learningResourceType: "Test paper",
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
        "Singapore primary test papers, primary school test papers, free test papers Singapore, P2 P3 P4 P5 P6 test papers, Maths Science English Chinese test papers, PDF download",
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
          name: "Latest Singapore primary test papers",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <main class="test-papers-page">
    <section class="hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
        <p class="eyebrow">Free PDF test papers</p>
        <h1>{{ visibleTitle }}</h1>
        <p class="subtitle">
          Find free Singapore primary school test papers for P2 to P6 revision.
          Open a recent paper online, check the school and subject, then
          download useful PDFs for timed practice.
        </p>
        <p class="freshness">
          {{ allParsedPapers.length.toLocaleString() }} PDF test papers indexed
        </p>
        <div v-if="featuredPaper" class="hero-card">
          <div>
            <span>Start with a recent test paper</span>
            <strong>
              {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
              {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
            </strong>
            <small>{{ featuredPaper.schoolName }}</small>
          </div>
          <div class="hero-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackTestPaperView(featuredPaper.filename, 'test_papers_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackTestPaperDownload(featuredPaper.filename, 'test_papers_hero')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-wrapper collections" aria-labelledby="collections-heading">
      <div class="section-heading">
        <span>Choose a test paper path</span>
        <h2 id="collections-heading">Browse by level, subject and assessment</h2>
        <p>
          These high-intent collections help parents and students move from a
          broad test paper search to a focused set of PDFs.
        </p>
      </div>
      <div class="collection-grid">
        <NuxtLink
          v-for="collection in testPaperCollections"
          :key="collection.to"
          :to="collection.to"
        >
          <strong>{{ collection.title }}</strong>
          <small>{{ collection.description }}</small>
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper paper-section" aria-labelledby="latest-heading">
      <div class="section-heading">
        <span>Open or download</span>
        <h2 id="latest-heading">Latest primary test papers</h2>
        <p>
          Open one paper first for review, then download the PDF that fits the
          next timed practice session.
        </p>
      </div>
      <div class="paper-grid">
        <article v-for="paper in latestTestPapers" :key="paper.filename" class="paper-card">
          <div class="paper-meta">
            <span>{{ paper.yearCode }}</span>
            <span>{{ paper.levelName }}</span>
            <span>{{ paper.typeName }}</span>
          </div>
          <h3>{{ paper.schoolName }}</h3>
          <p>{{ paper.subjectName }} test paper</p>
          <div class="paper-actions">
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackTestPaperView(paper.filename, 'test_papers_latest')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackTestPaperDownload(paper.filename, 'test_papers_latest')"
            >
              Download PDF
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="content-wrapper faq-section" aria-labelledby="faq-heading">
      <div class="section-heading">
        <span>Before downloading</span>
        <h2 id="faq-heading">Primary test paper questions</h2>
      </div>
      <div class="faq-grid">
        <article v-for="item in faqItems" :key="item.question">
          <h3>{{ item.question }}</h3>
          <p>{{ item.answer }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.test-papers-page {
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
  max-width: 1100px;
  padding: 0 1.5rem;
  width: 100%;
}

.hero {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 2.5rem 0 3rem;
}

.back-link {
  color: #4f46e5;
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-decoration: none;
}

.back-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

.eyebrow,
.section-heading span {
  color: #4f46e5;
  display: block;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1.2;
  margin-bottom: 0.55rem;
  text-transform: uppercase;
}

.hero h1 {
  color: #0f172a;
  font-size: clamp(2.1rem, 6vw, 4.25rem);
  line-height: 1.05;
  margin: 0 0 1rem;
  max-width: 760px;
}

.subtitle {
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
  max-width: 760px;
}

.freshness {
  color: #334155;
  font-size: 0.92rem;
  font-weight: 800;
  margin: 0.9rem 0 0;
}

.hero-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 1.4rem;
  max-width: 880px;
  padding: 1rem;
}

.hero-card div:first-child {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.hero-card span {
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-card strong {
  color: #0f172a;
  line-height: 1.35;
}

.hero-card small {
  color: #475569;
  font-weight: 700;
  line-height: 1.4;
}

.hero-actions,
.paper-actions {
  display: flex;
  gap: 0.5rem;
}

.hero-actions a,
.paper-actions a {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font-weight: 900;
  justify-content: center;
  min-height: 40px;
  padding: 0.65rem 0.85rem;
  text-align: center;
  text-decoration: none;
}

.hero-actions a:first-child,
.paper-actions a:first-child {
  background: #4f46e5;
  color: #ffffff;
}

.hero-actions a:first-child:hover,
.paper-actions a:first-child:hover {
  background: #4338ca;
}

.hero-actions a:last-child,
.paper-actions a:last-child {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.hero-actions a:last-child:hover,
.paper-actions a:last-child:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.collections,
.paper-section,
.faq-section {
  padding: 2rem 1.5rem;
}

.section-heading {
  margin-bottom: 1.2rem;
  max-width: 760px;
}

.section-heading h2 {
  color: #0f172a;
  font-size: 1.45rem;
  line-height: 1.25;
  margin: 0 0 0.5rem;
}

.section-heading p {
  color: #475569;
  line-height: 1.65;
  margin: 0;
}

.collection-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.collection-grid a {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.35rem;
  padding: 1rem;
  text-decoration: none;
}

.collection-grid a:hover {
  border-color: #93c5fd;
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.1);
}

.collection-grid strong {
  color: #0f172a;
  line-height: 1.35;
}

.collection-grid small {
  color: #64748b;
  font-weight: 700;
  line-height: 1.45;
}

.paper-grid,
.faq-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.paper-card,
.faq-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.paper-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.paper-meta span {
  background: #f1f5f9;
  border-radius: 999px;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.55rem;
}

.paper-card h3,
.paper-card p,
.faq-grid h3,
.faq-grid p {
  margin: 0;
}

.paper-card h3,
.faq-grid h3 {
  color: #0f172a;
  font-size: 1rem;
  line-height: 1.4;
}

.paper-card p,
.faq-grid p {
  color: #475569;
  line-height: 1.6;
}

.paper-actions {
  margin-top: auto;
}

.paper-actions a {
  flex: 1 1 0;
  font-size: 0.85rem;
  line-height: 1.25;
}

@media (max-width: 700px) {
  .content-wrapper,
  .collections,
  .paper-section,
  .faq-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .hero-card {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions,
  .paper-actions {
    flex-direction: column;
  }
}
</style>
