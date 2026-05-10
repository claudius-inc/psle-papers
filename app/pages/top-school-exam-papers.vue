<script setup lang="ts">
import { computed } from "vue";
import type { ParsedPaper } from "~/composables/usePapers";
import { allParsedPapers } from "~/utils/paperSeo";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";
import { trackEvent, trackPaperDownload, trackPaperViewClick } from "~/utils/analytics";

const pageTitle = "Top School Exam Papers Singapore | Free PDF Download";
const visibleTitle = "Top School Exam Papers Singapore";
const pageDescription =
  "Download free Singapore top school exam papers from Raffles, Nanyang, MGS, SCGS, Henry Park, Ai Tong, Tao Nan and more. No sign-up needed. View papers, then save PDFs.";
const pageUrl = "https://sgexamhub.com/top-school-exam-papers";

const topSchoolCollections = [
  {
    title: "Raffles Girls' Primary School exam papers",
    schoolName: "Raffles Girls' Primary School",
    description: "Recent RGPS papers for P2-P6 revision.",
    to: "/exam-papers/school-raffles-girls-primary-school",
  },
  {
    title: "Nanyang Primary School exam papers",
    schoolName: "Nanyang Primary School",
    description: "Nanyang papers across Maths, Science, English and Chinese.",
    to: "/exam-papers/school-nanyang-primary-school",
  },
  {
    title: "Henry Park Primary School exam papers",
    schoolName: "Henry Park Primary School",
    description: "Henry Park papers for timed practice and corrections.",
    to: "/exam-papers/school-henry-park-primary-school",
  },
  {
    title: "Methodist Girls' School (Primary) exam papers",
    schoolName: "Methodist Girls' School (Primary)",
    description: "MGS Primary papers for school-specific practice.",
    to: "/exam-papers/school-methodist-girls-school-primary",
  },
  {
    title: "Singapore Chinese Girls' Primary School exam papers",
    schoolName: "Singapore Chinese Girls' Primary School",
    description: "SCGS papers for comparing school assessment style.",
    to: "/exam-papers/school-singapore-chinese-girls-primary-school",
  },
  {
    title: "CHIJ St. Nicholas Girls' School exam papers",
    schoolName: "CHIJ St. Nicholas Girls' School",
    description: "St. Nicholas papers for upper-primary revision.",
    to: "/exam-papers/school-chij-st-nicholas-girls-school",
  },
  {
    title: "Anglo-Chinese School (Primary) exam papers",
    schoolName: "Anglo-Chinese School (Primary)",
    description: "ACS Primary papers grouped by year and subject.",
    to: "/exam-papers/school-anglo-chinese-school-primary",
  },
  {
    title: "Anglo-Chinese School (Junior) exam papers",
    schoolName: "Anglo-Chinese School (Junior)",
    description: "ACS Junior papers for additional school comparison.",
    to: "/exam-papers/school-anglo-chinese-school-junior",
  },
  {
    title: "Pei Hwa Presbyterian Primary School exam papers",
    schoolName: "Pei Hwa Presbyterian Primary School",
    description: "Pei Hwa papers across core and Higher Chinese subjects.",
    to: "/exam-papers/school-pei-hwa-presbyterian-primary-school",
  },
  {
    title: "Red Swastika School exam papers",
    schoolName: "Red Swastika School",
    description: "Red Swastika papers for school-specific revision.",
    to: "/exam-papers/school-red-swastika-school",
  },
  {
    title: "Tao Nan School exam papers",
    schoolName: "Tao Nan School",
    description: "Tao Nan papers for additional school comparison.",
    to: "/exam-papers/school-tao-nan-school",
  },
  {
    title: "Ai Tong School exam papers",
    schoolName: "Ai Tong School",
    description: "Ai Tong papers grouped by year, level and subject.",
    to: "/exam-papers/school-ai-tong-school",
  },
  {
    title: "Nan Hua Primary School exam papers",
    schoolName: "Nan Hua Primary School",
    description: "Nan Hua papers for school-specific revision.",
    to: "/exam-papers/school-nan-hua-primary-school",
  },
  {
    title: "Rosyth School exam papers",
    schoolName: "Rosyth School",
    description: "Rosyth papers to compare assessment style and difficulty.",
    to: "/exam-papers/school-rosyth-school",
  },
  {
    title: "Catholic High School exam papers",
    schoolName: "Catholic High School",
    description: "Catholic High papers for upper-primary revision.",
    to: "/exam-papers/school-catholic-high-school",
  },
];

const topSchoolNames = new Set(
  topSchoolCollections.map((collection) => collection.schoolName),
);
const latestTopSchoolPapers = allParsedPapers
  .filter((paper) => topSchoolNames.has(paper.schoolName))
  .slice(0, 12);
const featuredPaper = latestTopSchoolPapers[0];

const faqItems = [
  {
    question: "Are these top school exam papers free to download?",
    answer:
      "Yes. SG Exam Hub links free Singapore primary school exam paper PDFs that can be viewed online or downloaded for personal revision practice.",
  },
  {
    question: "Which top school papers should students start with?",
    answer:
      "Start with a recent paper from the student's level and subject, then compare another school paper to find repeated question types and gaps.",
  },
  {
    question: "Can I compare papers from different Singapore primary schools?",
    answer:
      "Yes. Use the school collection links to open papers from Raffles, Nanyang, MGS, SCGS, Henry Park, Ai Tong, Tao Nan, Rosyth and other schools before downloading PDFs.",
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
  page_path: "/top-school-exam-papers",
  page_title: visibleTitle,
};

const trackTopSchoolCollectionClick = (collection: (typeof topSchoolCollections)[number]) => {
  trackEvent("top_school_collection_click", {
    ...analyticsContext,
    source: "top_school_collection_grid",
    school_name: collection.schoolName,
    target_path: collection.to,
  });
};

const trackTopSchoolPaperView = (filename: string, source: string) => {
  trackPaperViewClick(filename, source, analyticsContext);
};

const trackTopSchoolPaperDownload = (filename: string, source: string) => {
  trackPaperDownload(filename, source, analyticsContext);
};

const itemListElements = computed(() =>
  latestTopSchoolPapers.slice(0, 10).map((paper, index) => ({
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
      about: `${paper.schoolName} ${paper.subjectName}`,
      url: `https://sgexamhub.com/view/${paper.filename}`,
      encoding: {
        "@type": "MediaObject",
        contentUrl: buildPdfFileUrl(paper.filename),
        encodingFormat: "application/pdf",
        name: `${paper.yearCode} ${paper.schoolName} ${paper.subjectName} ${paper.typeName} PDF`,
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
        "top school exam papers Singapore, Raffles Girls Primary School exam papers, Nanyang Primary School exam papers, Methodist Girls School exam papers, Singapore Chinese Girls Primary School exam papers, CHIJ St Nicholas exam papers, Anglo-Chinese School exam papers, Anglo Chinese School exam papers, Pei Hwa exam papers, Red Swastika exam papers, Tao Nan exam papers, free PDF download",
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
          name: "Latest Singapore top school exam papers",
          numberOfItems: itemListElements.value.length,
          itemListElement: itemListElements.value,
        },
      ]),
    },
  ],
});
</script>

<template>
  <main class="top-school-page">
    <section class="hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">Back to SG Exam Hub</NuxtLink>
        <p class="eyebrow">Top school PDF papers</p>
        <h1>{{ visibleTitle }}</h1>
        <p class="subtitle">
          Compare free Singapore primary school exam papers from Raffles,
          Nanyang, MGS, SCGS, Henry Park, Ai Tong, Tao Nan, Rosyth and more.
          No sign-up needed: open one paper online first, then download useful
          PDFs for timed revision.
        </p>
        <p class="freshness">
          {{ latestTopSchoolPapers.length.toLocaleString() }} recent top school
          papers highlighted from {{ allParsedPapers.length.toLocaleString() }}
          total PDFs
        </p>
        <div v-if="featuredPaper" class="hero-card" data-nosnippet>
          <div>
            <span>Start with a recent top school paper</span>
            <strong>
              {{ featuredPaper.yearCode }} {{ featuredPaper.levelName }}
              {{ featuredPaper.schoolName }} {{ featuredPaper.subjectName }}
              {{ featuredPaper.typeName }}
            </strong>
          </div>
          <div class="hero-actions">
            <NuxtLink
              :to="`/view/${featuredPaper.filename}`"
              @click="trackTopSchoolPaperView(featuredPaper.filename, 'top_school_hero')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(featuredPaper.filename)"
              :download="buildPaperDownloadName(featuredPaper)"
              @click="trackTopSchoolPaperDownload(featuredPaper.filename, 'top_school_hero')"
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-wrapper collections" aria-labelledby="schools-heading">
      <div class="section-heading">
        <span>Choose a school collection</span>
        <h2 id="schools-heading">Browse exam papers by Singapore primary school</h2>
        <p>
          These school pages help parents and students move from broad top
          school searches into focused paper lists with view and download
          actions.
        </p>
      </div>
      <div class="collection-grid">
        <NuxtLink
          v-for="collection in topSchoolCollections"
          :key="collection.to"
          :to="collection.to"
          @click="trackTopSchoolCollectionClick(collection)"
        >
          <strong>{{ collection.title }}</strong>
          <small>{{ collection.description }}</small>
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper paper-section" aria-labelledby="latest-heading" data-nosnippet>
      <div class="section-heading">
        <span>Open or download</span>
        <h2 id="latest-heading">Latest top school exam papers</h2>
        <p>
          Open one school paper for review, then download the PDF that best
          matches the next practice session.
        </p>
      </div>
      <div class="paper-grid">
        <article
          v-for="paper in latestTopSchoolPapers"
          :key="paper.filename"
          class="paper-card"
        >
          <div class="paper-meta">
            <span>{{ paper.yearCode }}</span>
            <span>{{ paper.levelName }}</span>
            <span>{{ paper.typeName }}</span>
          </div>
          <h3>{{ paper.schoolName }}</h3>
          <p>{{ paper.subjectName }} exam paper</p>
          <div class="paper-actions">
            <NuxtLink
              :to="`/view/${paper.filename}`"
              @click="trackTopSchoolPaperView(paper.filename, 'top_school_latest')"
            >
              View Paper
            </NuxtLink>
            <a
              :href="buildPdfFileUrl(paper.filename)"
              :download="buildPaperDownloadName(paper)"
              @click="trackTopSchoolPaperDownload(paper.filename, 'top_school_latest')"
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
        <h2 id="faq-heading">Top school exam paper questions</h2>
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

.top-school-page {
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
  color: #0f766e;
  display: inline-flex;
  font-size: 0.875rem;
  font-weight: 800;
  margin-bottom: 1rem;
  text-decoration: none;
}

.back-link:hover {
  color: #115e59;
  text-decoration: underline;
}

.eyebrow,
.section-heading span {
  color: #0f766e;
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
  max-width: 800px;
}

.subtitle {
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.7;
  margin: 0;
  max-width: 780px;
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
  border: 1px solid #99f6e4;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 1.4rem;
  max-width: 900px;
  padding: 1rem;
}

.hero-card div:first-child {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.hero-card span {
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-card strong {
  color: #0f172a;
  line-height: 1.35;
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
  background: #0f766e;
  color: #ffffff;
}

.hero-actions a:first-child:hover,
.paper-actions a:first-child:hover {
  background: #115e59;
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

.collection-grid,
.paper-grid,
.faq-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.collection-grid a,
.paper-card,
.faq-grid article {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
}

.collection-grid a {
  display: grid;
  gap: 0.35rem;
  text-decoration: none;
}

.collection-grid a:hover {
  border-color: #5eead4;
  box-shadow: 0 14px 28px rgba(15, 118, 110, 0.1);
}

.collection-grid strong,
.paper-card h3,
.faq-grid h3 {
  color: #0f172a;
  line-height: 1.35;
}

.collection-grid small,
.paper-card p,
.faq-grid p {
  color: #64748b;
  line-height: 1.55;
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
  font-size: 1rem;
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
