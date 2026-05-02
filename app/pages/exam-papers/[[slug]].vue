<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import dropdownOptions from "../../../public/json/dropdownOptions.json";
import type { DropdownData } from "~/composables/usePapers";
import {
  seoRoutes,
  getSeoRouteBySlug,
  allParsedPapers,
} from "~/utils/paperSeo";

const route = useRoute();
const slugParam = route.params.slug;
const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
const seoRoute = getSeoRouteBySlug(slug);

if (!seoRoute) {
  throw createError({ statusCode: 404, statusMessage: "Exam paper index not found" });
}

const options = dropdownOptions as DropdownData;

// Locked filters come from the URL slug; they can't be edited inline (use Quick Browse to switch).
const lockedLevel = seoRoute.levelCode || "";
const lockedSubject = seoRoute.subjectCode || "";
const lockedYear = seoRoute.year || "";

const initialFilters = () => ({
  Level: lockedLevel || "0",
  Subject: lockedSubject || "0",
  Year: lockedYear || "0",
  Type: "0",
  School: "0",
});

const filters = ref(initialFilters());
const resetFilters = () => {
  filters.value = initialFilters();
};

const filteredPapers = computed(() =>
  allParsedPapers.filter((paper) => {
    const f = filters.value;
    if (f.Level !== "0" && paper.levelCode !== f.Level) return false;
    if (f.School !== "0" && paper.schoolCode !== f.School) return false;
    if (f.Subject !== "0" && paper.subjectCode !== f.Subject) return false;
    if (f.Type !== "0" && paper.typeCode !== f.Type) return false;
    if (f.Year !== "0" && paper.yearCode !== f.Year) return false;
    return true;
  }),
);

const resultCount = computed(() => filteredPapers.value.length);

// View mode (grid vs list) — shared with homepage via localStorage.
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
};

const relatedRoutes = computed(() =>
  seoRoutes
    .filter((item) => item.path !== seoRoute!.path)
    .filter((item) => {
      if (!seoRoute!.year && !seoRoute!.levelCode && !seoRoute!.subjectCode) {
        return !item.year && (!item.levelCode || !item.subjectCode);
      }
      if (seoRoute!.year && item.year === seoRoute!.year) return true;
      if (seoRoute!.levelCode && item.levelCode === seoRoute!.levelCode) return true;
      if (seoRoute!.subjectCode && item.subjectCode === seoRoute!.subjectCode) {
        return true;
      }
      return false;
    })
    .slice(0, 24),
);

const pageUrl = `https://sgexamhub.com${seoRoute.path}`;

useHead({
  title: seoRoute.title,
  meta: [
    { name: "description", content: seoRoute.description },
    { property: "og:title", content: seoRoute.title },
    { property: "og:description", content: seoRoute.description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: pageUrl },
  ],
  link: [{ rel: "canonical", href: pageUrl }],
});
</script>

<template>
  <div class="index-page">
    <header class="index-hero">
      <div class="content-wrapper">
        <NuxtLink class="back-link" to="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to SG Exam Hub
        </NuxtLink>
        <h1>{{ seoRoute.title.replace(" | SG Exam Hub", "") }}</h1>
        <p>{{ seoRoute.description }}</p>
      </div>
    </header>

    <!-- Filter bar (locked fields hidden) -->
    <div class="filter-container">
      <div class="content-wrapper filter-grid">
        <span class="filter-label">FILTER</span>
        <div v-if="!lockedLevel" class="filter-group">
          <label>Level</label>
          <select v-model="filters.Level">
            <option v-for="opt in options.Level" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedSubject" class="filter-group">
          <label>Subject</label>
          <select v-model="filters.Subject">
            <option v-for="opt in options.Subject" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div v-if="!lockedYear" class="filter-group">
          <label>Year</label>
          <select v-model="filters.Year">
            <option v-for="opt in options.Year" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Exam Type</label>
          <select v-model="filters.Type">
            <option v-for="opt in options.Type" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <div class="filter-group school-select">
          <label>School</label>
          <select v-model="filters.School">
            <option v-for="opt in options.School" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
          </select>
        </div>
        <button class="reset-btn" @click="resetFilters">Reset Filters</button>
      </div>
    </div>

    <main class="content-wrapper main-content">
      <!-- Quick Browse -->
      <nav class="quick-browse" aria-label="Quick browse by level">
        <span class="quick-browse-label">QUICK BROWSE</span>
        <div class="quick-browse-chips">
          <NuxtLink to="/" class="chip">
            <span class="chip-dot" aria-hidden="true"></span>All Papers
          </NuxtLink>
          <NuxtLink
            v-for="lvl in [6, 5, 4, 3]"
            :key="lvl"
            :to="`/exam-papers/primary-${lvl}`"
            class="chip"
            exact-active-class="chip-active"
          >
            <span class="chip-dot" aria-hidden="true"></span>P{{ lvl }} Papers
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
            Showing <strong>{{ resultCount }}</strong> available papers
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
        <button class="primary-btn" @click="resetFilters">Clear Filters</button>
      </div>

      <div v-else :class="['papers-container', `papers-${viewMode}`]">
        <div
          v-for="paper in filteredPapers"
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
          <NuxtLink class="view-btn" :to="`/view/${paper.filename}`">
            View Paper
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </NuxtLink>
        </div>
      </div>

      <section class="related-section" aria-labelledby="related-indexes">
        <h2 id="related-indexes">Browse related indexes</h2>
        <div class="related-links">
          <NuxtLink
            v-for="item in relatedRoutes"
            :key="item.path"
            :to="item.path"
          >
            {{ item.title.replace(" | SG Exam Hub", "") }}
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  background: #ffffff;
  color: #1e293b;
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.index-hero {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  padding: 2.5rem 0 3rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #4f46e5;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 1rem;
}

.back-link:hover {
  color: #4338ca;
  text-decoration: underline;
}

.index-hero h1 {
  color: #0f172a;
  font-size: 2.25rem;
  line-height: 1.15;
  margin: 0.5rem 0 0.75rem;
}

.index-hero p {
  color: #475569;
  line-height: 1.6;
  max-width: 680px;
  margin: 0;
}

.main-content {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

/* Filter bar (mirrors homepage) */
.filter-container {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.25rem 0;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #94a3b8;
  align-self: center;
  margin-right: 0.25rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 140px;
}

.filter-group.school-select {
  flex: 1 1 220px;
}

.filter-group label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-group select {
  padding: 0.55rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #1e293b;
  font-size: 0.9rem;
  font-family: inherit;
}

.filter-group select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.reset-btn {
  margin-left: auto;
  padding: 0.55rem 1rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.reset-btn:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* Quick Browse */
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

/* Results header */
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

/* Cards (mirrors homepage) */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.papers-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.view-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  text-decoration: none;
}

.view-btn:hover {
  background-color: #4338ca;
}

/* List view overrides */
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

.papers-list .view-btn {
  width: auto;
  flex-shrink: 0;
  padding: 0.6rem 1.25rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-state .emoji {
  font-size: 3rem;
}

.empty-state h3 {
  margin: 0.75rem 0 0.5rem;
  color: #0f172a;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 1.25rem;
}

.primary-btn {
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

/* Related indexes */
.related-section {
  margin-top: 3rem;
}

.related-section h2 {
  color: #0f172a;
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.related-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}

.related-links a {
  color: #334155;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
}

.related-links a:hover {
  color: #2563eb;
  border-color: #c7d2fe;
}

@media (max-width: 640px) {
  .index-hero h1 {
    font-size: 1.875rem;
  }
  .filter-grid {
    flex-direction: column;
    align-items: stretch;
  }
  .reset-btn {
    margin-left: 0;
  }
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
  .papers-list .view-btn {
    width: 100%;
  }
}
</style>
