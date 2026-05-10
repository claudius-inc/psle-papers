<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackEvent, trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "Past Year Exam Papers Singapore | Primary PDF Download";
const visibleTitle = "Past Year Exam Papers Singapore";
const pageDescription =
  "Download Singapore primary past year exam papers for P2-P6 Maths, Science, English and Chinese. No sign-up needed. Open recent school papers, then save PDFs.";
const pageUrl = "https://sgexamhub.com/past-year-exam-papers";

const pastYearPapers = allParsedPapers
  .filter((paper) => ["2025", "2024", "2023"].includes(paper.yearCode))
  .slice(0, 12);
const featuredPaper = pastYearPapers[0];

const pastYearCollections = [
  {
    title: "2025 past year exam papers",
    description: "Newest available Singapore primary school papers.",
    to: "/exam-papers/2025",
  },
  {
    title: "2024 past year exam papers",
    description: "Recent PDFs for follow-up timed revision.",
    to: "/exam-papers/2024",
  },
  {
    title: "Primary 6 past year papers",
    description: "P6 papers for PSLE-style practice and corrections.",
    to: "/exam-papers/primary-6",
  },
  {
    title: "Primary 6 Maths SA2 papers",
    description: "Final assessment Maths papers for exam timing.",
    to: "/exam-papers/primary-6-mathematics-sa2",
  },
  {
    title: "Primary 6 Science SA2 papers",
    description: "Science papers for concepts, keywords and explanations.",
    to: "/exam-papers/primary-6-science-sa2",
  },
  {
    title: "Top school past year papers",
    description: "Browse Nanyang, Raffles Girls, Henry Park and more.",
    to: "/top-school-exam-papers",
  },
];

const faqItems = [
  {
    question: "Are these past year exam papers free?",
    answer:
      "Yes. SG Exam Hub links free Singapore primary school past year exam paper PDFs that can be viewed online or downloaded for personal revision practice.",
  },
  {
    question: "Which past year paper should students start with?",
    answer:
      "Start with a recent paper for the student's level and subject, complete it under timed conditions, then open a related older paper to check improvement.",
  },
  {
    question: "Can I download past year papers as PDFs?",
    answer:
      "Yes. Open any past year paper first to check the school, subject and assessment type, then use Download PDF for offline practice and marking.",
  },
];

const analyticsContext = {
  page_path: "/past-year-exam-papers",
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

const trackPastYearCollectionClick = (collection: (typeof pastYearCollections)[number]) => {
  trackEvent("past_year_collection_click", {
    ...analyticsContext,
    source: "past_year_collection_grid",
    collection_title: collection.title,
    target_path: collection.to,
  });
};

const trackPastYearPaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackPastYearPaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  pastYearPapers.slice(0, 10).map((paper, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `https://sgexamhub.com/view/${paper.filename}`,
    item: {
      "@type": "LearningResource",
      name: `${paper.yearCode} ${paper.levelName} ${paper.schoolName} ${paper.subjectName} ${paper.typeName}`,
      learningResourceType: "Past year exam paper",
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
        "past year exam papers Singapore, Singapore primary past year papers, primary school past year exam papers, P2 P3 P4 P5 P6 past year papers, past year paper PDF download",
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
          name: "Recent Singapore primary past year exam papers",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <main class="past-year-page">
    <section class="hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
        <p class="eyebrow">Past year PDF papers</p>
        <h1>{{ visibleTitle }}</h1>
        <p class="subtitle">
          Find Singapore primary school past year exam papers for P2 to P6
          revision. No sign-up needed: open a recent school paper online,
          compare the subject and assessment type, then download useful PDF
          practice sets.
        </p>
        <p class="freshness">
          {{ allParsedPapers.length.toLocaleString() }} past year PDF papers indexed
        </p>
        <div v-if="featuredPaper" class="hero-card" data-nosnippet>
          <div>
            <span>Start with a recent past year paper</span>
            <strong>
              {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
              {{ featuredPaper.subjectName }} {{ featuredPaper.typeName }}
            </strong>
            <small>{{ featuredPaper.schoolName }}</small>
          </div>
          <div class="hero-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackPastYearPaperView(featuredPaper.filename, 'past_year_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackPastYearPaperDownload(featuredPaper.filename, 'past_year_hero')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-wrapper collection-section" aria-labelledby="collections-heading">
      <div class="section-header">
        <span>Choose a past year path</span>
        <h2 id="collections-heading">Past year exam paper collections</h2>
        <p>
          Move from a broad past year search into the year, level, subject,
          assessment or school collection that matches the next practice session.
        </p>
      </div>
      <div class="collection-grid">
        <NuxtLink
          v-for="collection in pastYearCollections"
          :key="collection.to"
          :to="collection.to"
          @click="trackPastYearCollectionClick(collection)"
        >
          <strong>{{ collection.title }}</strong>
          <small>{{ collection.description }}</small>
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper paper-section" aria-labelledby="latest-heading" data-nosnippet>
      <div class="section-header">
        <span>Open or download</span>
        <h2 id="latest-heading">Recent past year exam papers</h2>
        <p>
          Open one recent paper first for review, then download related PDFs for
          timed practice, marking and corrections.
        </p>
      </div>
      <div class="paper-grid">
        <article v-for="paper in pastYearPapers" :key="paper.filename">
          <p>{{ paper.subjectName }} past year paper</p>
          <h3>{{ paper.yearCode }} {{ paper.levelName }} {{ paper.typeName }}</h3>
          <span>{{ paper.schoolName }}</span>
          <div class="paper-actions">
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackPastYearPaperView(paper.filename, 'past_year_latest')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackPastYearPaperDownload(paper.filename, 'past_year_latest')"
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
        <h2 id="faq-heading">Past year exam paper questions</h2>
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

.past-year-page {
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
  background: #eff5fb;
  border-bottom: 1px solid #d9e6f2;
  padding: 4rem 0 3.2rem;
}

.back-link,
.eyebrow,
.section-header span {
  color: #25638f;
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
  color: #17486b;
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
  color: #102033;
  font-size: 4.35rem;
  line-height: 0.98;
  max-width: 860px;
}

.subtitle {
  color: #394f63;
  font-size: 1.08rem;
  line-height: 1.7;
  margin-top: 1.2rem;
  max-width: 780px;
}

.freshness {
  color: #25638f;
  font-weight: 800;
  margin-top: 1.1rem;
}

.hero-card {
  align-items: center;
  background: #ffffff;
  border: 1px solid #c9d9e7;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) auto;
  margin-top: 2rem;
  max-width: 780px;
  padding: 1rem;
}

.hero-card span,
.paper-grid p {
  color: #25638f;
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
  color: #5a6d7d;
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
  background: #25638f;
  color: #ffffff;
}

.hero-actions a:last-child,
.paper-actions a:last-child {
  background: #ffffff;
  border: 1px solid #b9cbdc;
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
  color: #102033;
  font-size: 2.3rem;
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
  border: 1px solid #dce6ef;
  border-radius: 8px;
  color: inherit;
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  text-decoration: none;
}

.collection-grid a:hover,
.paper-grid article:hover {
  border-color: #25638f;
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
    font-size: 2.45rem;
  }

  .section-header h2 {
    font-size: 1.8rem;
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
