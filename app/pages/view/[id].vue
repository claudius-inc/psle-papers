<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";
import dropdownOptions from "../../../public/json/dropdownOptions.json";
import { allParsedPapers } from "~/utils/paperSeo";
import {
  trackEvent,
  trackPaperDownload,
  trackPaperOpen,
  trackPaperViewClick,
} from "~/utils/analytics";
import { buildPdfFileUrl } from "~/utils/pdfUrls";
import { buildSocialMeta } from "~/utils/socialSeo";

const route = useRoute();
const filename = route.params.id as string;

const options = dropdownOptions as DropdownData;
const pdfLoading = ref(true);
const pdfObjectUrl = ref("");
const loading = computed(() => false);

const getName = (category: keyof DropdownData, code: string): string => {
  const found = options[category]?.find((opt) => opt.code === code);
  return found ? found.name : code;
};

const parseFilename = (value: string): ParsedPaper | null => {
  const parts = value.split("_");
  if (parts.length !== 5) return null;

  const [levelCode, schoolCode, subjectCode, typeCode, yearCode] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];

  return {
    filename: value,
    levelCode,
    schoolCode,
    subjectCode,
    typeCode,
    yearCode,
    levelName: getName("Level", levelCode),
    schoolName: getName("School", schoolCode),
    subjectName: getName("Subject", subjectCode),
    typeName: getName("Type", typeCode),
  };
};

const paper = computed(() => parseFilename(filename));
const readableLevel = computed(() =>
  paper.value?.levelName.replace(/^P([1-6])$/, "Primary $1") || "",
);
const readableSubject = computed(() =>
  paper.value?.subjectName === "Mathematics" ? "Maths" : paper.value?.subjectName || "",
);
const titleLevel = computed(() => paper.value?.levelName || "");
const titleSchool = computed(() => paper.value?.schoolName || "");

const pageTitle = computed(() => {
  if (!paper.value) return "Loading Paper...";
  return `${paper.value.yearCode} ${paper.value.schoolName} ${readableLevel.value} ${readableSubject.value} ${paper.value.typeName}`;
});
const seoPaperTitle = computed(() => {
  if (!paper.value) return "";
  return `${paper.value.yearCode} ${titleLevel.value} ${titleSchool.value} ${readableSubject.value} ${paper.value.typeName}`;
});
const seoTitle = computed(() =>
  paper.value
    ? `${seoPaperTitle.value} Free PDF Download | SG Exam Hub`.length <= 70
      ? `${seoPaperTitle.value} Free PDF Download | SG Exam Hub`
      : `${seoPaperTitle.value} Free PDF Download`.length <= 70
        ? `${seoPaperTitle.value} Free PDF Download`
        : `${seoPaperTitle.value} PDF | SG Exam Hub`.length <= 70
          ? `${seoPaperTitle.value} PDF | SG Exam Hub`
          : `${seoPaperTitle.value} PDF`
    : "Free exam paper PDF download | SG Exam Hub",
);
const seoDescription = computed(() => {
  if (!paper.value) {
    return "View online or download free Singapore primary school exam paper PDFs for revision practice.";
  }

  const paperLabel = `${paper.value.yearCode} ${titleSchool.value} ${titleLevel.value} ${readableSubject.value} ${paper.value.typeName}`;
  const revisionGoal =
    paper.value.levelCode === "6" ? "PSLE revision practice" : "Singapore primary revision";
  const descriptions = [
    `Free ${paperLabel} exam paper PDF. No sign-up needed. View online, then download for ${revisionGoal}.`,
    `Download this free ${paperLabel} exam paper PDF. No sign-up needed. View online for ${revisionGoal}.`,
    `Free PDF download for this ${paper.value.yearCode} ${titleLevel.value} ${readableSubject.value} ${paper.value.typeName} exam paper. No sign-up needed. View online, then download it.`,
  ];

  return descriptions.find((description) => description.length <= 160) || descriptions[2];
});
const viewerFaqItems = computed(() => {
  if (!paper.value) return [];

  return [
    {
      question: `Is the ${pageTitle.value} PDF free to download?`,
      answer:
        "Yes. You can view this exam paper online or download the PDF for personal revision practice.",
    },
    {
      question: `How should students use this ${paper.value.typeName} paper?`,
      answer: `Attempt it under timed conditions, mark mistakes, revise weak topics, then try related ${readableLevel.value} ${readableSubject.value} papers.`,
    },
  ];
});
const subjectPracticeFocus = computed(() => {
  if (readableSubject.value === "Maths") {
    return "Mark careless errors, multi-step questions and slow problem types before trying another Maths paper.";
  }
  if (readableSubject.value === "Science") {
    return "Review keywords, explanation gaps and repeated topics before moving to another Science paper.";
  }
  if (readableSubject.value === "English") {
    return "Check grammar accuracy, comprehension evidence and time control before trying another English paper.";
  }
  if (readableSubject.value === "Chinese" || readableSubject.value === "Higher Chinese") {
    return "Revise vocabulary, comprehension answers and sentence structure before trying another Chinese paper.";
  }

  return "Mark mistakes, group weak topics, then try a related paper to check improvement.";
});
const revisionChecklistItems = computed(() => {
  if (!paper.value) return [];

  return [
    `Try this ${paper.value.typeName} paper under timed conditions before checking notes.`,
    subjectPracticeFocus.value,
    `Download the PDF or open the next ${readableLevel.value} ${readableSubject.value} paper to repeat the correction cycle.`,
  ];
});

const pdfUrl = computed(() => buildPdfFileUrl(filename));
const downloadName = computed(() => {
  if (!paper.value) return `${filename}.pdf`;

  return buildPaperDownloadName(paper.value);
});

const buildPaperDownloadName = (item: ParsedPaper) => {
  const baseName = [
    item.yearCode,
    item.levelName,
    item.subjectName,
    item.typeName,
    item.schoolName,
  ]
    .join("-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${baseName}.pdf`;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/^p([1-6])$/, "primary-$1")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const indexLinks = computed(() => {
  if (!paper.value) return [];

  const levelSlug = slugify(paper.value.levelName);
  const subjectSlug = slugify(paper.value.subjectName);
  const schoolSlug = slugify(paper.value.schoolName);
  const levelLabel = paper.value.levelName.replace(/^P/, "Primary ");

  return [
    {
      label: `${paper.value.yearCode} ${levelLabel} papers`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${readableSubject.value} papers`,
      to: `/exam-papers/${paper.value.yearCode}-${subjectSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${paper.value.schoolName} papers`,
      to: `/exam-papers/${paper.value.yearCode}-school-${schoolSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${paper.value.typeName} ${paper.value.schoolName} papers`,
      to: `/exam-papers/${paper.value.yearCode}-${slugify(
        paper.value.typeName,
      )}-school-${schoolSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${levelLabel} ${paper.value.schoolName}`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-school-${schoolSlug}`,
    },
    {
      label: `${levelLabel} ${readableSubject.value} ${paper.value.schoolName}`,
      to: `/exam-papers/${levelSlug}-${subjectSlug}-school-${schoolSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${levelLabel} ${readableSubject.value} ${paper.value.schoolName}`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-${subjectSlug}-school-${schoolSlug}`,
    },
    {
      label: `${levelLabel} ${readableSubject.value} papers`,
      to: `/exam-papers/${levelSlug}-${subjectSlug}`,
    },
    {
      label: `${paper.value.yearCode} ${levelLabel} ${readableSubject.value}`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-${subjectSlug}`,
    },
    {
      label: `${paper.value.typeName} ${paper.value.schoolName} papers`,
      to: `/exam-papers/${slugify(paper.value.typeName)}-school-${schoolSlug}`,
    },
    {
      label: `${paper.value.schoolName} papers`,
      to: `/exam-papers/school-${schoolSlug}`,
    },
    {
      label: "Exam paper sitemap",
      to: "/sitemap",
    },
  ];
});
const practiceSetLinks = computed(() => {
  if (!paper.value) return [];

  const levelSlug = slugify(paper.value.levelName);
  const subjectSlug = slugify(paper.value.subjectName);
  const schoolSlug = slugify(paper.value.schoolName);
  const levelLabel = paper.value.levelName.replace(/^P/, "Primary ");

  return [
    {
      label: `More ${levelLabel} ${readableSubject.value} papers`,
      detail: "Same level and subject",
      to: `/exam-papers/${levelSlug}-${subjectSlug}`,
      kind: "level_subject",
    },
    {
      label: `${paper.value.yearCode} ${levelLabel} ${readableSubject.value}`,
      detail: "Same year, level and subject",
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-${subjectSlug}`,
      kind: "year_level_subject",
    },
    {
      label: `${paper.value.schoolName} papers`,
      detail: "More from this school",
      to: `/exam-papers/school-${schoolSlug}`,
      kind: "school",
    },
    {
      label: `${paper.value.yearCode} ${paper.value.typeName} ${paper.value.schoolName}`,
      detail: "Same school and assessment",
      to: `/exam-papers/${paper.value.yearCode}-${slugify(
        paper.value.typeName,
      )}-school-${schoolSlug}`,
      kind: "year_school_assessment",
    },
  ];
});
const breadcrumbLinks = computed(() => {
  if (!paper.value) {
    return [
      { label: "Home", to: "/" },
      { label: "Exam Papers", to: "/exam-papers" },
    ];
  }

  const levelSlug = slugify(paper.value.levelName);
  const subjectSlug = slugify(paper.value.subjectName);

  return [
    { label: "Home", to: "/" },
    { label: "Exam Papers", to: "/exam-papers" },
    {
      label: `${paper.value.yearCode} ${readableLevel.value} ${readableSubject.value}`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-${subjectSlug}`,
    },
    { label: pageTitle.value, to: `/view/${filename}` },
  ];
});

const relatedPapers = computed(() => {
  if (!paper.value) return [];

  return allParsedPapers
    .filter((item) => item.filename !== filename)
    .filter(
      (item) =>
        item.levelCode === paper.value!.levelCode &&
        item.subjectCode === paper.value!.subjectCode,
    )
    .slice(0, 6);
});

const sameSchoolPapers = computed(() => {
  if (!paper.value) return [];

  return allParsedPapers
    .filter((item) => item.filename !== filename)
    .filter((item) => item.schoolCode === paper.value!.schoolCode)
    .filter((item) => item.levelCode === paper.value!.levelCode)
    .slice(0, 5);
});

const sameExamTypePapers = computed(() => {
  if (!paper.value) return [];

  return allParsedPapers
    .filter((item) => item.filename !== filename)
    .filter((item) => item.typeCode === paper.value!.typeCode)
    .filter((item) => item.levelCode === paper.value!.levelCode)
    .filter((item) => item.subjectCode === paper.value!.subjectCode)
    .slice(0, 5);
});

const nextPracticePaper = computed(() =>
  sameExamTypePapers.value[0] || relatedPapers.value[0] || sameSchoolPapers.value[0],
);
const practiceSequencePapers = computed(() => {
  if (!paper.value) return [];

  const seen = new Set<string>([filename]);

  return [
    ...sameExamTypePapers.value,
    ...relatedPapers.value,
    ...sameSchoolPapers.value,
  ]
    .filter((item) => {
      if (seen.has(item.filename)) return false;
      seen.add(item.filename);
      return true;
    })
    .slice(0, 3);
});

const viewerAnalyticsContext = computed(() => {
  if (!paper.value) return {};

  return {
    year: paper.value.yearCode,
    level: readableLevel.value || paper.value.levelName,
    subject: readableSubject.value || paper.value.subjectName,
    exam_type: paper.value.typeName,
    school: paper.value.schoolName,
    page_path: `/view/${filename}`,
  };
});
const relatedPaperAnalyticsContext = (item: ParsedPaper, section: string) => ({
  ...viewerAnalyticsContext.value,
  related_section: section,
  target_paper_id: item.filename,
  target_year: item.yearCode,
  target_level: item.levelName.replace(/^P([1-6])$/, "Primary $1"),
  target_subject: item.subjectName === "Mathematics" ? "Maths" : item.subjectName,
  target_exam_type: item.typeName,
  target_school: item.schoolName,
});
const trackViewerPaperDownload = (source: string) => {
  trackPaperDownload(filename, source, viewerAnalyticsContext.value);
};
const trackViewerPaperOpen = (source: string) => {
  trackPaperOpen(filename, source, viewerAnalyticsContext.value);
};
const trackViewerRelatedPaperView = (item: ParsedPaper, section: string) => {
  trackPaperViewClick(
    item.filename,
    `viewer_${section}`,
    relatedPaperAnalyticsContext(item, section),
  );
};
const trackViewerRelatedPaperDownload = (item: ParsedPaper, section: string) => {
  trackPaperDownload(
    item.filename,
    `viewer_${section}_download`,
    relatedPaperAnalyticsContext(item, section),
  );
};
const trackViewerCollectionClick = (link: { kind: string; to: string }) => {
  trackEvent("viewer_collection_click", {
    paper_id: filename,
    source: "viewer_continue_revision",
    collection_kind: link.kind,
    collection_path: link.to,
    ...viewerAnalyticsContext.value,
  });
};

onMounted(async () => {
  if (paper.value) trackViewerPaperOpen("viewer_page");

  try {
    const response = await fetch(pdfUrl.value);
    if (!response.ok) throw new Error(`PDF request failed: ${response.status}`);
    const blob = await response.blob();
    pdfObjectUrl.value = URL.createObjectURL(
      new Blob([blob], { type: "application/pdf" }),
    );
  } catch {
    pdfObjectUrl.value = "";
  } finally {
    pdfLoading.value = false;
  }
});

onUnmounted(() => {
  if (pdfObjectUrl.value) {
    URL.revokeObjectURL(pdfObjectUrl.value);
  }
});

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    {
      name: "robots",
      content: computed(() =>
        paper.value
          ? "index, follow, max-snippet:160, max-image-preview:large"
          : "noindex, follow",
      ),
    },
    ...buildSocialMeta({
      title: seoTitle,
      description: seoDescription,
      url: `https://sgexamhub.com/view/${filename}`,
      type: "article",
    }),
  ],
  link: [
    {
      rel: "canonical",
      href: `https://sgexamhub.com/view/${filename}`,
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbLinks.value.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.label,
              item: `https://sgexamhub.com${item.to}`,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: pageTitle.value,
            description: seoDescription.value,
            learningResourceType: "Exam paper",
            isAccessibleForFree: true,
            inLanguage: "en-SG",
            educationalLevel: paper.value?.levelName,
            about: paper.value?.subjectName,
            provider: {
              "@type": "Organization",
              name: "SG Exam Hub",
              url: "https://sgexamhub.com/",
            },
            url: `https://sgexamhub.com/view/${filename}`,
            encoding: {
              "@type": "MediaObject",
              contentUrl: buildPdfFileUrl(filename),
              encodingFormat: "application/pdf",
              name: `${pageTitle.value} PDF`,
            },
            potentialAction: [
              {
                "@type": "ViewAction",
                target: `https://sgexamhub.com/view/${filename}`,
              },
              {
                "@type": "DownloadAction",
                target: buildPdfFileUrl(filename),
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: viewerFaqItems.value.map((item) => ({
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
            "@type": "HowTo",
            name: `How to use ${pageTitle.value} for revision`,
            description: seoDescription.value,
            step: revisionChecklistItems.value.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: `Step ${index + 1}`,
              text: step,
            })),
          },
        ]),
      ),
    },
  ],
});
</script>

<template>
  <div class="viewer-container">
    <!-- Navigation Bar -->
    <nav class="viewer-nav">
      <div class="nav-inner">
        <div class="nav-left">
          <NuxtLink to="/" class="back-link">
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
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back Home</span>
          </NuxtLink>
        </div>

        <div class="nav-center">
          <div v-if="!loading && paper" class="paper-info">
            <span class="info-year">{{ paper.yearCode }}</span>
            <span class="info-school">{{ paper.schoolName }}</span>
            <div class="info-meta">
              <span>{{ paper.subjectName }}</span>
              <span class="separator">•</span>
              <span>{{ paper.typeName }}</span>
            </div>
          </div>
          <div v-else class="info-loading">Loading paper details...</div>
        </div>

        <div class="nav-right">
          <a
            class="download-action"
            :href="pdfUrl"
            :download="downloadName"
            @click="trackViewerPaperDownload('viewer_top')"
          >
            <span>Download</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    </nav>

    <div class="viewer-main">
      <!-- PDF Viewer Area -->
      <div class="pdf-viewer">
        <div v-if="pdfLoading" class="pdf-loading">
          <div class="spinner"></div>
          <p>Opening exam paper...</p>
        </div>
        <iframe
          v-else-if="pdfObjectUrl"
          :src="pdfObjectUrl"
          class="pdf-frame"
          title="Exam paper PDF viewer"
          frameborder="0"
        ></iframe>
        <div v-else class="pdf-loading">
          <p>Preview unavailable.</p>
          <a :href="pdfUrl" target="_blank" rel="noopener">Open PDF in a new tab</a>
        </div>
      </div>

      <aside v-if="paper" class="viewer-panel" aria-label="Paper actions and related papers">
        <nav class="panel-breadcrumb" aria-label="Breadcrumb">
          <template v-for="(item, index) in breadcrumbLinks" :key="item.to">
            <NuxtLink v-if="index < breadcrumbLinks.length - 1" :to="item.to">
              {{ item.label }}
            </NuxtLink>
            <span v-else>{{ item.label }}</span>
          </template>
        </nav>

        <section class="panel-card panel-primary">
          <p class="panel-eyebrow">Current paper</p>
          <h1>{{ pageTitle }}</h1>
          <p class="paper-trust-note">
            No sign-up needed. View online, then download the PDF for revision.
          </p>
          <dl class="paper-details">
            <div>
              <dt>Level</dt>
              <dd>{{ paper.levelName }}</dd>
            </div>
            <div>
              <dt>Subject</dt>
              <dd>{{ paper.subjectName }}</dd>
            </div>
            <div>
              <dt>Exam</dt>
              <dd>{{ paper.typeName }}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{{ paper.yearCode }}</dd>
            </div>
          </dl>
          <div class="panel-actions">
            <a
              class="primary-download"
              :href="pdfUrl"
              :download="downloadName"
              @click="trackViewerPaperDownload('viewer_panel')"
            >
              Download PDF
            </a>
            <a
              class="secondary-open"
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
              @click="trackViewerPaperOpen('viewer_open_new_tab')"
            >
              Open in new tab
            </a>
          </div>
          <NuxtLink
            v-if="nextPracticePaper"
            class="next-paper-cta"
            :to="`/view/${nextPracticePaper.filename}`"
            @click="trackViewerRelatedPaperView(nextPracticePaper, 'next_paper')"
          >
            <span>Next paper to try</span>
            <strong>
              {{ nextPracticePaper.yearCode }} {{ nextPracticePaper.schoolName }}
              {{ nextPracticePaper.typeName }}
            </strong>
          </NuxtLink>
        </section>

        <section class="panel-card revision-checklist" aria-labelledby="revision-checklist-heading">
          <h2 id="revision-checklist-heading">Revision checklist</h2>
          <ol>
            <li v-for="item in revisionChecklistItems" :key="item">{{ item }}</li>
          </ol>
        </section>

        <section
          v-if="practiceSequencePapers.length"
          class="panel-card practice-sequence"
          aria-labelledby="practice-sequence-heading"
        >
          <h2 id="practice-sequence-heading">Practice sequence</h2>
          <p>
            Open one related paper after marking this PDF, then download useful
            follow-up papers for the next timed attempt.
          </p>
          <div class="practice-sequence-list">
            <div
              v-for="(item, index) in practiceSequencePapers"
              :key="item.filename"
              class="practice-sequence-card"
            >
              <div>
                <span>Step {{ index + 1 }}</span>
                <strong>{{ item.yearCode }} {{ item.schoolName }} {{ item.levelName }} {{ item.subjectName }} {{ item.typeName }}</strong>
                <small>Open next related paper</small>
              </div>
              <div class="practice-sequence-actions">
                <NuxtLink
                  :to="`/view/${item.filename}`"
                  @click="trackViewerRelatedPaperView(item, 'practice_sequence')"
                >
                  View Paper
                </NuxtLink>
                <a
                  :href="buildPdfFileUrl(item.filename)"
                  :download="buildPaperDownloadName(item)"
                  @click="trackViewerRelatedPaperDownload(item, 'practice_sequence')"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="panel-card continue-revision" aria-labelledby="continue-revision-heading">
          <h2 id="continue-revision-heading">Continue revision</h2>
          <div class="practice-set-links">
            <NuxtLink
              v-for="link in practiceSetLinks"
              :key="link.to"
              :to="link.to"
              @click="trackViewerCollectionClick(link)"
            >
              <span>{{ link.label }}</span>
              <small>{{ link.detail }}</small>
            </NuxtLink>
          </div>
        </section>

        <section class="panel-card viewer-faq" aria-labelledby="viewer-faq-heading">
          <h2 id="viewer-faq-heading">Using this paper</h2>
          <article v-for="item in viewerFaqItems" :key="item.question">
            <h3>{{ item.question }}</h3>
            <p>{{ item.answer }}</p>
          </article>
        </section>

        <section class="panel-card">
          <h2>Browse this collection</h2>
          <div class="panel-links">
            <NuxtLink v-for="link in indexLinks" :key="link.to" :to="link.to">
              {{ link.label }}
            </NuxtLink>
          </div>
        </section>

        <section class="panel-card">
          <h2>Related papers</h2>
          <div class="related-paper-links">
            <div
              v-for="item in relatedPapers"
              :key="item.filename"
              class="related-paper-card"
            >
              <NuxtLink
                :to="`/view/${item.filename}`"
                @click="trackViewerRelatedPaperView(item, 'related')"
              >
                <span>{{ item.yearCode }} {{ item.schoolName }}</span>
                <small>{{ item.typeName }}</small>
              </NuxtLink>
              <a
                class="related-download"
                :href="buildPdfFileUrl(item.filename)"
                :download="buildPaperDownloadName(item)"
                @click="trackViewerRelatedPaperDownload(item, 'related')"
              >
                Download PDF
              </a>
            </div>
          </div>
        </section>

        <section v-if="sameSchoolPapers.length" class="panel-card">
          <h2>More from this school</h2>
          <div class="related-paper-links">
            <div
              v-for="item in sameSchoolPapers"
              :key="item.filename"
              class="related-paper-card"
            >
              <NuxtLink
                :to="`/view/${item.filename}`"
                @click="trackViewerRelatedPaperView(item, 'same_school')"
              >
                <span>{{ item.yearCode }} {{ item.subjectName }}</span>
                <small>{{ item.typeName }}</small>
              </NuxtLink>
              <a
                class="related-download"
                :href="buildPdfFileUrl(item.filename)"
                :download="buildPaperDownloadName(item)"
                @click="trackViewerRelatedPaperDownload(item, 'same_school')"
              >
                Download PDF
              </a>
            </div>
          </div>
        </section>

        <section v-if="sameExamTypePapers.length" class="panel-card">
          <h2>Same exam type</h2>
          <div class="related-paper-links">
            <div
              v-for="item in sameExamTypePapers"
              :key="item.filename"
              class="related-paper-card"
            >
              <NuxtLink
                :to="`/view/${item.filename}`"
                @click="trackViewerRelatedPaperView(item, 'same_exam_type')"
              >
                <span>{{ item.yearCode }} {{ item.schoolName }}</span>
                <small>{{ item.typeName }}</small>
              </NuxtLink>
              <a
                class="related-download"
                :href="buildPdfFileUrl(item.filename)"
                :download="buildPaperDownloadName(item)"
                @click="trackViewerRelatedPaperDownload(item, 'same_exam_type')"
              >
                Download PDF
              </a>
            </div>
          </div>
        </section>
      </aside>
    </div>

    <div v-if="paper" class="mobile-action-bar" aria-label="Paper quick actions">
      <a
        class="mobile-download"
        :href="pdfUrl"
        :download="downloadName"
        @click="trackViewerPaperDownload('viewer_mobile_sticky')"
      >
        Download PDF
      </a>
      <NuxtLink
        v-if="nextPracticePaper"
        class="mobile-next-paper"
        :to="`/view/${nextPracticePaper.filename}`"
        @click="trackViewerRelatedPaperView(nextPracticePaper, 'mobile_next_paper')"
      >
        Next Paper
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.viewer-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  overflow: hidden;
  font-family: "Plus Jakarta Sans", sans-serif;
}

.mobile-action-bar {
  display: none;
}

/* Main layout */
.viewer-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  flex: 1;
  min-height: 0;
}

/* Nav Bar */
.viewer-nav {
  height: 72px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #e2e8f0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 2rem;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.nav-left,
.nav-right {
  flex: 1;
}

.nav-left {
  display: flex;
  justify-content: flex-start;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}

/* Back Link */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: #64748b;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.back-link:hover {
  color: #1e293b;
  background-color: #f1f5f9;
  border-color: #e2e8f0;
}

/* Paper Info Styling */
.nav-center {
  flex: 0 1 auto;
  text-align: center;
}

.paper-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.info-year {
  background-color: #e0e7ff;
  color: #4338ca;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.1rem 0.6rem;
  border-radius: 999px;
  letter-spacing: 0.05em;
  margin-bottom: 0.1rem;
}

.info-school {
  font-family: "Outfit", sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
  white-space: nowrap;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.separator {
  color: #cbd5e1;
  font-weight: normal;
}

.info-loading {
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

/* Download Button */
.download-action {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px -2px rgba(79, 70, 229, 0.3);
  text-decoration: none;
}

.download-action:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.4);
}

.download-action:active {
  transform: translateY(0);
}

/* PDF Viewer */
.pdf-viewer {
  position: relative;
  background-color: #f1f5f9;
  min-width: 0;
  min-height: 0;
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #ffffff;
}

.pdf-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* Action panel */
.viewer-panel {
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  overflow-y: auto;
  padding: 1rem;
}

.panel-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #ffffff;
}

.panel-primary {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.panel-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin: 0 0 0.85rem;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.35;
}

.panel-breadcrumb a {
  color: #4f46e5;
  text-decoration: none;
}

.panel-breadcrumb a:hover {
  color: #4338ca;
  text-decoration: underline;
}

.panel-breadcrumb a::after {
  color: #cbd5e1;
  content: "/";
  margin-left: 0.3rem;
}

.panel-eyebrow {
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
}

.panel-card h1 {
  color: #0f172a;
  font-family: "Outfit", sans-serif;
  font-size: 1.15rem;
  line-height: 1.25;
  margin: 0 0 1rem;
}

.paper-trust-note {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.45;
  margin: -0.35rem 0 1rem;
}

.panel-card h2 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  margin: 0 0 0.75rem;
}

.viewer-faq {
  display: grid;
  gap: 0.85rem;
}

.revision-checklist ol {
  color: #334155;
  display: grid;
  gap: 0.55rem;
  font-size: 0.82rem;
  line-height: 1.5;
  margin: 0;
  padding-left: 1.15rem;
}

.revision-checklist li::marker {
  color: #4f46e5;
  font-weight: 800;
}

.practice-sequence {
  background: #f8fafc;
  border-color: #c7d2fe;
}

.practice-sequence p {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.55;
  margin: 0 0 0.75rem;
}

.practice-sequence-list {
  display: grid;
  gap: 0.7rem;
}

.practice-sequence-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: grid;
  gap: 0.65rem;
  padding: 0.75rem;
}

.practice-sequence-card > div:first-child {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.practice-sequence-card span {
  color: #4f46e5;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.05em;
  line-height: 1.2;
  text-transform: uppercase;
}

.practice-sequence-card strong {
  color: #0f172a;
  font-size: 0.9rem;
  line-height: 1.35;
}

.practice-sequence-card small {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 650;
  line-height: 1.35;
}

.practice-sequence-actions {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
}

.practice-sequence-actions a {
  align-items: center;
  border-radius: 7px;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  justify-content: center;
  line-height: 1.25;
  min-height: 36px;
  padding: 0.5rem 0.55rem;
  text-align: center;
  text-decoration: none;
}

.practice-sequence-actions a:first-child {
  background: #4f46e5;
  color: #ffffff;
}

.practice-sequence-actions a:first-child:hover {
  background: #4338ca;
}

.practice-sequence-actions a:last-child {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.practice-sequence-actions a:last-child:hover {
  background: #eef2ff;
  border-color: #a5b4fc;
  color: #1e293b;
}

.viewer-faq article {
  display: grid;
  gap: 0.25rem;
}

.viewer-faq h3 {
  color: #1e293b;
  font-size: 0.84rem;
  line-height: 1.35;
  margin: 0;
}

.viewer-faq p {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.55;
  margin: 0;
}

.paper-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0 0 1rem;
}

.paper-details div {
  min-width: 0;
}

.paper-details dt {
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.paper-details dd {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0.2rem 0 0;
}

.panel-actions {
  display: grid;
  gap: 0.6rem;
}

.next-paper-cta {
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  color: #1e293b;
  display: grid;
  gap: 0.25rem;
  line-height: 1.35;
  margin-top: 0.75rem;
  padding: 0.75rem 0.85rem;
  text-decoration: none;
}

.next-paper-cta:hover {
  border-color: #4f46e5;
  box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.4);
}

.next-paper-cta span {
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.next-paper-cta strong {
  color: #0f172a;
  font-size: 0.9rem;
}

.primary-download,
.secondary-open {
  align-items: center;
  border-radius: 8px;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 800;
  justify-content: center;
  min-height: 40px;
  padding: 0.65rem 0.85rem;
  text-decoration: none;
}

.primary-download {
  background: #4f46e5;
  color: #ffffff;
}

.primary-download:hover {
  background: #4338ca;
}

.secondary-open {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.secondary-open:hover {
  border-color: #94a3b8;
  color: #0f172a;
}

.continue-revision {
  background: #f9fafb;
  border-color: #d1d5db;
}

.practice-set-links {
  display: grid;
  gap: 0.6rem;
}

.practice-set-links a {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  color: #1e293b;
  display: grid;
  gap: 0.2rem;
  line-height: 1.35;
  padding: 0.7rem 0.75rem;
  text-decoration: none;
}

.practice-set-links a:hover {
  border-color: #4f46e5;
  box-shadow: 0 8px 18px -14px rgba(15, 23, 42, 0.4);
}

.practice-set-links span {
  font-size: 0.86rem;
  font-weight: 800;
}

.practice-set-links small {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 650;
}

.panel-links,
.related-paper-links {
  display: grid;
  gap: 0.55rem;
}

.panel-links a,
.related-paper-links a {
  border-radius: 7px;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.35;
  text-decoration: none;
}

.panel-links a:hover,
.related-paper-links a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.related-paper-card {
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  min-width: 0;
  padding: 0.65rem 0.75rem;
}

.related-paper-card:hover {
  border-color: #c7d2fe;
}

.related-paper-card a:first-child {
  display: grid;
  flex: 1 1 auto;
  gap: 0.2rem;
  min-width: 0;
}

.related-paper-card a:first-child:hover {
  text-decoration: none;
}

.related-paper-links small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
}

.related-download {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  box-sizing: border-box;
  flex: 0 0 auto;
  padding: 0.45rem 0.6rem;
  text-align: center;
}

.related-download:hover {
  background: #eef2ff;
  border-color: #a5b4fc;
  text-decoration: none;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsiveness */
@media (max-width: 900px) {
  .viewer-main {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .pdf-viewer {
    min-height: 62vh;
  }

  .viewer-panel {
    border-left: none;
    border-top: 1px solid #e2e8f0;
    overflow: visible;
  }

  .nav-left,
  .nav-right {
    flex: 1;
  }

  .back-link span {
    display: none;
  }

  .download-action span {
    display: none;
  }

  .download-action {
    padding: 0.7rem;
  }
}

@media (max-width: 640px) {
  .viewer-nav {
    height: 85px;
    padding: 0 1rem;
  }

  .viewer-container {
    padding-bottom: calc(74px + env(safe-area-inset-bottom, 0px));
  }

  .mobile-action-bar {
    align-items: center;
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid #dbe3ef;
    bottom: 0;
    box-shadow: 0 -14px 28px -24px rgba(15, 23, 42, 0.5);
    display: grid;
    gap: 0.65rem;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    left: 0;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
    position: fixed;
    right: 0;
    z-index: 120;
  }

  .mobile-action-bar a {
    align-items: center;
    border-radius: 8px;
    display: inline-flex;
    font-size: 0.9rem;
    font-weight: 800;
    justify-content: center;
    line-height: 1.2;
    min-height: 44px;
    padding: 0.65rem 0.7rem;
    text-align: center;
    text-decoration: none;
  }

  .mobile-download {
    background: #4f46e5;
    color: #ffffff;
  }

  .mobile-next-paper {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #1e293b;
  }

  .practice-sequence-actions {
    grid-template-columns: 1fr;
  }

  .related-paper-card {
    align-items: stretch;
    flex-direction: column;
  }

  .related-download {
    width: 100%;
  }

  .info-school {
    font-size: 0.95rem;
  }

  .info-meta {
    display: none;
  }
}
</style>
