<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";
import dropdownOptions from "../../../public/json/dropdownOptions.json";
import { allParsedPapers } from "~/utils/paperSeo";
import {
  trackPaperDownload,
  trackPaperOpen,
  trackPaperViewClick,
} from "~/utils/analytics";

const route = useRoute();
const filename = route.params.id as string;

const options = dropdownOptions as DropdownData;
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
const titleSchool = computed(() =>
  paper.value?.schoolName
    .replace(/\s+\(primary\)$/i, "")
    .replace(/\s+\(junior\)$/i, " Junior") || "",
);

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
    ? `${seoPaperTitle.value} PDF | SG Exam Hub`.length > 70
      ? `${seoPaperTitle.value} PDF`
      : `${seoPaperTitle.value} PDF | SG Exam Hub`
    : "Exam paper PDF | SG Exam Hub",
);
const seoDescription = computed(() =>
  paper.value
    ? `${seoPaperTitle.value} exam paper PDF for Singapore primary revision. View online or download for SA1, SA2 and PSLE practice.`
    : "View or download free Singapore primary school exam paper PDFs for revision practice.",
);

const pdfUrl = computed(() => `/files/${filename}.pdf`);
const downloadName = computed(() => {
  if (!paper.value) return `${filename}.pdf`;

  const baseName = [
    paper.value.yearCode,
    paper.value.levelName,
    paper.value.subjectName,
    paper.value.typeName,
    paper.value.schoolName,
  ]
    .join("-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${baseName}.pdf`;
});

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
      label: `${paper.value.yearCode} ${levelLabel} ${paper.value.schoolName}`,
      to: `/exam-papers/${paper.value.yearCode}-${levelSlug}-school-${schoolSlug}`,
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
      label: `${paper.value.schoolName} papers`,
      to: `/exam-papers/school-${schoolSlug}`,
    },
    {
      label: "Exam paper sitemap",
      to: "/sitemap",
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

onMounted(() => {
  if (paper.value) trackPaperOpen(filename, "viewer_page");
});

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    { name: "robots", content: computed(() => (paper.value ? "index, follow" : "noindex, follow")) },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:type", content: "article" },
    { property: "og:url", content: `https://sgexamhub.com/view/${filename}` },
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
              contentUrl: `https://sgexamhub.com/files/${filename}.pdf`,
              encodingFormat: "application/pdf",
            },
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
            @click="trackPaperDownload(filename, 'viewer_top')"
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
        <div v-if="loading" class="pdf-loading">
          <div class="spinner"></div>
          <p>Opening exam paper...</p>
        </div>
        <iframe
          v-else
          :src="pdfUrl"
          class="pdf-frame"
          title="Exam paper PDF viewer"
          frameborder="0"
        ></iframe>
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
              @click="trackPaperDownload(filename, 'viewer_panel')"
            >
              Download PDF
            </a>
            <a
              class="secondary-open"
              :href="pdfUrl"
              target="_blank"
              rel="noopener"
              @click="trackPaperDownload(filename, 'viewer_open_new_tab')"
            >
              Open in new tab
            </a>
          </div>
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
            <NuxtLink
              v-for="item in relatedPapers"
              :key="item.filename"
              :to="`/view/${item.filename}`"
              @click="trackPaperViewClick(item.filename, 'viewer_related')"
            >
              <span>{{ item.yearCode }} {{ item.schoolName }}</span>
              <small>{{ item.typeName }}</small>
            </NuxtLink>
          </div>
        </section>
      </aside>
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

.panel-card h2 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  margin: 0 0 0.75rem;
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

.related-paper-links a {
  border: 1px solid #e2e8f0;
  display: grid;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
}

.related-paper-links a:hover {
  border-color: #c7d2fe;
  text-decoration: none;
}

.related-paper-links small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
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

  .info-school {
    font-size: 0.95rem;
  }

  .info-meta {
    display: none;
  }
}
</style>
