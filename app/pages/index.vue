<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";
import rawFileList from "../../public/json/files.json";
import dropdownOptions from "../../public/json/dropdownOptions.json";
import {
  trackEvent,
  trackPaperDownload,
  trackPaperViewClick,
} from "~/utils/analytics";

const featuredOptions = dropdownOptions as DropdownData;
const loading = ref(false);
const options = ref<DropdownData>(featuredOptions);

const getFeaturedName = (category: keyof DropdownData, code: string): string => {
  const found = featuredOptions[category]?.find((opt) => opt.code === code);
  return found ? found.name : code;
};

const parseFeaturedFilename = (filename: string): ParsedPaper | null => {
  const parts = filename.split("_");
  if (parts.length !== 5) return null;

  const [levelCode, schoolCode, subjectCode, typeCode, yearCode] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];

  return {
    filename,
    levelCode,
    schoolCode,
    subjectCode,
    typeCode,
    yearCode,
    levelName: getFeaturedName("Level", levelCode),
    schoolName: getFeaturedName("School", schoolCode),
    subjectName: getFeaturedName("Subject", subjectCode),
    typeName: getFeaturedName("Type", typeCode),
  };
};

const featuredPapers = computed(() =>
  (rawFileList as string[])
    .map((filename) => parseFeaturedFilename(filename))
    .filter((p): p is ParsedPaper => p !== null)
    // Sort newest first by year, then by level desc so P6 surfaces above lower levels.
    .sort((a, b) => {
      if (a.yearCode !== b.yearCode) return Number(b.yearCode) - Number(a.yearCode);
      return Number(b.levelCode) - Number(a.levelCode);
    })
    .slice(0, 12),
);

const homeItemListElements = computed(() =>
  (rawFileList as string[])
    .map((filename) => parseFeaturedFilename(filename))
    .filter((paper): paper is ParsedPaper => paper !== null)
    .sort((a, b) => {
      if (a.yearCode !== b.yearCode) return Number(b.yearCode) - Number(a.yearCode);
      if (a.levelCode !== b.levelCode) return Number(b.levelCode) - Number(a.levelCode);
      return a.schoolCode.localeCompare(b.schoolCode);
    })
    .slice(0, 30)
    .map((paper, index) => ({
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

const examPaperDirectorySections = [
  {
    title: "Primary exam papers by level",
    links: [6, 5, 4, 3, 2].map((level) => ({
      label: `Primary ${level} Exam Papers`,
      to: `/exam-papers/primary-${level}`,
    })),
  },
  {
    title: "Popular subject collections",
    links: [
      { label: "Primary 6 Maths Exam Papers", to: "/exam-papers/primary-6-mathematics" },
      { label: "Primary 6 Science Exam Papers", to: "/exam-papers/primary-6-science" },
      { label: "Primary 6 English Exam Papers", to: "/exam-papers/primary-6-english" },
      { label: "Primary 5 Maths Exam Papers", to: "/exam-papers/primary-5-mathematics" },
      { label: "Primary 5 Science Exam Papers", to: "/exam-papers/primary-5-science" },
      { label: "Primary 4 Maths Exam Papers", to: "/exam-papers/primary-4-mathematics" },
      { label: "Higher Chinese Exam Papers", to: "/exam-papers/higher-chinese" },
      { label: "2025 Primary Exam Papers", to: "/exam-papers/2025" },
      { label: "2025 Primary 6 Exam Papers", to: "/exam-papers/2025-primary-6" },
      { label: "2025 Maths Exam Papers", to: "/exam-papers/2025-mathematics" },
      { label: "2024 Primary 6 Exam Papers", to: "/exam-papers/2024-primary-6" },
      { label: "2024 Science Exam Papers", to: "/exam-papers/2024-science" },
    ],
  },
  {
    title: "Assessment type collections",
    links: [
      { label: "SA2 Exam Papers", to: "/exam-papers/sa2" },
      { label: "SA1 Exam Papers", to: "/exam-papers/sa1" },
      { label: "WA1 Exam Papers", to: "/exam-papers/wa1" },
      { label: "WA2 Exam Papers", to: "/exam-papers/wa2" },
      { label: "WA3 Exam Papers", to: "/exam-papers/wa3" },
      { label: "Practice Papers", to: "/exam-papers/practice-paper" },
      { label: "2025 Primary 6 SA2 Exam Papers", to: "/exam-papers/2025-primary-6-sa2" },
      { label: "Primary 6 SA1 Exam Papers", to: "/exam-papers/primary-6-sa1" },
      { label: "Primary 6 SA2 Exam Papers", to: "/exam-papers/primary-6-sa2" },
      { label: "Maths SA2 Exam Papers", to: "/exam-papers/mathematics-sa2" },
      { label: "Science SA2 Exam Papers", to: "/exam-papers/science-sa2" },
      { label: "English SA2 Exam Papers", to: "/exam-papers/english-sa2" },
    ],
  },
  {
    title: "Top school exam papers",
    links: [
      {
        label: "Raffles Girls' Primary School Exam Papers",
        to: "/exam-papers/school-raffles-girls-primary-school",
      },
      {
        label: "2025 Raffles Girls' Primary School Exam Papers",
        to: "/exam-papers/2025-school-raffles-girls-primary-school",
      },
      {
        label: "Nanyang Primary School Exam Papers",
        to: "/exam-papers/school-nanyang-primary-school",
      },
      {
        label: "2025 Nanyang Primary School Exam Papers",
        to: "/exam-papers/2025-school-nanyang-primary-school",
      },
      {
        label: "Henry Park Primary School Exam Papers",
        to: "/exam-papers/school-henry-park-primary-school",
      },
      {
        label: "2025 Henry Park Primary School Exam Papers",
        to: "/exam-papers/2025-school-henry-park-primary-school",
      },
      {
        label: "Ai Tong School Exam Papers",
        to: "/exam-papers/school-ai-tong-school",
      },
      {
        label: "Nan Hua Primary School Exam Papers",
        to: "/exam-papers/school-nan-hua-primary-school",
      },
      {
        label: "Rosyth School Exam Papers",
        to: "/exam-papers/school-rosyth-school",
      },
    ],
  },
];

const homeFaqItems = [
  {
    question: "Where can I find free Singapore primary school exam papers for 2026 revision?",
    answer:
      "You can use SG Exam Hub for 2026 revision by downloading the latest available 2025 and 2024 Singapore primary school exam papers from top schools across P2 to P6.",
  },
  {
    question: "Which levels and subjects are covered in the exam papers?",
    answer:
      "SG Exam Hub currently has Primary 2 to Primary 6 papers for English, Mathematics, Science, Chinese and Higher Chinese, depending on what is available for each school and year.",
  },
  {
    question: "Are papers from top schools like Nanyang and Raffles included?",
    answer:
      "Yes. The collection includes papers from schools such as Nanyang Primary School, Raffles Girls' Primary School, Henry Park Primary School, Catholic High School and more.",
  },
  {
    question: "Should students view papers online or download the PDF?",
    answer:
      "Open a paper online first to check the level, subject, school and exam type, then download useful PDFs for timed practice, marking and repeated revision.",
  },
];

const siteNavigationItems = examPaperDirectorySections
  .flatMap((section) => section.links)
  .slice(0, 30)
  .map((link) => ({
    "@type": "SiteNavigationElement",
    name: link.label,
    url: `https://sgexamhub.com${link.to}`,
  }));

// --- SEO Configuration ---
useHead({
  title:
    "Free Singapore Primary Exam Papers for 2026 Revision | P2-P6",
  meta: [
    {
      name: "description",
      content:
        "Prepare for 2026 with free Singapore primary school exam papers. Download 2,300+ latest 2025 and 2024 PDFs from top schools for Maths, Science, English and Chinese.",
    },
    {
      name: "keywords",
      content:
        "Singapore primary school exam papers 2026 revision, 2025 exam papers, 2024 test papers, free exam papers download, top school papers, PSLE practice papers, P2-P6 exam papers, SA2 SA1 WA papers, Maths Science English Chinese, 新加坡小学试卷",
    },
    // Open Graph
    {
      property: "og:title",
      content: "Free Singapore Primary School Exam Papers for 2026 Revision",
    },
    {
      property: "og:description",
      content:
        "Access 2,300+ latest 2025 and 2024 primary school exam paper PDFs from top Singapore schools for P2-P6 revision.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://sgexamhub.com" },
  ],
  link: [{ rel: "canonical", href: "https://sgexamhub.com/" }],
  script: [
    // Structured data for crawlers and rich result eligibility.
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify([
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": "https://sgexamhub.com/#website",
            name: "SG Exam Hub",
            alternateName: "Singapore Exam Hub",
            url: "https://sgexamhub.com/",
            description:
              "Free Singapore primary school exam papers for P2 to P6 English, Maths, Science, Chinese and Higher Chinese.",
            hasPart: siteNavigationItems,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": "https://sgexamhub.com/#organization",
            name: "SG Exam Hub",
            url: "https://sgexamhub.com/",
            logo: "https://sgexamhub.com/favicon.ico",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: homeFaqItems.map((item) => ({
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
            name: "Latest Singapore primary school exam papers",
            numberOfItems: homeItemListElements.value.length,
            itemListElement: homeItemListElements.value,
          },
      ]),
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
});

// --- State ---
const rawFiles = ref<string[]>(rawFileList as string[]);
const filters = ref({
  Level: "0",
  School: "0",
  Subject: "0",
  Type: "0",
  Year: "0",
});

const showFiltersMobile = ref(false);
const toggleFilters = () => {
  showFiltersMobile.value = !showFiltersMobile.value;
};

const activeFilterCount = computed(() => {
  return Object.values(filters.value).filter((v) => v !== "0").length;
});

// --- Data Fetching ---
onMounted(async () => {
  try {
    const filesRes = await fetch("/json/files.json");
    rawFiles.value = await filesRes.json();
  } catch (e) {
    console.error("Failed to load data", e);
  }
});

// --- Computed ---
const allPapers = computed(() => {
  return rawFiles.value
    .map((filename) => parseFeaturedFilename(filename))
    .filter((p): p is ParsedPaper => p !== null)
    // Newest first: year desc, then level desc within a year, then school asc.
    .sort((a, b) => {
      if (a.yearCode !== b.yearCode) return Number(b.yearCode) - Number(a.yearCode);
      if (a.levelCode !== b.levelCode) return Number(b.levelCode) - Number(a.levelCode);
      return a.schoolCode.localeCompare(b.schoolCode);
    });
});

const filteredPapers = computed(() => {
  return allPapers.value.filter((paper) => {
    const f = filters.value;
    if (f.Level !== "0" && paper.levelCode !== f.Level) return false;
    if (f.School !== "0" && paper.schoolCode !== f.School) return false;
    if (f.Subject !== "0" && paper.subjectCode !== f.Subject) return false;
    if (f.Type !== "0" && paper.typeCode !== f.Type) return false;
    if (f.Year !== "0" && paper.yearCode !== f.Year) return false;
    return true;
  });
});

const visibleLimit = ref(60);
const visiblePapers = computed(() => filteredPapers.value.slice(0, visibleLimit.value));
const resultCount = computed(() => filteredPapers.value.length);
const canShowMore = computed(() => visiblePapers.value.length < resultCount.value);
const showMorePapers = () => {
  visibleLimit.value += 60;
  trackEvent("paper_show_more", {
    source: "home_results",
    visible_count: visiblePapers.value.length,
    result_count: resultCount.value,
  });
};
const trackFilterChange = (
  filterName: keyof typeof filters.value,
  filterValue: string,
) => {
  visibleLimit.value = 60;
  trackEvent("paper_filter_change", {
    source: "home_filters",
    filter_name: filterName,
    filter_value: filterValue,
    result_count: resultCount.value,
  });
};

// View mode (grid vs list) — persists across page loads via localStorage.
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
    source: "home_results",
    mode,
  });
};
const totalPaperCountRounded = computed(() => {
  const count = (rawFileList as string[]).length;
  return Math.floor(count / 100) * 100;
});

const resetFilters = () => {
  visibleLimit.value = 60;
  filters.value = {
    Level: "0",
    School: "0",
    Subject: "0",
    Type: "0",
    Year: "0",
  };
  trackEvent("paper_filters_reset", {
    source: "home_filters",
  });
};
</script>

<template>
  <div class="app-container">
    <!-- Header -->
    <header class="hero">
      <div class="hero-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
        <div class="blob blob-3"></div>
      </div>
      <div class="content-wrapper hero-content">
        <div class="tagline">Exam Papers Preparation Portal</div>
        <h1 class="title">
          Singapore Primary School
          <span class="text-gradient">Exam Papers</span>
        </h1>
        <p class="subtitle">
          Prepare for 2026 with thousands of free assessment papers from top
          Singapore schools. View online or download PDFs for practice.
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value"
              >{{ totalPaperCountRounded.toLocaleString() }}+</span
            >
            <span class="stat-label">Papers</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">All</span>
            <span class="stat-label">Subjects</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">P2 - P6</span>
            <span class="stat-label">Levels</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Filters Bar -->
    <div class="filters-bar" :class="{ 'is-expanded': showFiltersMobile }">
      <!-- Mobile Toggle Button -->
      <button class="mobile-filter-toggle" @click="toggleFilters">
        <div class="toggle-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="2" y1="14" x2="6" y2="14"></line>
            <line x1="10" y1="8" x2="14" y2="8"></line>
            <line x1="18" y1="16" x2="22" y2="16"></line>
          </svg>
          <span v-if="activeFilterCount === 0">Filter Papers</span>
          <span v-else>Active Filters ({{ activeFilterCount }})</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="chevron"
          :class="{ rotated: showFiltersMobile }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      <div class="content-wrapper filter-container">
        <div class="filter-grid">
          <div class="filter-group">
            <label>Level</label>
            <select
              v-model="filters.Level"
              @change="trackFilterChange('Level', filters.Level)"
            >
              <option
                v-for="opt in options.Level"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Subject</label>
            <select
              v-model="filters.Subject"
              @change="trackFilterChange('Subject', filters.Subject)"
            >
              <option
                v-for="opt in options.Subject"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Year</label>
            <select
              v-model="filters.Year"
              @change="trackFilterChange('Year', filters.Year)"
            >
              <option
                v-for="opt in options.Year"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label>Exam Type</label>
            <select
              v-model="filters.Type"
              @change="trackFilterChange('Type', filters.Type)"
            >
              <option
                v-for="opt in options.Type"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <div class="filter-group school-select">
            <label>School</label>
            <select
              v-model="filters.School"
              @change="trackFilterChange('School', filters.School)"
            >
              <option
                v-for="opt in options.School"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.name }}
              </option>
            </select>
          </div>

          <button class="reset-btn" @click="resetFilters">Reset Filters</button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="content-wrapper main-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading exam papers...</p>
      </div>

      <div v-else>
        <nav class="quick-browse" aria-label="Quick browse exam paper indexes">
          <span class="quick-browse-label">QUICK BROWSE</span>
          <div class="quick-browse-chips">
            <NuxtLink to="/" class="chip" exact-active-class="chip-active">
              <span class="chip-dot" aria-hidden="true"></span>All Papers
            </NuxtLink>
            <NuxtLink
              v-for="level in [6, 5, 4, 3]"
              :key="level"
              :to="`/exam-papers/primary-${level}`"
              class="chip"
            >
              <span class="chip-dot" aria-hidden="true"></span>P{{ level }} Papers
            </NuxtLink>
            <NuxtLink to="/exam-papers/higher-chinese" class="chip">
              <span class="chip-dot" aria-hidden="true"></span>Higher Chinese
            </NuxtLink>
          </div>
        </nav>

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
              Showing <strong>{{ visiblePapers.length }}</strong> of
              <strong>{{ resultCount }}</strong> available papers
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
          <button class="primary-btn" @click="resetFilters">
            Clear Filters
          </button>
        </div>

        <div v-else :class="['papers-container', `papers-${viewMode}`]">
          <div
            v-for="paper in visiblePapers"
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
                @click="trackPaperViewClick(paper.filename, 'home_results')"
              >
                View Paper
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </NuxtLink>
              <a
                class="download-btn"
                :href="`/files/${paper.filename}.pdf`"
                :download="`${paper.yearCode}-${paper.levelName}-${paper.subjectName}-${paper.typeName}-${paper.schoolName}.pdf`"
                @click="trackPaperDownload(paper.filename, 'home_results')"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>

        <div v-if="canShowMore" class="load-more-wrap">
          <button class="load-more-btn" type="button" @click="showMorePapers">
            Show more papers
          </button>
        </div>
      </div>
    </main>

    <section class="content-wrapper seo-directory" aria-labelledby="paper-directory">
      <div class="seo-directory-intro">
        <h2 id="paper-directory">Browse Singapore primary school exam papers</h2>
        <p>
          Find free exam papers for 2026 revision by primary level, subject,
          assessment type, year and top Singapore schools. Each collection opens a focused index for viewing
          papers online or downloading PDF test papers.
        </p>
      </div>
      <div class="directory-grid">
        <section
          v-for="section in examPaperDirectorySections"
          :key="section.title"
          class="directory-column"
          :aria-labelledby="section.title.replaceAll(' ', '-')"
        >
          <h3 :id="section.title.replaceAll(' ', '-')">{{ section.title }}</h3>
          <div class="directory-links">
            <NuxtLink
              v-for="link in section.links"
              :key="link.to"
              :to="link.to"
            >
              {{ link.label }}
            </NuxtLink>
          </div>
        </section>
      </div>
    </section>

    <section class="content-wrapper seo-links" aria-labelledby="latest-papers">
      <div class="seo-links-header">
        <h2 id="latest-papers">Latest exam papers</h2>
        <NuxtLink to="/exam-papers">Browse all indexed exam paper pages</NuxtLink>
      </div>
      <div class="latest-links">
        <NuxtLink
          v-for="paper in featuredPapers"
          :key="paper.filename"
          :to="`/view/${paper.filename}`"
        >
          {{ paper.yearCode }} {{ paper.levelName }} {{ paper.schoolName }}
          {{ paper.subjectName }} {{ paper.typeName }}
        </NuxtLink>
      </div>
    </section>

    <section class="content-wrapper home-faq" aria-labelledby="home-faq-heading">
      <div class="home-faq-header">
        <h2 id="home-faq-heading">Exam paper questions</h2>
        <p>
          Use these answers to choose the right Singapore primary school test
          papers before opening or downloading a PDF.
        </p>
      </div>
      <div class="home-faq-grid">
        <article
          v-for="item in homeFaqItems"
          :key="item.question"
          class="faq-card"
        >
          <h3>{{ item.question }}</h3>
          <p>{{ item.answer }}</p>
        </article>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-inner">
        <p>&copy; 2026 Dreamon.im &ndash; Singapore Primary School Exam Papers</p>
        <span class="footer-sep" aria-hidden="true">|</span>
        <NuxtLink to="/sitemap">Sitemap</NuxtLink>
        <span class="footer-sep" aria-hidden="true">|</span>
        <a href="https://www.moe.gov.sg/" rel="noopener" target="_blank">Ministry of Education</a>
        <span class="footer-sep" aria-hidden="true">|</span>
        <a href="https://www.seab.gov.sg/" rel="noopener" target="_blank" aria-label="Singapore Examinations and Assessment Board">SEAB</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Reset & Base */
* {
  box-sizing: border-box;
}

.app-container {
  font-family:
    "Plus Jakarta Sans",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
  min-height: 100vh;
  background-color: #ffffff;
  color: #1e293b;
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  width: 100%;
}

/* Hero Section */
.hero {
  position: relative;
  background-color: #f1f5f9;
  color: #0f172a;
  padding: 5rem 0 4rem;
  overflow: hidden;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-image: radial-gradient(#cbd5e1 0.8px, transparent 0.8px);
  background-size: 24px 24px;
  opacity: 0.5;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.tagline {
  font-family: "Plus Jakarta Sans", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.7rem;
  font-weight: 700;
  background: #f1f5f9;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.title {
  font-family: "Outfit", sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.25rem;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #0f172a;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.25rem;
  }
}

.text-gradient {
  color: #4f46e5;
}

.subtitle {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.125rem;
  color: #475569;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  max-width: 600px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-family: "Outfit", sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e2e8f0;
}

@media (max-width: 640px) {
  .hero-stats {
    gap: 1.5rem;
  }
  .stat-divider {
    display: none;
  }
  .hero-stats {
    flex-wrap: wrap;
  }
}

.filters-bar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.mobile-filter-toggle {
  display: none;
  width: calc(100% - 3rem);
  margin: 0 auto;
  padding: 0.75rem 1.25rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1e293b;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.mobile-filter-toggle .toggle-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-filter-toggle svg {
  color: #4f46e5;
}

.chevron {
  transition: transform 0.3s ease;
  color: #94a3b8 !important;
}

.chevron.rotated {
  transform: rotate(180deg);
}

@media (max-width: 768px) {
  .filters-bar {
    padding: 0.75rem 0;
  }

  .mobile-filter-toggle {
    display: flex;
  }

  .filter-container {
    display: none;
    padding-top: 1rem;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .is-expanded .filter-container {
    display: block;
    max-height: 800px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding-bottom: 0.5rem;
  }

  .school-select {
    grid-column: span 1;
  }
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1rem;
  align-items: end;
}

.school-select {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .school-select {
    grid-column: span 1;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

select {
  padding: 0.625rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.95rem;
  color: #1e293b;
  width: 100%;
  transition: all 0.2s;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.reset-btn {
  padding: 0.625rem 1rem;
  background-color: transparent;
  border: 1px solid #cbd5e1;
  color: #64748b;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* Main Content */
.main-content {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #64748b;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Results Section */
.quick-browse {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.quick-browse-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #94a3b8;
  margin-bottom: 0.6rem;
}

.quick-browse-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
}

.chip:hover {
  color: #4f46e5;
  border-color: #c7d2fe;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c7d2fe;
}

.chip.chip-active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4338ca;
  font-weight: 600;
}

.chip.chip-active .chip-dot {
  background: #4f46e5;
}

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

/* Papers — grid view */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Papers — list view: full-width horizontal rows */
.papers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

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

@media (max-width: 640px) {
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

.load-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.load-more-btn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 800;
  min-height: 44px;
  padding: 0.75rem 1.4rem;
}

.load-more-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 1rem;
  border: 2px dashed #e2e8f0;
}

.emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.primary-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.seo-directory {
  padding-bottom: 3rem;
}

.seo-directory-intro {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  margin-bottom: 1.25rem;
}

.seo-directory h2 {
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.25;
  margin: 0 0 0.5rem;
}

.seo-directory p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0;
}

.directory-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.directory-column {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.25rem;
  background: #ffffff;
}

.directory-column h3 {
  color: #0f172a;
  font-size: 0.95rem;
  line-height: 1.35;
  margin: 0 0 0.9rem;
}

.directory-links {
  display: grid;
  gap: 0.65rem;
}

.directory-links a {
  color: #334155;
  font-size: 0.9rem;
  font-weight: 650;
  line-height: 1.35;
  text-decoration: none;
}

.directory-links a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.seo-links {
  padding-bottom: 3rem;
}

.seo-links h2 {
  color: #0f172a;
  font-size: 1rem;
  margin: 0;
}

.seo-links-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.seo-links-header a {
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}

.latest-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
}

.latest-links a {
  color: #334155;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
}

.latest-links a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.seo-links-header a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.home-faq {
  padding-bottom: 3rem;
}

.home-faq-header {
  border-top: 1px solid #e2e8f0;
  padding-top: 2rem;
  margin-bottom: 1.25rem;
}

.home-faq h2 {
  color: #0f172a;
  font-size: 1.4rem;
  line-height: 1.25;
  margin: 0 0 0.5rem;
}

.home-faq-header p {
  color: #475569;
  line-height: 1.65;
  max-width: 760px;
  margin: 0;
}

.home-faq-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.faq-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 1.1rem;
}

.faq-card h3 {
  color: #0f172a;
  font-size: 0.98rem;
  line-height: 1.4;
  margin: 0 0 0.55rem;
}

.faq-card p {
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
  margin: 0;
}

/* Footer */
footer {
  background-color: white;
  border-top: 1px solid #e2e8f0;
  padding: 2rem 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

.footer-inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem 1.25rem;
}

.footer-inner p {
  margin: 0;
}

.footer-sep {
  color: #cbd5e1;
  user-select: none;
}

.footer-inner a {
  color: #475569;
  font-weight: 500;
  text-decoration: none;
}

.footer-inner a:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 640px) {
  .title {
    font-size: 1.875rem;
  }
  .filter-grid {
    grid-template-columns: 1fr;
  }
	  .school-select {
	    grid-column: span 1;
	  }
	  .directory-grid {
	    grid-template-columns: 1fr;
	  }
	  .seo-links-header {
	    align-items: flex-start;
	    flex-direction: column;
  }
  .home-faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
