<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackEvent, trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "Download Exam Papers Singapore | Free Primary PDFs";
const visibleTitle = "Download Exam Papers Singapore";
const pageDescription =
  "Download free Singapore primary exam paper PDFs for P2-P6 Maths, Science, English and Chinese. No sign-up needed. Open papers online, then save PDFs.";
const pageUrl = "https://sgexamhub.com/download-exam-papers";

const latestDownloadPapers = allParsedPapers.slice(0, 12);
const featuredPaper = latestDownloadPapers[0];

const downloadCollections = [
  {
    title: "Download 2025 exam papers",
    description: "Newest available PDF papers for current revision.",
    to: "/exam-papers/2025",
  },
  {
    title: "Download Primary 6 papers",
    description: "P6 papers for PSLE preparation and timed practice.",
    to: "/exam-papers/primary-6",
  },
  {
    title: "Download Maths exam papers",
    description: "Maths PDFs for problem sums and multi-step practice.",
    to: "/exam-papers/mathematics",
  },
  {
    title: "Download Science exam papers",
    description: "Science PDFs for concepts, keywords and explanations.",
    to: "/exam-papers/science",
  },
  {
    title: "Download English exam papers",
    description: "English PDFs for comprehension, grammar and writing practice.",
    to: "/exam-papers/english",
  },
  {
    title: "Download Chinese exam papers",
    description: "Chinese PDFs for vocabulary, comprehension and sentence practice.",
    to: "/exam-papers/chinese",
  },
  {
    title: "Download SA2 exam papers",
    description: "Final assessment papers for timed revision.",
    to: "/exam-papers/sa2",
  },
  {
    title: "Download PSLE revision papers",
    description: "Primary 6 SA2 and subject papers for PSLE practice.",
    to: "/exam-papers/psle-revision",
  },
];

const faqItems = [
  {
    question: "Can I download Singapore primary exam papers as PDFs?",
    answer:
      "Yes. SG Exam Hub links free Singapore primary exam paper PDFs that can be viewed online first, then downloaded for personal revision practice.",
  },
  {
    question: "Do I need to sign up before downloading papers?",
    answer:
      "No. Open a paper from the list, check the school, level, subject and assessment type, then use the PDF download button.",
  },
  {
    question: "Which PDF paper should students download first?",
    answer:
      "Start with the newest paper for the student's level and subject, complete it under timed conditions, then download a related paper for follow-up practice.",
  },
];

const analyticsContext = {
  page_path: "/download-exam-papers",
  page_title: visibleTitle,
};

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

const trackDownloadCollectionClick = (collection: (typeof downloadCollections)[number]) => {
  trackEvent("download_exam_collection_click", {
    ...analyticsContext,
    source: "download_exam_collection_grid",
    collection_title: collection.title,
    target_path: collection.to,
  });
};

const trackDownloadPaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackDownloadPaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  latestDownloadPapers.slice(0, 10).map((paper, index) => ({
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
        "download exam papers Singapore, primary exam papers PDF download, download primary school exam papers, free exam paper PDF, Singapore primary exam papers download",
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
          name: "Latest downloadable Singapore primary exam papers",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <main class="download-page">
    <section class="hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
        <p class="eyebrow">Free PDF downloads</p>
        <h1>{{ visibleTitle }}</h1>
        <p class="subtitle">
          Download Singapore primary school exam papers for P2 to P6 revision.
          No sign-up needed: open a paper online first, confirm the subject and
          school, then save the PDF for timed practice.
        </p>
        <p class="freshness">
          {{ allParsedPapers.length.toLocaleString() }} PDF exam papers ready to view and download
        </p>
        <div v-if="featuredPaper" class="hero-card" data-nosnippet>
          <div>
            <span>Start with a PDF paper</span>
            <strong>
              {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
              {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
            </strong>
            <small>{{ featuredPaper.schoolName }}</small>
          </div>
          <div class="hero-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackDownloadPaperView(featuredPaper.filename, 'download_exam_papers_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackDownloadPaperDownload(featuredPaper.filename, 'download_exam_papers_hero')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-wrapper collection-section" aria-labelledby="download-paths-heading">
      <div class="section-header">
        <span>Choose a download path</span>
        <h2 id="download-paths-heading">Exam paper PDF download collections</h2>
        <p>
          Use these entry points when the goal is to quickly find a relevant
          Singapore primary exam paper, open it for review, and download the PDF.
        </p>
      </div>
      <div class="collection-grid">
        <NuxtLink
          v-for="collection in downloadCollections"
          :key="collection.to"
          :to="collection.to"
          @click="trackDownloadCollectionClick(collection)"
        >
          <strong>{{ collection.title }}</strong>
          <small>{{ collection.description }}</small>
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper paper-section" aria-labelledby="latest-heading" data-nosnippet>
      <div class="section-header">
        <span>Open or download</span>
        <h2 id="latest-heading">Latest downloadable exam papers</h2>
        <p>
          Open one paper first for review, then download the PDF that matches
          the next timed practice session.
        </p>
      </div>
      <div class="paper-grid">
        <article v-for="paper in latestDownloadPapers" :key="paper.filename">
          <p>{{ paper.subjectName }} exam paper</p>
          <h3>{{ paper.yearCode }} {{ paper.levelName }} {{ paper.typeName }}</h3>
          <span>{{ paper.schoolName }}</span>
          <div class="paper-actions">
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackDownloadPaperView(paper.filename, 'download_exam_papers_latest')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackDownloadPaperDownload(paper.filename, 'download_exam_papers_latest')"
            >
              Download PDF
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="content-wrapper faq-section" aria-labelledby="download-faq-heading">
      <div class="section-header">
        <span>Before downloading</span>
        <h2 id="download-faq-heading">Exam paper download questions</h2>
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

.download-page {
  background: #ffffff;
  color: #172033;
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
}

.hero {
  background: #eef3f8;
  border-bottom: 1px solid #d7e1eb;
  padding: 4rem 0 3.2rem;
}

.back-link,
.eyebrow,
.section-header span {
  color: #255f95;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.back-link {
  display: inline-flex;
  margin-bottom: 1.4rem;
  text-decoration: none;
}

.back-link:hover {
  color: #173f66;
}

.eyebrow,
.section-header span {
  display: block;
  margin: 0 0 0.65rem;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  color: #102032;
  font-size: 4.5rem;
  line-height: 0.98;
  max-width: 840px;
}

.subtitle {
  color: #3d5166;
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 1.2rem;
  max-width: 760px;
}

.freshness {
  color: #255f95;
  font-weight: 800;
  margin-top: 1.1rem;
}

.hero-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #c8d6e3;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-top: 2rem;
  max-width: 760px;
  padding: 1rem;
}

.hero-card span,
.paper-grid p {
  color: #255f95;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hero-card strong {
  color: #172033;
  display: block;
  font-size: 1.05rem;
  line-height: 1.35;
  margin-top: 0.25rem;
}

.hero-card small,
.paper-grid span,
.collection-grid small,
.faq-grid p,
.section-header p {
  color: #5c6d7c;
  line-height: 1.6;
}

.hero-actions,
.paper-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.hero-actions a,
.paper-actions a {
  align-items: center;
  border-radius: 7px;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 850;
  justify-content: center;
  min-height: 40px;
  padding: 0.65rem 0.9rem;
  text-decoration: none;
}

.hero-actions a:first-child,
.paper-actions a:first-child {
  background: #255f95;
  color: #ffffff;
}

.hero-actions a:last-child,
.paper-actions a:last-child {
  background: #ffffff;
  border: 1px solid #b9cad9;
  color: #172033;
}

.collection-section,
.paper-section,
.faq-section {
  padding: 3.4rem 1.5rem 0;
}

.section-header {
  display: grid;
  gap: 0.65rem;
  margin-bottom: 1.4rem;
  max-width: 760px;
}

.section-header h2 {
  color: #102032;
  font-size: 2.25rem;
  line-height: 1.08;
}

.collection-grid,
.faq-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.collection-grid a,
.faq-grid article,
.paper-grid article {
  border: 1px solid #dce5ee;
  border-radius: 8px;
  color: inherit;
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  text-decoration: none;
}

.collection-grid a:hover,
.paper-grid article:hover {
  border-color: #255f95;
}

.collection-grid strong,
.faq-grid h3,
.paper-grid h3 {
  color: #172033;
  font-size: 1rem;
  line-height: 1.35;
}

.paper-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.paper-grid article {
  align-content: start;
}

.paper-actions {
  margin-top: 0.45rem;
}

.paper-actions a {
  flex: 1 1 120px;
  min-height: 38px;
}

.faq-section {
  padding-bottom: 4rem;
}

@media (max-width: 860px) {
  h1 {
    font-size: 2.6rem;
  }

  .section-header h2 {
    font-size: 1.75rem;
  }

  .hero-card,
  .collection-grid,
  .paper-grid,
  .faq-grid {
    grid-template-columns: 1fr;
  }

  .hero-card {
    align-items: stretch;
  }
}
</style>
