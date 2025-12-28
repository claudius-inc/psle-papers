<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// --- SEO Configuration ---
useHead({
  title: 'Free Singapore Primary School Exam Papers | All Levels & Subjects',
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap' }
  ],
  meta: [
    { name: 'description', content: 'Access free Singapore primary school exam papers for all levels. Download quality assessment papers for Math, Science, and English. Perfect for PSLE preparation.' },
    { name: 'keywords', content: 'Singapore primary school exam papers, PSLE practice papers, Primary 1-6 exam papers, Free Singapore school papers, 新加坡小学试卷' },
    // Open Graph
    { property: 'og:title', content: 'Free Singapore Primary School Exam Papers' },
    { property: 'og:description', content: 'Download free primary school exam papers for all levels and subjects.' },
    { property: 'og:type', content: 'website' }
  ],
  script: [
    // Google Analytics 4
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-7WKP91PV8C',
      async: true
    },
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7WKP91PV8C');
      `,
      type: 'text/javascript'
    }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

// --- Interfaces ---
interface DropdownOption {
  code: string
  name: string
}

interface DropdownData {
  Level: DropdownOption[]
  Subject: DropdownOption[]
  Type: DropdownOption[]
  Year: DropdownOption[]
  School: DropdownOption[]
}

interface ParsedPaper {
  filename: string
  levelCode: string
  schoolCode: string
  subjectCode: string
  typeCode: string
  yearCode: string
  // Display names
  levelName: string
  schoolName: string
  subjectName: string
  typeName: string
}

// --- State ---
const loading = ref(true)
const rawFiles = ref<string[]>([])
const options = ref<DropdownData>({
  Level: [],
  Subject: [],
  Type: [],
  Year: [],
  School: []
})

const filters = ref({
  Level: '0',
  School: '0',
  Subject: '0',
  Type: '0',
  Year: '0'
})

const showFiltersMobile = ref(false)
const toggleFilters = () => {
  showFiltersMobile.value = !showFiltersMobile.value
}

const activeFilterCount = computed(() => {
  return Object.values(filters.value).filter(v => v !== '0').length
})

// --- Data Fetching ---
onMounted(async () => {
  try {
    const [filesRes, optionsRes] = await Promise.all([
      fetch('/json/files.json'),
      fetch('/json/dropdownOptions.json')
    ])
    
    rawFiles.value = await filesRes.json()
    options.value = await optionsRes.json()
  } catch (e) {
    console.error('Failed to load data', e)
  } finally {
    loading.value = false
  }
})

// --- Helpers ---
const getName = (category: keyof DropdownData, code: string): string => {
  const found = options.value[category]?.find(opt => opt.code === code)
  return found ? found.name : code
}

// --- Computed ---
const allPapers = computed<ParsedPaper[]>(() => {
  if (loading.value) return []
  
  return rawFiles.value.map(filename => {
    // Format: Level_School_Subject_Type_Year
    const parts = filename.split('_')
    if (parts.length !== 5) return null // Skip invalid

    const [levelCode, schoolCode, subjectCode, typeCode, yearCode] = parts as [string, string, string, string, string]

    return {
      filename,
      levelCode,
      schoolCode,
      subjectCode,
      typeCode,
      yearCode,
      levelName: getName('Level', levelCode),
      schoolName: getName('School', schoolCode),
      subjectName: getName('Subject', subjectCode),
      typeName: getName('Type', typeCode)
    }
  }).filter((p): p is ParsedPaper => p !== null)
})

const filteredPapers = computed(() => {
  return allPapers.value.filter(paper => {
    const f = filters.value
    if (f.Level !== '0' && paper.levelCode !== f.Level) return false
    if (f.School !== '0' && paper.schoolCode !== f.School) return false
    if (f.Subject !== '0' && paper.subjectCode !== f.Subject) return false
    if (f.Type !== '0' && paper.typeCode !== f.Type) return false
    if (f.Year !== '0' && paper.yearCode !== f.Year) return false
    return true
  })
})

const resultCount = computed(() => filteredPapers.value.length)
const totalPaperCountRounded = computed(() => {
  const count = allPapers.value.length
  return Math.floor(count / 100) * 100
})

const resetFilters = () => {
  filters.value = {
    Level: '0',
    School: '0',
    Subject: '0',
    Type: '0',
    Year: '0'
  }
}

const downloadPaper = (filename: string) => {
  window.open(`/files/${filename}.pdf`, '_blank')
}
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
        <h1 class="title">Singapore Primary School <span class="text-gradient">Exam Papers</span></h1>
        <p class="subtitle">Access thousands of free high-quality assessment papers from top schools. Download instantly and start practicing today.</p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ totalPaperCountRounded.toLocaleString() }}+</span>
            <span class="stat-label">Papers</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">All</span>
            <span class="stat-label">Subjects</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">P1 - P6</span>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></svg>
          <span v-if="activeFilterCount === 0">Filter Papers</span>
          <span v-else>Active Filters ({{ activeFilterCount }})</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron" :class="{ 'rotated': showFiltersMobile }"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>

      <div class="content-wrapper filter-container">
        <div class="filter-grid">
          <div class="filter-group">
            <label>Level</label>
            <select v-model="filters.Level">
              <option v-for="opt in options.Level" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Subject</label>
            <select v-model="filters.Subject">
              <option v-for="opt in options.Subject" :key="opt.code" :value="opt.code">{{ opt.name }}</option>
            </select>
          </div>

          <div class="filter-group">
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
    </div>

    <!-- Main Content -->
    <main class="content-wrapper main-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading exam papers...</p>
      </div>

      <div v-else>
        <div class="results-header">
          <div class="results-meta">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h2>Showing <strong>{{ resultCount }}</strong> available papers</h2>
          </div>
        </div>

        <div v-if="resultCount === 0" class="empty-state">
          <span class="emoji">🔍</span>
          <h3>No papers found</h3>
          <p>Try adjusting your filters to find what you're looking for.</p>
          <button class="primary-btn" @click="resetFilters">Clear Filters</button>
        </div>

        <div v-else class="papers-grid">
          <div v-for="paper in filteredPapers" :key="paper.filename" class="paper-card">
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

            <button class="download-btn" @click="downloadPaper(paper.filename)">
              Download PDF
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer>
      <p>&copy; 2025 Dreamon.im - Singapore Primary School Exam Papers</p>
    </footer>
  </div>
</template>

<style scoped>
/* Reset & Base */
* {
  box-sizing: border-box;
}

.app-container {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  background-color: #f1f5f9; /* Slate 100 - slightly darker and more defined */
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
  font-family: 'Plus Jakarta Sans', sans-serif;
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
  font-family: 'Outfit', sans-serif;
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
  .title { font-size: 2.25rem; }
}

.text-gradient {
  color: #4f46e5; /* Match primary download button color */
}

.subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
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
  font-family: 'Outfit', sans-serif;
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
  .hero-stats { gap: 1.5rem; }
  .stat-divider { display: none; }
  .hero-stats { flex-wrap: wrap; }
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
  font-family: 'Plus Jakarta Sans', sans-serif;
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
    max-height: 800px; /* Allow enough space for expanded filters */
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Results Section */
.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
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

/* Papers Grid */
.papers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
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
  flex-grow: 1; /* Pushes content down */
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

.download-btn {
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
}

.download-btn:hover {
  background-color: #4338ca;
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

/* Footer */
footer {
  background-color: white;
  border-top: 1px solid #e2e8f0;
  padding: 2rem 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 640px) {
  .title { font-size: 1.875rem; }
  .filter-grid { grid-template-columns: 1fr; }
  .school-select { grid-column: span 1; }
}
</style>
