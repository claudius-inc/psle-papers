<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackEvent, trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "Free Exam Papers Singapore | Primary PDF Download";
const visibleTitle = "Free Exam Papers Singapore";
const pageDescription =
  "Download free Singapore primary exam papers for P2-P6 Maths, Science, English and Chinese. No sign-up needed. View recent papers online, then save PDFs.";
const pageUrl = "https://sgexamhub.com/free-exam-papers";

const latestFreePapers = allParsedPapers.slice(0, 12);
const featuredPaper = latestFreePapers[0];

const freePaperCollections = [
  {
    title: "2025 primary exam papers",
    description: "Newest available school papers for current revision.",
    to: "/exam-papers/2025",
  },
  {
    title: "Primary 6 free exam papers",
    description: "P6 papers for PSLE preparation and timed practice.",
    to: "/exam-papers/primary-6",
  },
  {
    title: "Free Maths exam papers",
    description: "Maths papers for problem sums and multi-step practice.",
    to: "/exam-papers/mathematics",
  },
  {
    title: "Free Science exam papers",
    description: "Science papers for concepts, keywords and explanations.",
    to: "/exam-papers/science",
  },
  {
    title: "Top school exam papers",
    description: "Raffles, Nanyang, Henry Park, Ai Tong and more.",
    to: "/top-school-exam-papers",
  },
  {
    title: "PSLE revision papers",
    description: "Primary 6 SA2 and subject papers for PSLE preparation.",
    to: "/exam-papers/psle-revision",
  },
];

const faqItems = [
  {
    question: "Are these Singapore exam papers free to download?",
    answer:
      "Yes. SG Exam Hub links free Singapore primary school exam paper PDFs that can be viewed online or downloaded for personal revision practice.",
  },
  {
    question: "Which free exam paper should students start with?",
    answer:
      "Start with the newest paper for the student's primary level and subject, complete it under timed conditions, then open a related paper for follow-up practice.",
  },
  {
    question: "Can I download free Maths, Science, English and Chinese papers?",
    answer:
      "Yes. Use the collection links to browse free papers by subject, level, year, school and assessment type before downloading PDFs.",
  },
];

const analyticsContext = {
  page_path: "/free-exam-papers",
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

const trackFreeCollectionClick = (collection: (typeof freePaperCollections)[number]) => {
  trackEvent("free_exam_collection_click", {
    ...analyticsContext,
    source: "free_exam_collection_grid",
    collection_title: collection.title,
    target_path: collection.to,
  });
};

const trackFreePaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackFreePaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  latestFreePapers.slice(0, 10).map((paper, index) => ({
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
        "free exam papers Singapore, free primary exam papers, Singapore primary exam papers PDF, free Maths Science English Chinese papers, PSLE practice papers download",
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
          name: "Latest free Singapore primary exam papers",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <main class="free-page">
    <section class="hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
        <p class="eyebrow">Free PDF exam papers</p>
        <h1>{{ visibleTitle }}</h1>
        <p class="subtitle">
          Download free Singapore primary school exam papers for P2 to P6
          revision. No sign-up needed: open a recent paper online, check the
          subject and school, then save useful PDF practice sets.
        </p>
        <p class="freshness">
          {{ allParsedPapers.length.toLocaleString() }} free PDF exam papers indexed
        </p>
        <div v-if="featuredPaper" class="hero-card">
          <div>
            <span>Start with a free paper</span>
            <strong>
              {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
              {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
            </strong>
            <small>{{ featuredPaper.schoolName }}</small>
          </div>
          <div class="hero-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackFreePaperView(featuredPaper.filename, 'free_exam_papers_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackFreePaperDownload(featuredPaper.filename, 'free_exam_papers_hero')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-wrapper collection-section" aria-labelledby="collections-heading">
      <div class="section-header">
        <span>Choose a free paper path</span>
        <h2 id="collections-heading">Free exam paper collections</h2>
        <p>
          Use these entry points when searching for free Singapore exam papers by
          year, level, subject, top school or PSLE revision need.
        </p>
      </div>
      <div class="collection-grid">
        <NuxtLink
          v-for="collection in freePaperCollections"
          :key="collection.to"
          :to="collection.to"
          @click="trackFreeCollectionClick(collection)"
        >
          <strong>{{ collection.title }}</strong>
          <small>{{ collection.description }}</small>
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper paper-section" aria-labelledby="latest-heading">
      <div class="section-header">
        <span>Open or download</span>
        <h2 id="latest-heading">Latest free exam papers</h2>
        <p>
          Open one paper first for review, then download the PDF that matches
          the next timed practice session.
        </p>
      </div>
      <div class="paper-grid">
        <article v-for="paper in latestFreePapers" :key="paper.filename">
          <p>{{ paper.subjectName }} exam paper</p>
          <h3>{{ paper.yearCode }} {{ paper.levelName }} {{ paper.typeName }}</h3>
          <span>{{ paper.schoolName }}</span>
          <div class="paper-actions">
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackFreePaperView(paper.filename, 'free_exam_papers_latest')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackFreePaperDownload(paper.filename, 'free_exam_papers_latest')"
            >
              Download PDF
            </a>
          </div>
        </article>
      </div>
    </section>

    <section class="content-wrapper faq-section" aria-labelledby="faq-heading">
      <div class="section-header">
        <span>Before downloading</span>
        <h2 id="faq-heading">Free exam paper questions</h2>
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

.free-page {
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
  background: #eef6f1;
  border-bottom: 1px solid #d8e7dc;
  padding: 4rem 0 3.2rem;
}

.back-link,
.eyebrow,
.section-header span {
  color: #1f7a4c;
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
  color: #145a38;
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
  color: #102116;
  font-size: clamp(2.4rem, 6vw, 4.8rem);
  line-height: 0.98;
  max-width: 820px;
}

.subtitle {
  color: #375044;
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 1.2rem;
  max-width: 760px;
}

.freshness {
  color: #1f7a4c;
  font-weight: 800;
  margin-top: 1.1rem;
}

.hero-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #c8ddd0;
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
  color: #1f7a4c;
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
  color: #5b6f63;
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
  background: #1f7a4c;
  color: #ffffff;
}

.hero-actions a:last-child,
.paper-actions a:last-child {
  background: #ffffff;
  border: 1px solid #b8d1c1;
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
  color: #102116;
  font-size: clamp(1.65rem, 4vw, 2.45rem);
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
  border: 1px solid #dce8df;
  border-radius: 8px;
  color: inherit;
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  text-decoration: none;
}

.collection-grid a:hover,
.paper-grid article:hover {
  border-color: #1f7a4c;
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
