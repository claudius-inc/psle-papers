<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { DropdownData, ParsedPaper } from "~/composables/usePapers";
import dropdownOptions from "../../../public/json/dropdownOptions.json";

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

const pageTitle = computed(() => {
  if (!paper.value) return "Loading Paper...";
  return `${paper.value.yearCode} ${paper.value.schoolName} ${paper.value.subjectName} ${paper.value.typeName}`;
});

const pdfUrl = computed(() => `/files/${filename}.pdf`);

useHead({
  title: computed(() => `Viewing: ${pageTitle.value} | SG Exam Hub`),
  meta: [{ name: "robots", content: "noindex, follow" }],
  link: [
    {
      rel: "canonical",
      href: `https://sgexamhub.com/view/${filename}`,
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
          <a class="download-action" :href="pdfUrl" :download="`${filename}.pdf`">
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

    <!-- PDF Viewer Area -->
    <div class="pdf-viewer">
      <div v-if="loading" class="pdf-loading">
        <div class="spinner"></div>
        <p>Opening exam paper...</p>
      </div>
      <iframe v-else :src="pdfUrl" class="pdf-frame" frameborder="0"></iframe>
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
  flex: 1;
  position: relative;
  background-color: #f1f5f9;
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
